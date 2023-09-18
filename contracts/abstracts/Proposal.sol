// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../interfaces/IProposal.sol";

abstract contract Proposal is IProposal {

    uint256 private _votePeriod;
    uint256 private _voteDelay;
    uint8 private constant MAX_THRESHOLD = 100;
    uint8 private constant MIN_THERSHOLD = 50;
    uint8 private _threshold;

    mapping(bytes32 => bool) private _pass;
    mapping(bytes32 => ProposalInfo) private _proposals;
    mapping(address => mapping(bytes32 => VoteInfo)) private _votes;

    function _setPeriod(uint256 period) internal {
        _votePeriod = period;
    }

    function _setDelay(uint256 delay) internal {
        _voteDelay = delay;
    }

    function _setThreshold(uint8 percentage) internal {
        require(MAX_THRESHOLD <= 100,"proposal: greater than max threshold");
        require(MIN_THERSHOLD >= 50,"proposal: less than min threshold");
        _threshold = percentage;
    }

    function _proposal(bytes32 proposalId, uint16 nvoter) internal virtual returns (bytes32) {
        uint256 blockTimeCache = block.timestamp;
        uint256 blockNumberCache = block.number;
        require(_proposals[proposalId].createTime == 0, "proposal: proposalId already exists");

        ProposalInfo memory proposal;
        proposal.proposer = msg.sender;
        proposal.nVoter = nvoter;
        proposal.createTime = blockTimeCache;
        proposal.startBlock = blockNumberCache + votingDeley();
        proposal.endBlock = blockNumberCache + votingDeley() + votingPeriod();
        proposal.status = ProposalStatus.PENDING;

        _proposals[proposalId] = proposal;

        emit LogCreateProposal(proposalId, msg.sender, blockTimeCache);
        return proposalId;
    }

    function isProposalPassed(bytes32 proposalId) external view override returns (bool) {
        return _pass[proposalId];
    }

    function _vote(bytes32 proposalId, bool auth) internal virtual {
        require(_proposals[proposalId].createTime != 0, "proposal: proposalId not exist");
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

    function _execute(bytes32 proposalId) internal virtual returns (bool) {
        require(_proposals[proposalId].status == ProposalStatus.PENDING, "proposal: proposal not pending");
        require(!_pass[proposalId], "proposal: proposal was passed");
        if (_proposals[proposalId].accept >= (_proposals[proposalId].nVoter * uint256(threshold())) / 100) {
            _pass[proposalId] = true;
            _proposals[proposalId].status = ProposalStatus.EXECUTE;
            emit LogProposal(proposalId, block.timestamp, ProposalStatus.EXECUTE);
            return true;
        }

        if (_proposals[proposalId].reject >= (_proposals[proposalId].nVoter * uint256(threshold())) / 100) {
            _pass[proposalId] = false;
            _proposals[proposalId].status = ProposalStatus.REJECT;
            emit LogProposal(proposalId, block.timestamp, ProposalStatus.REJECT);
            return true;
        }

        return false;
    }

    function execute(uint256 blockNumber) public virtual override returns (uint256) {
        return blockNumber;
    }

    function threshold() public view override returns (uint8) {
        return _threshold;
    }

    function votingDeley() public view virtual override returns(uint256) {
        return _voteDelay;
    }

    function votingPeriod() public view virtual override returns(uint256) {
        return _votePeriod;
    }

}