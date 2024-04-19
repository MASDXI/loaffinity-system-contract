// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";
import "../abstracts/Proxy.sol";
import "../interfaces/IGasPriceOracle.sol";
import "../interfaces/ICommittee.sol";

contract GasPriceOracleProxy is Proxy, ICommittee, IGasPriceOracle, Initializer {

    IGasPriceOracle private _implementation;
    ICommittee private immutable _committee;

    bool public status;

    enum ROLE { CONSORTIUM, NODE_VALIDATOR, MERCHANT, MOBILE_VALIDATOR }

    struct Threshold {
        ROLE role;
        uint8 ratio; // 0-100
    }

    Threshold [] private _conf;

    modifier onlyAuthorized() {
        require(_committee.isAdmin(),"only authorized account");
        _;
    }

    /// @notice system contract not use constructor due it's preload into genesis block
    function initialize(address implementation, address committeeContract) public onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
        _committee = ICommittee(committeeContract);
        _implementation = IGasPriceOracle(implementation);
    }

    // @TODO role permission
    function setImplementation(address implemetation) external override {
        _implementation = IServiceProvider(implemetation);
        super.setImplementation(implementation);
    }

    function version() external view returns (uint256) {
        return _implementation.version();
    }

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