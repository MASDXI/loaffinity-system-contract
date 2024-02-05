// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../interfaces/IProposal.sol";

abstract contract Proposal is IProposal {

    uint256 private _votePeriod;
    uint256 private _voteDelay;
    uint8 private _voteThreshold;
    uint32 private _proposePeriod;
    uint32 private _executeRetentionPeriod;

    uint8 private constant MAX_PROPOSAL = type(uint8).max;
    uint8 private constant MAX_THRESHOLD = 100;
    uint8 private constant MIN_THRESHOLD = 50;
    uint16 private constant MAX_FUTURE_BLOCK = type(uint16).max;

    mapping(bytes32 => bool) private _pass;
    mapping(bytes32 => ProposalInfo) private _proposals;
    mapping(address => mapping(bytes32 => VoteInfo)) private _votes;
    mapping(address => uint8) private _counter;
    mapping(address => uint256) private _latestProposal;

    function _setVotePeriod(uint256 period) internal {
        require(votingPeriod() != period,"proposal: this vote period value already set");
        _votePeriod = period;
    }

    function _setVoteDelay(uint256 delay) internal {
        require(votingDeley() != delay,"proposal: this vote delay value already set");
        _voteDelay = delay;
    }

    function _setProposePeriod(uint32 period) internal {
        require(proposePeriod() != period,"proposal: this propose period value already set");
        _proposePeriod = period;
    }

    function _setVoteThreshold(uint8 percentage) internal {
        require(percentage <= MAX_THRESHOLD,"proposal: greater than max threshold");
        require(percentage >= MIN_THRESHOLD,"proposal: less than min threshold");
        require(threshold() != percentage,"proposal: this vote threshold value already set");
        _voteThreshold = percentage;
    }

    function _setExecuteRetentionPeriod(uint32 period) internal {
        require(executeRetentionPeriod() != period,"proposal: this execution retention period value already set");
        _executeRetentionPeriod = period;
    }

    function _proposal(bytes32 proposalId, uint16 nvoter, uint256 blockNumber) internal virtual returns (bytes32) {
        uint256 blockTimeCache = block.timestamp;
        uint256 blockNumberCache = block.number;
        uint256 blockPeriodCache = (blockNumberCache + votingDeley() + votingPeriod() + executeRetentionPeriod());
        require(_proposals[proposalId].status == ProposalStatus.DEAFULT, "proposal: proposalId already exists");
        require(blockNumberCache < blockNumber, "proposal: propose past block");
        require(blockPeriodCache < blockNumber,"proposal: invalid blocknumber");
        require(blockNumber < blockPeriodCache + MAX_FUTURE_BLOCK,"proposal: block too future");
        require(_counter[msg.sender] < MAX_PROPOSAL, "proposal: propose max stack");
        require(blockNumberCache - _latestProposal[msg.sender] >= proposePeriod(), "proposal: propose again later");

        ProposalInfo memory proposal;
        proposal.proposer = msg.sender;
        proposal.nVoter = nvoter;
        proposal.createTime = blockTimeCache;
        proposal.startBlock = blockNumberCache + votingDeley();
        proposal.endBlock = blockNumberCache + votingDeley() + votingPeriod();
        proposal.activateBlock = blockNumber;
        proposal.status = ProposalStatus.PENDING;

        _proposals[proposalId] = proposal;
        _counter[msg.sender]++;
        _latestProposal[msg.sender] = blockNumberCache;

        emit LogCreateProposal(proposalId, msg.sender, blockTimeCache);
        return proposalId;
    }

    function isProposalPassed(bytes32 proposalId) external view override returns (bool) {
        return _pass[proposalId];
    }

    function _vote(bytes32 proposalId, bool auth) internal virtual {
        require(_proposals[proposalId].status != ProposalStatus.DEAFULT, "proposal: proposalId not exist");
        require(_votes[msg.sender][proposalId].voteTime == 0, "proposal: not allow to vote twice");
        require(block.number > _proposals[proposalId].startBlock, "proposal: proposal not start");
        require(block.number < _proposals[proposalId].endBlock, "proposal: proposal expired");

        _votes[msg.sender][proposalId].voteTime = block.timestamp;
        _votes[msg.sender][proposalId].voter = msg.sender;
        _votes[msg.sender][proposalId].auth = auth;

        if (auth) {
            _proposals[proposalId].accept = _proposals[proposalId].accept + 1;
        } else {
            _proposals[proposalId].reject = _proposals[proposalId].reject + 1;
        }
        
        emit LogVote(proposalId, msg.sender, auth, block.timestamp);
    }

    function _execute(bytes32 proposalId) internal virtual returns (bool success) {
        uint256 blockNumberCache = block.number;
        require(_proposals[proposalId].startBlock != 0, "proposal: proposal not exist");
        require(_proposals[proposalId].status == ProposalStatus.DEAFULT ||
                _proposals[proposalId].status == ProposalStatus.PENDING, "proposal: proposal not pending");
        require(_proposals[proposalId].endBlock < blockNumberCache, "proposal: are in voting period");
        require(_proposals[proposalId].activateBlock < blockNumberCache,"proposal: can't execute in retention period");
        address proposerCache = _proposals[proposalId].proposer;
        uint16 acceptCache = _proposals[proposalId].accept;
        uint16 rejectCache = _proposals[proposalId].reject;
        uint256 thresholdCache = (_proposals[proposalId].nVoter * uint256(threshold())) / 100;

        _counter[proposerCache]--;

        if (acceptCache != rejectCache &&
          (acceptCache >= thresholdCache || rejectCache >= thresholdCache) &&
          _proposals[proposalId].status == ProposalStatus.PENDING) {
            if (acceptCache > rejectCache) {
                _pass[proposalId] = true;
                _proposals[proposalId].status = ProposalStatus.EXECUTE;
                emit LogProposal(proposalId, block.timestamp, ProposalStatus.EXECUTE);
                success = true;
            }
            if (rejectCache > acceptCache) {
                _proposals[proposalId].status = ProposalStatus.REJECT;
                emit LogProposal(proposalId, block.timestamp, ProposalStatus.REJECT);
                success = false;
            }
        } else {
            _proposals[proposalId].status = ProposalStatus.REJECT;
            emit LogProposal(proposalId, block.timestamp, ProposalStatus.REJECT);
            success = false;
        }
    }

    function _cancelProposal(bytes32 proposalId) internal virtual {
        uint256 blockNumberCache = block.number;
        require(_proposals[proposalId].status == ProposalStatus.PENDING, "proposal: proposal not pending");
        require(_proposals[proposalId].endBlock < blockNumberCache, "proposal: are in voting period");
        require(proposals[proposalId].endBlock + executeRetentionPeriod() < blockNumberCache,"proposal: can't cancel after rentention period");
        _proposals[proposalId].status = ProposalStatus.REJECT;
        emit LogProposalCanceled(proposalId, block.timestamp, ProposalStatus.REJECT);
    }

    function threshold() public view override returns (uint8) {
        return _voteThreshold;
    }

    function votingDeley() public view override returns(uint256) {
        return _voteDelay;
    }

    function votingPeriod() public view override returns(uint256) {
        return _votePeriod;
    }

    function proposePeriod() public view override returns(uint32) {
        return _proposePeriod;
    }

    function executeRetentionPeriod() public view override returns(uint32) {
        return _executeRetentionPeriod;
    }

    function latestProposal(address account) public view override returns(uint256) {
        return _latestProposal[account];
    }
}