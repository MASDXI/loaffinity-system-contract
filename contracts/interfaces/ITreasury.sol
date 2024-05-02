// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ITreasury {
    enum ProposalType {
        REMOVED,
        RELEASED
    } // LOCKED => REMOVED

    struct ProposalSupplyInfo {
        address proposer;
        address recipient;
        uint256 amount;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    event TreasuryProposalProposed(
        bytes32 indexed proposalId,
        address indexed proposer,
        address indexed recipient,
        ProposalType proposalType,
        uint256 amount,
        uint256 targetBlock,
        uint256 time
    );

    event TreasuryVoted(
        bytes32 indexed proposalId,
        address indexed voter,
        bool auth,
        uint256 time
    );
    event TreasuryCancel(
        bytes32 proposalId,
        ProposalType proposalType,
        address indexed account,
        uint256 amount,
        uint256 time
    );
    event TreasuryProposalExecuted(
        bytes32 proposalId,
        ProposalType proposalType,
        address indexed account,
        uint256 amount,
        uint256 time
    );
    event TreasuryProposalRejected(
        bytes32 proposalId,
        ProposalType proposalType,
        address indexed account,
        uint256 amount,
        uint256 time
    );
}
