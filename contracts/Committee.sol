// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Committee is AccessControlEnumerable, ICommittee, Proposal {

    bytes32 public constant ROOT_ADMIN_ROLE = keccak256("ROOT_ADMIN_ROLE");
    bytes32 public constant COMMITEE_ROLE = keccak256("COMMITEE_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    struct ProposalCommitteeInfo {
        address proposer;
        address commitee;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    bool private _init;
    address private constant _systemContract = 0x0000000000000000000000000000000000000F69;
    mapping(bytes32 => ProposalCommitteeInfo) private _committeeProposals; 
    mapping(uint256 => bytes32) public blockProposal;

    event Initialized();

    modifier onlyProposer() {
        require(isProposer(msg.sender),"committee: onlyProposer can call");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ROOT_ADMIN_ROLE, msg.sender),"committee: onlyAdmin can call");
        _;
    }

    modifier onlySystemAddress() {
        require(msg.sender == _systemContract,"committee: onlyAdmin can call");
        _;
    }

    /// @notice initialize the contract instead of constructor.
    /// @param committees_ array of committee addresses
    /// @param admin_ root admin address
    function initialize(
        address [] calldata committees_, 
        address admin_,
        uint256 voteDelay_,
        uint256 votePeriod_
        ) external onlySystemAddress {
        require(!_init,"committee:");
        uint256 committeeLen = committees_.length;
        _setupRole(ROOT_ADMIN_ROLE, admin_);
        _setupRole(PROPOSER_ROLE, admin_);
        for (uint256 i = 0; i < committeeLen; ++i) {
            _setupRole(COMMITEE_ROLE, committees_[i]);
        }
        _init = true;
        _voteDelay = voteDelay_;
        _votePeriod = votePeriod_;
        emit Initialized();
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalCommitteeInfo memory) {
        ProposalCommitteeInfo memory data = _committeeProposals[proposalId];
        require(data.blockNumber != 0, "committee: proposal not exist");
        return data;
    }

    function propose(
        uint256 blockNumber,
        address account,
        ProposalType proposeType
    ) public onlyProposer returns(bool) {
        uint256 current = block.number;
        require(current < blockNumber, "committee: propose past block");
        require(account != address(0), "committee: propose zero address");
        require((current + votingPeriod()) < blockNumber,"committee: invalid blocknumber");
        if (proposeType == ProposalType.ADD) {
            require(!isCommittee(account), "committee: propose add existing committee");
        }
        if (proposeType == ProposalType.REMOVE) {
            require(isCommittee(account), "committee: propose remove not exist commitee");
        }

        // proposal can be contain more than 1 in a block
        bytes32 proposalId = keccak256(abi.encode(msg.sender, account, proposeType, blockNumber));

        blockProposal[blockNumber] = proposalId;
        _committeeProposals[proposalId].proposer = msg.sender;
        _committeeProposals[proposalId].commitee = account;
        _committeeProposals[proposalId].blockNumber = blockNumber;
        _committeeProposals[proposalId].proposeType = proposeType;
        
        _proposal(proposalId, uint16(getCommitteeCount()));
        emit CommitteeProposalProposed(proposalId, msg.sender, account, proposeType, blockNumber, block.timestamp);

        return true;
    }

    function grantProposer(address account) public onlyAdmin {
        require(!isProposer(account),"committee: grant exist proposer address");
        _grantRole(PROPOSER_ROLE, account);
    }

    function revokeProposer(address account) public onlyAdmin {
        require(isProposer(account),"committee: revoke non proposer address");
        _revokeRole(PROPOSER_ROLE, account);
    }

    function getProposalCommitteeInfoByProposalId(bytes32 proposalId) public view returns (ProposalCommitteeInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalCommitteeInfoByBlockNumber(uint256 blockNumber) public view returns (ProposalCommitteeInfo memory) {
        return _getProposal(blockProposal[blockNumber]);
    }

    function getCommitteeCount() public view returns (uint256) {
        return getRoleMemberCount(COMMITEE_ROLE);
    }

    function getProposerCount() external view returns (uint256) {
        return getRoleMemberCount(PROPOSER_ROLE);
    }

    function votingDeley() public view virtual override returns(uint256) {
        return _voteDelay;
    }

    function votingPeriod() public view virtual override returns(uint256) {
        return _votePeriod;
    }

    function execute(uint256 blockNumber) external override returns (uint256) {
        ProposalCommitteeInfo memory data = getProposalCommitteeInfoByBlockNumber(blockNumber);
        _execute(blockProposal[blockNumber]);
        if (data.proposeType == ProposalType.ADD) {
            _grantRole(COMMITEE_ROLE, data.commitee);
        }
        if (data.proposeType == ProposalType.REMOVE) {
            _revokeRole(COMMITEE_ROLE, data.commitee);
        }
        return blockNumber;
    }

    function isCommittee(address account) public override view returns (bool) {
        return hasRole(COMMITEE_ROLE, account);
    }

    function isProposer(address account) public override view returns (bool) {
        return hasRole(PROPOSER_ROLE, account);
    }
}