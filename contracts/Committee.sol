// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./abstracts/Initializer.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Committee is
    AccessControlEnumerable,
    ICommittee,
    Proposal,
    Initializer
{
    bytes32 public constant ROOT_ADMIN_ROLE = keccak256("ROOT_ADMIN_ROLE");
    bytes32 public constant CONSORTIUM_COMMITTEE_ROLE =
        keccak256("CONSORTIUM_COMMITTEE_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_AGENT_ROLE =
        keccak256("EXECUTOR_AGENT_ROLE");

    mapping(bytes32 => ProposalCommitteeInfo) private _committeeProposals;
    mapping(uint256 => bytes32) public blockProposal;

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "committee: onlyAdmin can call");
        _;
    }

    modifier onlyCommittee() {
        require(isCommittee(msg.sender), "committee: onlyCommittee can call");
        _;
    }

    modifier onlyAgent() {
        require(isAgent(msg.sender), "committee: onlyAgent can call");
        _;
    }

    modifier onlyProposer() {
        require(isProposer(msg.sender), "committee: onlyProposer can call");
        _;
    }

    /**
     * @notice initialize the contract instead of constructor.
     * @param voteDelay_ waiting period before proposal active
     * @param votePeriod_ active period of proposal
     * @param proposePeriod_ waiting period between propose
     * @param committees_ array of committee addresses
     * @param admin_ root admin address
     */
    function initialize(
        uint256 voteDelay_,
        uint256 votePeriod_,
        uint32 proposePeriod_,
        uint32 retentionPeriod_, // add
        address[] calldata committees_,
        address admin_
    ) external onlyInitializer {
        uint256 committeeLen = committees_.length;
        _initialized();
        _setupRole(ROOT_ADMIN_ROLE, admin_);
        _setupRole(PROPOSER_ROLE, admin_);
        for (uint256 i = 0; i < committeeLen; ++i) {
            _setupRole(CONSORTIUM_COMMITTEE_ROLE, committees_[i]);
        }
        _setVoteDelay(voteDelay_);
        _setVotePeriod(votePeriod_);
        _setVoteThreshold(75);
        _setProposePeriod(proposePeriod_);
        _setExecuteRetentionPeriod(retentionPeriod_); // add
    }

    function _getProposal(
        bytes32 proposalId
    ) private view returns (ProposalCommitteeInfo memory) {
        ProposalCommitteeInfo memory data = _committeeProposals[proposalId];
        require(data.blockNumber != 0, "committee: proposal not exist");
        return data;
    }

    function getProposalCommitteeInfoByProposalId(
        bytes32 proposalId
    ) public view returns (ProposalCommitteeInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalCommitteeInfoByBlockNumber(
        uint256 blockNumber
    ) public view returns (ProposalCommitteeInfo memory) {
        return _getProposal(blockProposal[blockNumber]);
    }

    function getCommitteeCount() public view returns (uint256) {
        return getRoleMemberCount(CONSORTIUM_COMMITTEE_ROLE);
    }

    function getProposerCount() external view returns (uint256) {
        return getRoleMemberCount(PROPOSER_ROLE);
    }

    /// @custom:override
    function isAdmin(address account) public view override returns (bool) {
        return hasRole(ROOT_ADMIN_ROLE, account);
    }

    /// @custom:override
    function isCommittee(address account) public view override returns (bool) {
        return hasRole(CONSORTIUM_COMMITTEE_ROLE, account);
    }

    /// @custom:override
    function isProposer(address account) public view override returns (bool) {
        return hasRole(PROPOSER_ROLE, account);
    }

    /// @custom:override
    function isAgent(address account) public view override returns (bool) {
        return hasRole(EXECUTOR_AGENT_ROLE, account);
    }

    function propose(
        uint256 blockNumber,
        address account,
        ProposalType proposeType
    ) public onlyProposer returns (bool) {
        require(account != address(0), "committee: propose zero address");
        if (proposeType == ProposalType.ADD) {
            require(
                !isCommittee(account),
                "committee: propose add existing committee"
            );
        } else {
            require(
                isCommittee(account),
                "committee: propose remove not exist committee"
            ); // typo commitee
        }
        require(
            blockProposal[blockNumber] == bytes32(0),
            "committee: blocknumber has propose"
        );

        bytes32 proposalId = keccak256(
            abi.encode(msg.sender, account, proposeType, blockNumber)
        );
        _proposal(proposalId, uint16(getCommitteeCount()), blockNumber);

        blockProposal[blockNumber] = proposalId;
        _committeeProposals[proposalId].proposer = msg.sender;
        _committeeProposals[proposalId].committee = account;
        _committeeProposals[proposalId].blockNumber = blockNumber;
        _committeeProposals[proposalId].proposeType = proposeType;

        emit CommitteeProposalProposed(
            proposalId,
            msg.sender,
            account,
            proposeType,
            blockNumber,
            block.timestamp
        );

        return true;
    }

    function grantAgent(address account) public onlyAdmin {
        require(!isAgent(account), "committee: grant exist agent address");
        _grantRole(EXECUTOR_AGENT_ROLE, account);
    }

    function revokeAgent(address account) public onlyAdmin {
        require(isAgent(account), "committee: revoke non agent address");
        _revokeRole(EXECUTOR_AGENT_ROLE, account);
    }

    function grantProposer(address account) public onlyAdmin {
        require(
            !isProposer(account),
            "committee: grant exist proposer address"
        );
        _grantRole(PROPOSER_ROLE, account);
    }

    function revokeProposer(address account) public onlyAdmin {
        require(isProposer(account), "committee: revoke non proposer address");
        _revokeRole(PROPOSER_ROLE, account);
    }

    function execute(
        uint256 blockNumber
    ) public payable onlyAgent returns (uint256) {
        ProposalCommitteeInfo
            memory data = getProposalCommitteeInfoByBlockNumber(blockNumber);
        bytes32 IdCache = blockProposal[blockNumber];
        bool callback = _execute(IdCache);
        uint256 timeCache = block.timestamp;
        if (callback) {
            if (data.proposeType == ProposalType.ADD) {
                _grantRole(CONSORTIUM_COMMITTEE_ROLE, data.committee);
                emit CommitteeProposalExecuted(
                    IdCache,
                    ProposalType.ADD,
                    data.committee,
                    timeCache
                );
            } else {
                _revokeRole(CONSORTIUM_COMMITTEE_ROLE, data.committee);
                emit CommitteeProposalExecuted(
                    IdCache,
                    ProposalType.REMOVE,
                    data.committee,
                    timeCache
                );
            }
        } else {
            emit CommitteeProposalRejected(
                IdCache,
                data.proposeType,
                data.committee,
                timeCache
            );
        }
        return blockNumber;
    }

    /// @custom:override
    function vote(
        bytes32 proposalId,
        bool auth
    ) external override onlyCommittee {
        _vote(proposalId, auth);
        emit CommitteeVoted(proposalId, msg.sender, auth, block.timestamp);
    }

    function cancel(
        uint256 blockNumber
    ) public payable onlyAgent returns (uint256) {
        // add
        ProposalCommitteeInfo
            memory data = getProposalCommitteeInfoByBlockNumber(blockNumber);
        uint256 timeCache = block.timestamp;
        bytes32 IdCache = blockProposal[blockNumber];
        _cancelProposal(IdCache);
        emit CommitteeCancel(
            IdCache,
            data.proposeType,
            data.committee,
            timeCache
        );
        return blockNumber;
    }
}
