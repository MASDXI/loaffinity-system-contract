// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./abstracts/SystemAddress.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Committee is AccessControlEnumerable, ICommittee, Proposal, SystemCaller {

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
    mapping(bytes32 => ProposalCommitteeInfo) private _committeeProposals; 
    mapping(uint256 => bytes32) public blockProposal;

    event Initialized();

    modifier onlyAdmin() {
        require(hasRole(ROOT_ADMIN_ROLE, msg.sender),"committee: onlyAdmin can call");
        _;
    }

    modifier onlyCommittee() {
        require(hasRole(COMMITEE_ROLE, msg.sender),"committee: onlyCommittee can call");
        _;
    }

    modifier onlyProposer() {
        require(isProposer(msg.sender),"committee: onlyProposer can call");
        _;
    }

    /// @notice initialize the contract instead of constructor.
    /// @param committees_ array of committee addresses
    /// @param admin_ root admin address
    function initialize(
        uint256 voteDelay_,
        uint256 votePeriod_,
        address [] calldata committees_, 
        address admin_
        ) external onlySystemAddress {
        require(!_init,"committee: already init");
        uint256 committeeLen = committees_.length;
        _setupRole(ROOT_ADMIN_ROLE, admin_);
        _setupRole(PROPOSER_ROLE, admin_);
        for (uint256 i = 0; i < committeeLen; ++i) {
            _setupRole(COMMITEE_ROLE, committees_[i]);
        }
        _init = true;
        _setDelay(voteDelay_);
        _setPeriod(votePeriod_);
        _setThreshold(75);
        emit Initialized();
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalCommitteeInfo memory) {
        ProposalCommitteeInfo memory data = _committeeProposals[proposalId];
        require(data.blockNumber != 0, "committee: proposal not exist");
        return data;
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

    function isCommittee(address account) public override view returns (bool) {
        return hasRole(COMMITEE_ROLE, account);
    }

    function isProposer(address account) public override view returns (bool) {
        return hasRole(PROPOSER_ROLE, account);
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
    
    function execute(uint256 blockNumber) public override onlySystemAddress returns (uint256) {
        ProposalCommitteeInfo memory data = getProposalCommitteeInfoByBlockNumber(blockNumber);
        (bool callback) = _execute(blockProposal[blockNumber]);
        if (callback && data.proposeType == ProposalType.ADD) {
            _grantRole(COMMITEE_ROLE, data.commitee);
        }
        if (callback && data.proposeType == ProposalType.REMOVE) {
            _revokeRole(COMMITEE_ROLE, data.commitee);
        }
        return blockNumber;
    }

    function vote(bytes32 proposalId, bool auth) external override onlyCommittee {
        _vote(proposalId, auth);
    }
}