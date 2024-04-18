// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";
import "../abstracts/Proxy.sol";
import "../interfaces/IGasPriceOracle.sol";

contract GasPriceOracleProxy is Proxy, IGasPriceOracle, Initializer {

    /// @notice system contract not use constructor due it's preload into genesis block
    IGasPriceOracle private _implementation;
    
    bool public status;

    enum ROLE { CONSORTIUM, NODE_VALIDATOR, MERCHANT, MOBILE_VALIDATOR }

    struct Threshold {
        ROLE role;
        uint8 ratio;
    }

    Threshold [] private _conf;

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

    function updateThreshold(Threshold [4] memory newThreshold) public {
        uint8 percent = 0;
        for (uint8 i = 0; i < 4; i++) {
            percent += newThreshold[i];
        }
        require(percent == 100,"invalid threshold");
        _conf = newThreshold;
        emit ThresholdUpdate();
    }

    function getThreashold() public view override returns (Threshold [] memory) {
        return _conf;
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