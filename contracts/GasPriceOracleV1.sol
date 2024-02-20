// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// @TODO
// adding permission to change parameters
// adding permission to enable/disable
// adding to keep tracking active validator length

import "./abstracts/Initializer.sol";
import "./interfaces/IGasPriceOracleV1.sol";

contract GasPriceOracleV1 is IGasPriceOracleV1, Initializer {

    enum PARAMETERS { CEC, CO2P, SCR }
    enum FLAG { DISABLE, ENABLE }

    event ParameterUpdated(uint256 indexed blockNumber, string indexed params, uint256 value);
    event ParameterBlockPeriodUpdate(uint32 blockperiod);
    event Enabled();
    event Disabled();

    uint32 constant private ONE_YEAR = 31_536_000; // 1 year in seconds.
    uint32 constant private ONE_HOUR = 3_600;      // 1 hour in seconds.

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
    FLAG private _flag;
    ConfigurationParemeter private _config;
    uint256 private _constant;
    uint256 private _lastUpdatedBlock;
    
    /* Blockchain environment configuration */
    uint256 private _blockPeriod; // block period in seconds.


    function initialize() public onlyInitializer {
        _initialized();
        _config.carbonEmissionCoefficient = 1;  // no decimal
        _config.carbonCaptureCost = 344000000;  // decimal 9
        _config.chargeRate = 1;                 // no decimal
        _config.c = 15748000000;                // decimal 9
        _config.numberOfValidator = 4;          // no decimal
        _config.k = 300;                        // decimal 9
        setBlockPeriod(15);                     // decimal 9 _15/(ONE_HOUR * 1000)
        _constant = 278;

        _lastUpdatedBlock = block.number;
    }

    function enable() public override {
        require(isInit(),
            "GasPriceOracleV1: need to initialize before enable");
        if (_flag == FLAG.ENABLE) {
            _flag = FLAG.DISABLE;
            emit Disabled();
        } else {
            _flag = FLAG.ENABLE;
            emit Enabled();
        }
    }

    function _parameterSelector(PARAMETERS param) private pure returns (string memory) {
        require(uint8(param) < 3);
        if (param == PARAMETERS.CEC) return "CEC";
        if (param == PARAMETERS.CO2P) return "CO2P";
        if (param == PARAMETERS.SCR) return "SCR";
    }

    function setValue(uint32 cec, uint32 co2p, uint32 scr) public override {
        // Annaul Update Parameter
        uint256 blockNumberCache = block.number;
        require(blockNumberCache - getLastUpdatedBlock() >= ONE_YEAR,
            "GasPriceOracleV1: It's not yet time to update values.");

        _config.carbonEmissionCoefficient = cec;
        _config.carbonCaptureCost = co2p;
        _config.chargeRate = scr;
        
        emit ParameterUpdated(blockNumberCache, 
            _parameterSelector(PARAMETERS.CEC), value1);
        emit ParameterUpdated(blockNumberCache, 
            _parameterSelector(PARAMETERS.CO2P), value2);
        emit ParameterUpdated(blockNumberCache, 
            _parameterSelector(PARAMETERS.SCR), value3);
        
        _lastUpdatedBlock = blockNumberCache;
    }

    function setBlockPeriod(uint32 blockPeriod) public override {
        require(blockPeriod > 0, 
            "GasPriceOracleV1: block period can't be zero");
        require(_blockPeriod != blockPeriod, 
            "GasPriceOracleV1: block period value exist");
        _blockPeriod = blockPeriod;

        emit ParameterBlockPeriodUpdate(blockPeriod);
    }

    function getBlockPeriod() public override view returns (uint256) {
        return _blockPeriod;
    }

    function getLastUpdatedBlock() public override view returns(uint256) {
        return _lastUpdatedBlock;
    }

    function calculateTransactionFee(uint256 gasLimit) public override view returns (uint256) {
        // Carbon Emission Kg/kWh
        // uint256 carbonEmission = (_CEC * _blockPeriod /*_CO2P * *//(ONE_HOUR * 1000));
        // Calculate carbon emission
        uint256 carbonEmission = (_config.carbonEmissionCoefficient * _blockPeriod) * _constant;
        // Calculate validator contribution
        uint256 validatorContribution = (_config.c * _config.numberOfValidator);
        // Calculate charge rate
        uint256 chargeRate = (1 + _config.chargeRate);
        // Calculate total transaction fee
        uint256 transactionFee = (_config.k * gasLimit + validatorContribution) * chargeRate * carbonEmission;
        return transactionFee;
    }
}