// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstract/Votable.sol";
import "./interface/ICommitee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Commitee is AccessControlEnumerable, ICommittee, Votable {

    error AlreadyInitialized();

    bytes32 public constant ROOT_ADMIN_ROLE = keccak256("ROOT_ADMIN_ROLE");
    bytes32 public constant COMMITEE_ROLE = keccak256("COMMITEE_ROLE");
    bytes32 public constant PROPOSAL_CREATOR_ROLE = keccak256("PROPOSAL_CREATOR_ROLE");

    
    struct ProposalInfo {
        address proposer;
        address[] commitee;
        uint256 blockNumber;
    }

    bool private _init;
    address private _systemContract; /// TODO implement system_contract_caller as abstract contract?
    mapping(bytes32 => ProposalInfo) private _proposals; 
    mapping(uint256 => bytes32) public _blockProposals;

    /// @notice initialize the contract instead of constructor.
    /// @param committees_ array of committee addresses
    /// @param admin_ root admin address
    function initialize(address [] calldata committees_, address admin_) external {
        if (_init) {
            revert AlreadyInitialized();
        }
        uint256 committeeLen = committees_.length;
        _setupRole(ROOT_ADMIN_ROLE, admin_);
        for (uint256 i = 0; i < committeeLen; ++i) {
            _setupRole(COMMITEE_ROLE, committees_[i]);
        }
        _init = true;
    }

    // @notice grant commitee role from given address via root admin
    /// @param account given committee address
    function grantCommittee(address account) external onlyRole(ROOT_ADMIN_ROLE) {
        _grantRole(COMMITEE_ROLE, account);
    }

    /// @notice revoke commitee role from given address via root admin
    /// @param account given committee address
    function revokeCommittee(address account) external onlyRole(ROOT_ADMIN_ROLE){
        _revokeRole(COMMITEE_ROLE, account);
    }

    function isCommittee(address account) public override view returns (bool) {
        return hasRole(COMMITEE_ROLE, account);
    }

    function isProposalCreator(address account) public override view returns (bool) {
        return hasRole(PROPOSAL_CREATOR_ROLE, account);
    }

    function getProposalInfoByProposalId(bytes32 proposalId) public view returns (ProposalInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalInfoByBlockNumber(uint256 blockNumber) public view returns (ProposalInfo memory) {
        return _getProposal(_blockProposals[blockNumber]);
    }

}