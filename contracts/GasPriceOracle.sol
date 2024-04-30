// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Initializer.sol";
import "./interfaces/IGasPriceOracle.sol";

// @TODO this is simple implementation of gas price oracle contract.
// it's require adding permission to change parameters
// it's require adding permission to enable/disable
// it's require adding to keep tracking active validator length
contract GasPriceOracleV1 is IGasPriceOracle, Initializer {
    event ParameterBlockPeriodUpdate(uint256 blockperiod);
    event ParameterConfigurationUpdated(
        ConfigurationParemeter oldConfig,
        ConfigurationParemeter netConfig
    );

    uint32 private constant ONE_YEAR = 31_536_000; // 1 year in seconds.
    uint32 private constant ONE_HOUR = 3_600; // 1 hour in seconds.

    struct ConfigurationParemeter {
        /* Carbon Emission per Kilowatt hour Coefficient*/
        uint256 carbonEmissionCoefficient;
        /* Carbon Capture Cost per Ton */
        uint256 carbonCaptureCost;
        /* Sustainability Charge Rate */
        uint256 sustainabilityChargeRate;
        /* Ide power consumption on validator node*/
        uint256 idlePowerConsumption;
        /* Number of Validator in the network */
        uint256 numberOfValidator;
        /* Power consume per gas unit */
        uint256 powerConsumptionPerGas;
    }

    /* Contract configuration */
    ConfigurationParemeter private _config;
    uint256 private _constant;
    uint256 private _lastUpdatedBlock;
    address private _proxy;

    /* Blockchain environment configuration */
    uint256 private _blocktime; // block period in seconds.

    /* enable disable status*/
    bool private _status;

    // Example config
    // CEC          // _config.carbonEmissionCoefficient = 1;       // decimal 0
    // CO2P         // _config.carbonCaptureCost = 344000000;       // decimal 9
    // SCR          // _config.sustainabilityChargeRate = 1;        // decimal 0
    // C"           // _config.idlePowerConsumption = 15748000000;  // decimal 9
    // H            // _config.numberOfValidator = 4;               // decimal 0
    // K'           // _config.powerConsumptionPerGas = 300;        // decimal 9
    // blocktime    // setBlockPeriod(15);                          // decimal 0
    // dampling     // _constant = 278;
    constructor(
        uint256 _carbonEmissionCoefficient,
        uint256 _carbonCaptureCost,
        uint256 _sustainabilityChargeRate,
        uint256 _idlePowerConsumption,
        uint256 _numberOfValidator,
        uint256 _powerConsumptionPerGas,
        uint256 _blockPeriod,
        uint256 _dampling,
        address proxyContract
    ) {
        ConfigurationParemeter memory cacheConfig = ConfigurationParemeter(
            _carbonEmissionCoefficient,
            _carbonCaptureCost,
            _sustainabilityChargeRate,
            _idlePowerConsumption,
            _numberOfValidator,
            _powerConsumptionPerGas
        );
        _updateConfiguration(cacheConfig);
        setBlockPeriod(_blockPeriod);
        _constant = _dampling;
        _lastUpdatedBlock = block.number;
        _proxy = proxyContract;
    }

    function _configurationValidation(
        ConfigurationParemeter memory config
    ) private pure {
        if (config.carbonEmissionCoefficient == 0) {
            revert();
        }
        if (config.carbonCaptureCost == 0) {
            revert();
        }
        if (config.sustainabilityChargeRate == 0) {
            revert();
        }
        if (config.idlePowerConsumption == 0) {
            revert();
        }
        if (config.numberOfValidator == 0) {
            revert();
        }
        if (config.powerConsumptionPerGas == 0) {
            revert();
        }
    }

    function getBlockPeriod() public view returns (uint256) {
        return _blocktime;
    }

    function getLastUpdatedBlock() public view returns (uint256) {
        return _lastUpdatedBlock;
    }

    // @TODO permission
    function setConfiguration(ConfigurationParemeter memory config) public {
        // Annaul Update Parameter
        uint256 blockNumberCache = block.number;
        require(
            blockNumberCache - getLastUpdatedBlock() >= ONE_YEAR,
            "GasPriceOracleV1: It's not yet time to update values."
        );
        _updateConfiguration(config);
    }

    function _updateConfiguration(ConfigurationParemeter memory config) public {
        // @TODO require check new config
        _configurationValidation(config);
        // @TODO should revert before cacheOldConfig for gas saving.
        ConfigurationParemeter memory cacheOldConfig = _config;
        _config = config;
        _lastUpdatedBlock = block.number;
        emit ParameterConfigurationUpdated(cacheOldConfig, config);
    }

    // @TODO require permission
    function setBlockPeriod(uint256 blockPeriod) public {
        require(
            blockPeriod > 0,
            "GasPriceOracleV1: block period can't be zero"
        );
        require(
            _blocktime != blockPeriod,
            "GasPriceOracleV1: block period value exist"
        );
        _blocktime = blockPeriod;
        emit ParameterBlockPeriodUpdate(blockPeriod);
    }

    /// @custom:override
    function calculate(uint256 gas) public view returns (uint256) {
        // Carbon Emission Kg/kWh
        // uint256 carbonEmission = (_CEC * _blockPeriod /*_CO2P * *//(ONE_HOUR * 1000));
        // Calculate carbon emission
        uint256 carbonEmission = (_config.carbonEmissionCoefficient * 
            _blocktime) * _config.carbonCaptureCost * _constant;
        // Calculate validator contribution
        uint256 validatorContribution = (_config.idlePowerConsumption *
            _config.numberOfValidator);
        // Calculate charge rate
        uint256 chargeRate = (1 + _config.sustainabilityChargeRate);
        // Calculate total transaction fee
        uint256 transactionFee = (_config.powerConsumptionPerGas *
            gas +
            validatorContribution) *
            chargeRate *
            carbonEmission;
        return transactionFee;
    }

    /// @custom:override
    function version() public pure override returns (uint256) {
        return 10;
    }

    /// @custom:override
    function status() public view override returns (bool) {
        return _status;
    }

    // @TODO invoke from proxy?
    function toggle() public {
        if (!_status) {
            _status = true;
        } else {
            _status = false;
        }
    }
}
