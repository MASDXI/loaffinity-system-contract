// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../interface/IVotable.sol";

abstract contract Votable is IVotable {
    /**
     * @dev represent proposal Data
     */
    struct ProposalMeta {
        uint256                     proposalID;
        uint64                      proposedAt;
        uint64                      voteStart;
        uint64                      voteEnd;
        bool                        canceled;
        bool                        executed;
        address                     proposer;
    }

    mapping(uint256 => ProposalMeta) internal _proposalMetas;
    uint256 internal _voteDelay;
    uint256 internal _votePeriod;

    /**
     * @dev proposal meta getter
     */
    function getProposalMeta(uint256 proposalId) public view returns(ProposalMeta memory) {
        return _proposalMetas[proposalId];
    }

    /**
     * @dev get proposal status
     */
    function status(uint256 proposalId) public view virtual override returns (ProposalStatus) {
        ProposalMeta storage proposal = _proposalMetas[proposalId];
        require(proposal.proposalID != uint256(0), "proposal is not exists");

        if (proposal.executed) {
            return ProposalStatus.Executed;
        }

        if (proposal.canceled) {
            return ProposalStatus.Cancaled;
        }

        uint256 current = block.number;

        if (current < proposal.voteStart) {
            return ProposalStatus.Pending;
        }

        if (current <= proposal.voteEnd) {
            return ProposalStatus.Active;
        }

        if (_quorumReached(proposalId) && _voteSucceeded(proposalId)) {
            return ProposalStatus.Succeded;
        } else {
            return ProposalStatus.VotedOut;
        }
    }

    /**
     * @dev get user voting weight
     */
    function getVotes(address account, uint256 timepoint) public view virtual override returns (uint256) {
        return _getVotes(account, timepoint);
    }

    /**
     * @dev check if account already cast vote on the proposal
     */
    function hasVoted(uint256 proposalId, address account) public view virtual override returns(bool) {
        return _hasVoted(proposalId, account);
    }

    /**
     * @dev cast vote on a proposal
     */
    function castVote(uint256 proposalId, uint8 support) public virtual override returns (uint256) {
        ProposalMeta storage proposal = _proposalMetas[proposalId];
        require(status(proposalId) == ProposalStatus.Active, "proposal is not active");

        uint256 weight = _getVotes(msg.sender, proposal.voteStart);
        require(weight > 0, "no vote right");
        _countVote(proposalId, msg.sender, support, weight);

        emit VoteCast(msg.sender, proposalId, support);

        return weight;
    }

    /**
     * @dev to execute the proposal
     */
    function execute(uint256 proposalId) public virtual override returns (uint256) {
        require(status(proposalId) == ProposalStatus.Succeded, "Proposal is not successed");

        ProposalMeta storage meta = _proposalMetas[proposalId];

        meta.executed = true;

        emit ProposalExecuted(proposalId);
        
        _execute(proposalId);

        return proposalId;
    }

    /**
     * @dev propose a new proposal
     */
    function _propose(uint256 proposalId) internal returns(uint256) {
        ProposalMeta storage proposal = _proposalMetas[proposalId];
        require(proposal.proposalID == uint256(0), "proposal already exists");

        proposal.proposalID = proposalId;
        proposal.proposedAt = uint64(block.number);
        proposal.voteStart = uint64(block.number + votingDeley());
        proposal.voteEnd = uint64(proposal.voteStart + votingPeriod());
        proposal.proposer = msg.sender;

        emit ProposalCreated(proposalId);
        return proposalId;
    }

    /**
     * @dev verify if qourum reached
     */
    function _quorumReached(uint256 proposalId) internal view virtual returns (bool); //

    /**
     * @dev verify if qourum success
     */
    function _voteSucceeded(uint256 proposalId) internal view virtual returns (bool); //

    /**
     * @dev get votes
     */
    function _hasVoted(uint256 proposalId, address account) internal view virtual returns (bool);

    /**
     * @dev get votes
     */
    function _getVotes(address account, uint256 timepoint) internal view virtual returns (uint256); 

    /**
     * @dev count vote
     */
    function _countVote(uint256 proposalId, address account, uint8 support, uint256 weight) internal virtual;

    /**
     * @dev allow user to define execute logic
     */
    function _execute(uint256 proposalId) internal virtual returns (uint256);
}