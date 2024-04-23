// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";
import "../abstracts/Proxy.sol";
import "../interfaces/IGasPriceOracle.sol";
import "../interfaces/ICommittee.sol";
// import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract GasPriceOracleProxy is Proxy, Initializer {
// contract GasPriceOracleProxy is /*AccessControlEnumerable*/, Proxy, Initializer {
    ICommittee private _committee;    // pre-loaded contract.
    IGasPriceOracle private _implementation;    // // deployed contract.

    enum ROLE { CONSORTIUM, NODE_VALIDATOR, MERCHANT, MOBILE_VALIDATOR }

    struct Threshold {
        ROLE role;
        uint8 ratio; // 0-100
    }

    // @TODO create role for who can update configuration on gas price oracle contract?

    Threshold [] private _conf;

    event ThresholdUpdate();

    modifier onlyAuthorized() {
        // root admin?
        require(_committee.isAdmin(msg.sender),"gasPriceOracleProxy: only authorized account can call");
        _;
    }

    /// @notice system contract not use constructor due it's preload into genesis block.
    function initialize(address implementation, address committeeContract) external onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
        _committee = ICommittee(committeeContract);
        _implementation = IGasPriceOracle(implementation);
    }

    // @TODO role permission
    function setImplementation(address implementation) public override onlyAuthorized {
        _implementation = IGasPriceOracle(implementation);
        super.setImplementation(implementation);
    }

    function version() external view returns (uint256) {
        return _implementation.version();
    }

    function calculateTransactionFee(uint256 gasLimit) external view returns (uint256) {
        return _implementation.calculate(gasLimit);
    }

    function updateThreshold(Threshold [3] memory newThreshold) public {
        uint8 percent = 0;
        for (uint8 i = 0; i < 4; i++) {
            percent += newThreshold[i].ratio;
        }
        require(percent == 100,"invalid threshold");
        // _conf = newThreshold;
        emit ThresholdUpdate();
    }

    function status() public view returns (bool) {
        if (_implementation.status()) {
            return true;
        } else {
            return false;
        }
    }

    function getThreashold() public view returns (Threshold [] memory) {
        return _conf;
    }
}