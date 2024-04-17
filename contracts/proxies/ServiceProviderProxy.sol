// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "./interfaces/IServiceProvider.sol";
import "./abstracts/Intializer.sol";
import "./abstracts/Proxy.sol";

contract ServiceProviderProxy is Proxy, IGasPriceOracle, Intializer {

    /// @notice system contract not use constructor due it's preload into genesis block
    IServiceProvider private _implementation;
    
    bool public status;

    function initialize(address implementation) public onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
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

}