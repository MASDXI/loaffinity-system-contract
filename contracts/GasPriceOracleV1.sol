// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//@TOOD 
// adding permission to change parameters
// adding to keep tracking active validator length

contract GasPriceOracle {

    enum PARAMETERS { CEC, CO2P, SCR }

    enum FLAG { DISABLE, ENABLE }

    event ParameterUpdated(uint256 indexed blockNumber, string indexed params, uint256 value);
    event Enabled();
    event Disabled();

    uint32 constant private ONE_YEAR = 31_536_000; // 1 year in seconds.
    uint32 constant private ONE_HOUR = 3_600;      // 1 hour in seconds.
    /* Annaul Update Parameter*/
    /* Carbon Emission per Kilowatt-hour Coeffcient*/
    uint256 private _CEC;
    /* Carbon Price */
    uint256 private _CO2P;
    /* Sustainability Charge Rate */
    uint256 private _SCR;

    /* K', C', H'*/
    uint256 private _C; // float
    uint256 private _H; // number of validator
    uint256 private _K; // wei

    /* Blockchain config */
    uint256 private _blockPeriod;
    uint256 private _constant;
    uint256 private _lastUpdatedBlock;
    bool private _init;
    FLAG private _flag;

    function initialize() public {
        require(!_init);
        _CEC = 1;                 // no decimal
        _CO2P = 344000000;        // decimal 9
        _SCR = 1;                 // no decimal
        _C = 15748000000;         // decimal 9
        _H = 4;                   // no decimal
        _K = 300;                 // decimal 9
        setBlockPeriod(15);       // decimal 9 _15/(ONE_HOUR * 1000)
        _constant = 278;
        _init = true;
    }

    function Enable() public {
        if (_flag == FLAG.ENABLE) {
            _flag = FLAG.DISABLE;
            emit Disabled();
        } else {
            _flag = FLAG.ENABLE;
            emit Enabled();
        }
    }

    function _parameterSelector(PARAMETERS param) private pure returns (string memory) {
        require(uint8(param) <= 3);
        if (param == PARAMETERS.CEC) return "CEC";
        if (param == PARAMETERS.CO2P) return "CO2P";
        if (param == PARAMETERS.SCR) return "SCR";
    }

    function setValue(uint32 value1, uint32 value2, uint32 value3) public {
        require(block.number - getLastUpdatedBlock() >= ONE_YEAR, "GasPriceOracle: It's not yet time to update values.");
        _CEC = value1;
        _CO2P = value2;
        _SCR = value3;
        emit ParameterUpdated(block.number, _parameterSelector(PARAMETERS.CEC), value1);
        emit ParameterUpdated(block.number, _parameterSelector(PARAMETERS.CO2P), value2);
        emit ParameterUpdated(block.number, _parameterSelector(PARAMETERS.SCR), value3);
    }

    function setBlockPeriod(uint32 blockPeriod) public {
        require(blockPeriod > 0, "GasPriceOracle: block period can't be zero");
        _blockPeriod = blockPeriod;
    }

    function getBlockPeriod() public view returns (uint256) {
        return _blockPeriod;
    }

    function getLastUpdatedBlock() public view returns(uint256) {
        return _lastUpdatedBlock;
    }

    function gasPrice(uint256 gasLimit) public view returns (uint256) {
        // Calculate carbon emission contribution
        // Carbon Emission Kg/kWh
        // uint256 carbonEmission = (_CEC * _blockPeriod /*_CO2P * *//(ONE_HOUR * 1000));
        uint256 carbonEmission = _CEC * _blockPeriod * _constant;
        // Calculate validator contribution
        uint256 validatorContribution = _C * _H;
        // Calculate total gas price
        uint256 totalGasFee = (_K * gasLimit + validatorContribution)* (1 + _SCR) * carbonEmission;
        return totalGasFee;
    }
}