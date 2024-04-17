// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "./interfaces/IGasPriceOracle.sol";
import "./abstracts/Intializer.sol";
import "./abstracts/Proxy.sol";

contract GasPriceOracleProxy is Proxy, IGasPriceOracle, Intializer {

    /// @notice system contract not use constructor due it's preload into genesis block
    IGasPriceOracle private _implementation;
    
    bool public status;

    function initialize(address implementation) public onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
        _implementation = IGasPriceOracle(implementation);
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

    function calculateTransactionFee(uint256 gasLimit) public view override returns (uint256) {
        return _implementation.calculate(gasLimit);
    }

    // @TODO permission
    function enable() public {
        status = true;
    }
    
    // @TODO permission
    function disable() public {
        status = false;
    }

}