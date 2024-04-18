// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";
import "../abstracts/Proxy.sol";
import "../interfaces/IServiceProvider.sol";
import "../interfaces/ICommittee.sol";

contract ServiceProviderProxy is Proxy, IGasPriceOracle, ICommittee, Initializer {

    /// @notice system contract not use constructor due it's preload into genesis block
    IServiceProvider private _implementation;
    ICommittee private immutable _committee;
    
    bool public status;

    // store service provider account
    mapping(address => bool) private _serviceProvider;

    modifier onlyAuthorized() {
        require(_committee.isAdmin() || _serviceProvider,"");
        _;
    }

    function initialize(address implementation, address committeeContract) public onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
        _committee = ICommittee(committeeContract);
        _implementation = IServiceProvider(implementation);
    }

    // @TODO role permission
    function setImplementation(address implemetation) external override {
        _implementation = IServiceProvider(implemetation);
        super.setImplementation(implementation);
    }

    function version() exteranl view returns (uint256) {
        return _implementation.version();
    }

    // ####################################################################################################
    function getServiceProviderOfMerchant(address merchant) external view returns (address) {
        return _implementation.getServiceProvider(merchant);
    }

    function grant(address merchant) external onlyAuthorized{
        // require is service provider
        _implementation.grantMerchant(merchant);
    }

    function revoke(address merchant) external onlyAuthorized{
        // require is service provider
        _implementation.revokeMerchant(merchant)
    }
}