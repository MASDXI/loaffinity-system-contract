// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Proposal.sol";

contract ProposalMock is Proposal {

    mapping(uint256 => bytes32) public blockProposal;

    constructor (uint256 voteDelay_, uint256 votePeriod_, uint8 threshold_, uint32 proposePeriod_) {
        _setVoteDelay(voteDelay_);
        _setVotePeriod(votePeriod_);
        _setVoteThreshold(threshold_);
        _setProposePeriod(proposePeriod_);
    }

    function propose(uint256 blocknumber, uint16 nvote) public returns(bool) {
        bytes32 proposalId = keccak256(abi.encode(msg.sender,blocknumber));
        blockProposal[blocknumber] = proposalId;
        _proposal(proposalId, nvote);
        return true;
    }
    
    function execute(uint256 blockNumber) public override payable returns (uint256) {
        bytes32 IdCache =  blockProposal[blockNumber];
        _execute(IdCache);
        return blockNumber;
    }

    function vote(bytes32 proposalId, bool auth) external override {
        _vote(proposalId, auth);
    }
}