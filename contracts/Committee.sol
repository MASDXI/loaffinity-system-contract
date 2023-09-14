// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Committee is AccessControlEnumerable, ICommittee, Proposal {

    bytes32 public constant ROOT_ADMIN_ROLE = keccak256("ROOT_ADMIN_ROLE");
    bytes32 public constant COMMITEE_ROLE = keccak256("COMMITEE_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

    enum ProposalType { REMOVE, ADD }

    struct ProposalCommitteeInfo {
        address proposer;
        address commitee;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    bool private _init;
    address private _systemContract; /// TODO implement system_contract_caller as abstract contract?
    mapping(bytes32 => ProposalCommitteeInfo) private _committeeProposals; 
    mapping(uint256 => bytes32) public _blockProposals;

    modifier onlyProposer() {
        require(isProposer(msg.sender),"committee:");
        _;
    }

    /// @notice initialize the contract instead of constructor.
    /// @param committees_ array of committee addresses
    /// @param admin_ root admin address
    function initialize(address [] calldata committees_, address admin_) external {
        require(!_init,"committee:");
        uint256 committeeLen = committees_.length;
        _setupRole(ROOT_ADMIN_ROLE, admin_);
        for (uint256 i = 0; i < committeeLen; ++i) {
            _setupRole(COMMITEE_ROLE, committees_[i]);
        }
        _init = true;
        
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalCommitteeInfo memory) {
        ProposalCommitteeInfo memory data = _committeeProposals[proposalId];
        require(data.blockNumber != 0,"committee:");
        return data;
    }

    function propose(
        uint256 blockNumber,
        address account,
        ProposalType proposeType
    ) public onlyProposer returns(uint256) {
        uint256 current = block.number;
        require(_init,"committee:");
        require(current < blockNumber, "committee:");
        require(account != address(0), "committee:");
        require((current + votingPeriod()) < blockNumber,"committee:");
        require(proposeType != ProposalType.ADD && isCommittee(account), "committee: propose add existing committee");
        require(proposeType != ProposalType.REMOVE && !isCommittee(account), "committee: propose remove not exist commitee");

        // proposal can be contain more than 1 in a block
        bytes32 proposalId = keccak256(abi.encode(msg.sender, account, proposeType, blockNumber));

        _blockProposals[blockNumber] = proposalId;
        _committeeProposals[proposalId].proposer = msg.sender;
        _committeeProposals[proposalId].commitee = account;
        _committeeProposals[proposalId].blockNumber = blockNumber;
        _committeeProposals[proposalId].proposeType = proposeType;
        
        _proposal(proposalId, uint16(getCommitteeCount()));
        // emit SupplyMintProposalProposed(proposalId, msg.sender, account, proposeType, blockNumber, block.timestamp);

        return blockNumber;
    }

    function getProposalCommitteeInfoByProposalId(bytes32 proposalId) public view returns (ProposalCommitteeInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalCommitteeInfoByBlockNumber(uint256 blockNumber) public view returns (ProposalCommitteeInfo memory) {
        return _getProposal(_blockProposals[blockNumber]);
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
        _execute(_blockProposals[blockNumber]);
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