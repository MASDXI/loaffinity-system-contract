// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ICommittee {
    enum ProposalType {
        REMOVE,
        ADD
    }

    struct ProposalCommitteeInfo {
        address proposer;
        address committee;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    event CommitteeProposalProposed(
        bytes32 proposalId,
        address indexed proposer,
        address indexed account,
        ProposalType indexed proposeType,
        uint256 blockNumber,
        uint256 timestamp
    );

    event CommitteeVoted(
        bytes32 indexed proposalId,
        address indexed voter,
        bool auth,
        uint256 time
    );
    event CommitteeCancel(
        bytes32 proposalId,
        ProposalType proposalType,
        address indexed account,
        uint256 time
    ); // add
    event CommitteeProposalExecuted(
        bytes32 proposalId,
        ProposalType proposalType,
        address indexed account,
        uint256 time
    );
    event CommitteeProposalRejected(
        bytes32 proposalId,
        ProposalType proposalType,
        address indexed account,
        uint256 time
    );

    function isAdmin(address account) external view returns (bool);
    function isAgent(address account) external view returns (bool);
    function isCommittee(address account) external view returns (bool);
    function isProposer(address account) external view returns (bool);
    function getCommitteeCount() external view returns (uint256);
    function getProposerCount() external view returns (uint256);
}
