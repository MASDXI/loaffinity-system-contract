// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../interfaces/IProposal.sol";

abstract contract Proposal is IProposal {

    uint256 internal _votePeriod;
    uint256 internal _voteDelay;

    mapping(bytes32 => bool) private _pass;
    mapping(bytes32 => ProposalInfo) private _proposals;
    mapping(address => mapping(bytes32 => VoteInfo)) private _votes;

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

    function vote(bytes32 proposalId, bool auth) external virtual returns (bool) {
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
        return true;
    }

    function _execute(bytes32 proposalId) internal virtual returns (bool) {
        require(_proposals[proposalId].status == ProposalStatus.PENDING, "proposal: proposal not pending");
        require(!_pass[proposalId], "proposal: proposal was passed");
        if (_proposals[proposalId].accept >= _proposals[proposalId].nVoter / 2 + 1) {
            _pass[proposalId] = true;
            _proposals[proposalId].status = ProposalStatus.EXECUTE;
            emit LogPassProposal(proposalId, block.timestamp);
            return true;
        }

        if (_proposals[proposalId].reject >= _proposals[proposalId].nVoter / 2 + 1) {
            _pass[proposalId] = false;
            _proposals[proposalId].status = ProposalStatus.REJECT;
            emit LogRejectProposal(proposalId, block.timestamp);
            return true;
        }

        return false;
    }

    function votingDeley() public virtual view returns (uint256) {}

    function votingPeriod() public virtual view returns (uint256) {}
}