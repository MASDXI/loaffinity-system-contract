// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IProposal {

    enum ProposalStatus { PENDING, EXECUTE, REJECT }

    struct ProposalInfo {
        address proposer;
        uint256 createTime;
        uint256 startBlock;
        uint256 endBlock;
        uint16 nVoter;
        uint16 accept;
        uint16 reject;
        ProposalStatus status;
    }

    struct VoteInfo {
        address voter;
        uint256 voteTime;
        bool auth;
    }

    event LogCreateProposal(
        bytes32 indexed proposalId,
        address indexed proposer,
        uint256 timestamp
    );

    event LogVote(
        bytes32 indexed proposalId,
        address indexed voter,
        bool auth,
        uint256 timestamp
    );

    event LogProposal(
        bytes32 indexed proposalId,
        uint256 timestamp,
        ProposalStatus indexed status
    );

    function isProposalPassed(bytes32 proposalId) external view returns(bool);
    function threshold() external returns (uint8);
    function proposePeriod() external returns (uint32);
    function vote(bytes32 proposalId, bool auth) external;
    function votingDeley() external view returns(uint256);
    function votingPeriod() external view returns(uint256);
    function latestProposal(address account) external view returns(uint256);
}