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
        bytes32 proposalId = keccak256(abi.encode(msg.sender, blocknumber));
        blockProposal[blocknumber] = proposalId;
        _proposal(proposalId, nvote, blocknumber);
        return true;
    }
    
    function execute(uint256 blockNumber) public payable returns (uint256) {
        bytes32 IdCache =  blockProposal[blockNumber];
        _execute(IdCache);
        return blockNumber;
    }

    function vote(bytes32 proposalId, bool auth) external override {
        _vote(proposalId, auth);
    }

    function setVoteThreshold(uint8 percentage) external {
        _setVoteThreshold(percentage);
    }

    function setProposePeriod(uint32 period) external {
        _setProposePeriod(period);
    }

    function setVoteDelay(uint256 delay) external {
        _setVoteDelay(delay);
    }

    function setVotePeriod(uint256 delay) external {
        _setVotePeriod(delay);
    }
}