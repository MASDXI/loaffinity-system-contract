// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interface/ICommitee.sol";
import "./Votable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract Commitee is AccessControlEnumerable, ICommittee, Votable {

    error AlreadyInitialized();

    bytes32 public constant ROOT_ADMIN_ROLE = keccak256("ROOT_ADMIN_ROLE");
    bytes32 public constant COMMITEE_ROLE = keccak256("COMMITEE_ROLE");
    bytes32 public constant PROPOSAL_CREATOR_ROLE = keccak256("PROPOSAL_CREATOR_ROLE");

    bool private _init;

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

}