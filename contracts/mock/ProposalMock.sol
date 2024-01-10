// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Proposal.sol";

contract ProposalMock is Proposal {

    mapping(uint256 => bytes32) public blockProposal;

    function propose() public returns(bool) {
        
        bytes32 proposalId = keccak256(abi.encode(msg.sender));

        blockProposal[block.number] = proposalId;
        
        _proposal(proposalId, 1);

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