// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ICommittee {

    enum ProposalType { REMOVE, ADD }

    event CommitteeProposalProposed(
        bytes32 proposalId,
        address indexed proposer,
        address indexed account, 
        ProposalType indexed proposeType,
        uint256 blockNumber,
        uint256 timestamp);
    function isCommittee(address account) external view returns(bool);
    function isProposer(address account) external view returns(bool);
    function getCommitteeCount() external view returns (uint256);
    function getProposerCount() external view returns (uint256);
}