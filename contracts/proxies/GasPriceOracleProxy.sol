// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";
import "../abstracts/Proxy.sol";
import "../interfaces/IGasPriceOracle.sol";
import "../interfaces/ICommittee.sol";
// import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract GasPriceOracleProxy is Proxy, Initializer {
    // contract GasPriceOracleProxy is /*AccessControlEnumerable*/, Proxy, Initializer {
    ICommittee private _committee; // pre-loaded contract.
    IGasPriceOracle private _implementation; // deployed contract.

    struct Threshold {
        uint8 consortiumRatio;
        uint8 nodeValidatorRatio;
        uint8 merchantRatio;
        uint8 mobileValidatorRatio;
    }

    // @TODO create role for who can update configuration on gas price oracle contract?

    Threshold private _threshold;

    // event ThresholdUpdate(ROLE role, uint8 value);

    modifier onlyAuthorized() {
        // root admin?
        require(
            _committee.isAdmin(msg.sender),
            "gasPriceOracleProxy: only authorized account can call"
        );
        _;
    }

    /// @notice system contract not use constructor due it's preload into genesis block.
    function initialize(
        address implementation,
        address committeeContract,
        Threshold calldata configuration
    ) external onlyInitializer {
        _initialized();
        _updateImpelemetation(implementation);
        updateThreshold(configuration);
        _committee = ICommittee(committeeContract);
        _implementation = IGasPriceOracle(implementation);
    }

    // @TODO role permission
    function setImplementation(
        address implementation
    ) public override onlyAuthorized {
        _implementation = IGasPriceOracle(implementation);
        super.setImplementation(implementation);
    }

    function calculateTransactionFee(
        uint256 gasLimit
    ) external view returns (uint256) {
        return _implementation.calculate(gasLimit);
    }

    function version() external view returns (uint256) {
        return _implementation.version();
    }

    function paused() external view returns (bool) {
        return _implementation.status();
    }

    // @TODO role permission
    function updateThreshold(Threshold calldata threshold) public {
        // validation input
        uint8 temp;
        temp += threshold.consortiumRatio;
        temp += threshold.nodeValidatorRatio;
        temp += threshold.merchantRatio;
        temp += threshold.mobileValidatorRatio;
        require(temp == 100,"gasPriceOracleProxy: invalid threshold");
        _threshold = threshold;
        // emit ThresholdUpdated(_threshold, threshold);
    }

    function getThreshold() external view returns (Threshold memory) {
        return _threshold;
    }
}
