// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// @TODO
// adding permission to change parameters
// adding permission to enable/disable
// adding to keep tracking active validator length

import "./abstracts/Initializer.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GasPriceOracleV1 is IGasPriceOracleV1, Initializer, Pausable {
    enum PARAMETERS {
        CEC,
        CO2P,
        SCR
    }

    event ParameterUpdated(
        uint256 indexed blockNumber,
        string indexed params,
        uint256 value
    );

    event ParameterBlockPeriodUpdate(uint32 blockperiod);

    uint32 private constant ONE_YEAR = 31_536_000; // 1 year in seconds.
    uint32 private constant ONE_HOUR = 3_600; // 1 hour in seconds.

    struct ConfigurationParemeter {
        /* Carbon Emission per Kilowatt hour Coefficient*/
        uint256 carbonEmissionCoefficient;
        /* Carbon Capture Cost per Ton */
        uint256 carbonCaptureCost;
        /* Sustainability Charge Rate */
        uint256 chargeRate;
        /* <require_name> */
        uint256 c;
        /* Number of Validator in the network */
        uint256 numberOfValidator;
        /* <require_name> */
        uint256 k;
    }

    /* Contract configuration */
    ConfigurationParemeter private _config;
    uint256 private _constant;
    uint256 private _lastUpdatedBlock;

    /* Blockchain environment configuration */
    uint256 private _blockPeriod; // block period in seconds.

    // Example config
    // _config.carbonEmissionCoefficient = 1; // no decimal
    // _config.carbonCaptureCost = 344000000; // decimal 9
    // _config.chargeRate = 1; // no decimal
    // _config.c = 15748000000; // decimal 9
    // _config.numberOfValidator = 4; // no decimal
    // _config.k = 300; // decimal 9
    // setBlockPeriod(15); // decimal 9 _15/(ONE_HOUR * 1000)
    // _constant = 278;
    function initialize(
        uint256 _carbonEmissionCoefficient,
        uint256 _carbonCaptureCost,
        uint256 _chargeRate,
        uint256 _c,
        uint256 _numberOfValidator,
        uint256 _k,
        uint32 _blockPeriod
    ) public onlyInitializer {
        _initialized();
        ConfigurationParemeter memory cacheConfig = ConfigurationParemeter(
            _carbonEmissionCoefficient,
            _carbonCaptureCost,
            _chargeRate,
            _c,
            _numberOfValidator,
            _k
        );
        _setConfiguration(cacheConfig);
        _setBlockPeriod(_blockPeriod);
        _pause();
        _lastUpdatedBlock = block.number;
    }

    function getBlockPeriod() public view override returns (uint256) {
        return _blockPeriod;
    }

    function getLastUpdatedBlock() public view override returns (uint256) {
        return _lastUpdatedBlock;
    }

    function calculateTransactionFee(
        uint256 gasLimit
    ) public view override returns (uint256) {
        // Carbon Emission Kg/kWh
        // uint256 carbonEmission = (_CEC * _blockPeriod /*_CO2P * *//(ONE_HOUR * 1000));
        // Calculate carbon emission
        uint256 carbonEmission = (_config.carbonEmissionCoefficient *
            _blockPeriod) * _constant;
        // Calculate validator contribution
        uint256 validatorContribution = (_config.c * _config.numberOfValidator);
        // Calculate charge rate
        uint256 chargeRate = (1 + _config.chargeRate);
        // Calculate total transaction fee
        uint256 transactionFee = (_config.k *
            gasLimit +
            validatorContribution) *
            chargeRate *
            carbonEmission;
        return transactionFee;
    }

    // @TODO permission
    function setConfiguration(
        ConfigurationParemeter memory config
    ) public {
        // Annaul Update Parameter
        uint256 blockNumberCache = block.number;
        require(
            blockNumberCache - getLastUpdatedBlock() >= ONE_YEAR,
            "GasPriceOracleV1: It's not yet time to update values."
        );
        // @TODO require check new config
        // should revert before cacheOldConfig for gas saving

        ConfigurationParemeter memory cacheOldConfig = _config;
        _config = config;
        _lastUpdatedBlock = blockNumberCache;

        emit configurationUpdated(cacheOldConfig, config);
    }

    // @TODO permission
    function setBlockPeriod(uint32 blockPeriod) public {
        require(
            blockPeriod > 0,
            "GasPriceOracleV1: block period can't be zero"
        );
        require(
            _blockPeriod != blockPeriod,
            "GasPriceOracleV1: block period value exist"
        );
        _blockPeriod = blockPeriod;

        emit ParameterBlockPeriodUpdate(blockPeriod);
    }
    
    // @TODO permission
    function enable() public {
        _unpause();
    }
    
    // @TODO permission
    function disable() public {
        _pause();
    }
}