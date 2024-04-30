// conversion of logic on solidity into helper logic
export async function gasLogicV1(
    carbonEmissionCoefficient: any,
    carbonCaptureCost: any,
    sustainabilityChargeRate: any,
    idlePowerConsumption: any,
    numberOfValidator: any,
    powerConsumptionPerGas: any,
    blockPeriod: any,
    constant: any,
    gaslimit: any) {
    // Solidity Code
    // function calculate(uint256 gas) public view returns (uint256) {
    //     // Carbon Emission Kg/kWhsion
    //     uint256 carbonEmission = (_config.carbonEmissionCoefficient * 
    //         _blocktime) * _config.carbonCaptureCost * _constant;
    //     // Calculate validator contribution
    //     uint256 validatorContribution = (_config.idlePowerConsumption *
    //         _config.numberOfValidator);
    //     // Calculate charge rate
    //     uint256 chargeRate = (1 + _config.sustainabilityChargeRate);
    //     // Calculate total transaction fee
    //     uint256 transactionFee = (_config.powerConsumptionPerGas *
    //         gas +
    //         validatorContribution) *
    //         chargeRate *
    //         carbonEmission;
    //     return transactionFee;
    // }
    let carbonEmission = (carbonEmissionCoefficient * blockPeriod) * carbonCaptureCost * constant;
    let validatorContribution = (idlePowerConsumption * numberOfValidator);
    let chargeRate = (1n + sustainabilityChargeRate);
    let transactionFee = (powerConsumptionPerGas * gaslimit + validatorContribution) * chargeRate * carbonEmission;
    return transactionFee;
}