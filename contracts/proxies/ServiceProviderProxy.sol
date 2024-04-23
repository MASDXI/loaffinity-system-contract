// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";
import "../abstracts/Proxy.sol";
import "../interfaces/IServiceProvider.sol";
import "../interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract ServiceProviderProxy is AccessControlEnumerable, Proxy, Initializer {
    ICommittee private _committee;    // pre-loaded contract.
    IServiceProvider private _implementation;   // deployed contract.
    
    // bool public status;

    // store service provider account
    bytes32 public constant SERVICE_PROVIDER_ROLE = keccak256("SERVICE_PROVIDER_ROLE");

    modifier onlyAdmin() {
        require(_committee.isAdmin(msg.sender),"serviceproviderproxy:");
        _;
    }

    modifier onlyAuthorized() {
        require(_committee.isAdmin(msg.sender) || hasRole(SERVICE_PROVIDER_ROLE, msg.sender),"serviceproviderproxy:");
        _;
    }

    /// @notice system contract not use constructor due it's preload into genesis block.
    function initialize(address implementation, address committeeContract) external onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
        _committee = ICommittee(committeeContract);
        _implementation = IServiceProvider(implementation);
    }

    // @TODO role permission
    function setImplementation(address implementation) public override onlyAdmin {
        _implementation = IServiceProvider(implementation);
        super.setImplementation(implementation);
    }

    function version() external view returns (uint256) {
        return _implementation.version();
    }

    function getServiceProviderOfMerchant(address merchant) external view returns (address) {
        return _implementation.getServiceProvider(merchant);
    }

    function grantMerchant(address merchant) external onlyAuthorized {
        _implementation.grantMerchant(merchant, msg.sender);
    }

    function revokeMerchant(address merchant) external onlyAuthorized {
        _implementation.revokeMerchant(merchant, msg.sender);
    }
}