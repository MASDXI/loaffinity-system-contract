import { task } from "hardhat/config"
import { loadGasPriceOracleV1Contract } from "../helpers/helper"

task("set_configuration", "set configuration parameters in gas price oracle v1")
  .addParam("carbonEmissionCoefficient", "carbon emission coefficient")
  .addParam("carbonCaptureCost", "carbon capture cost per kilograms")
  .addParam("sustainabilityChargeRate", "sustainability charge rate")
  .addParam("idlePowerConsumption", "idle power consumption of validator node")
  .addParam("numberOfValidator", "number of validator that participate in consensus")
  .addParam("powerConsumptionPerGas", "power consumption per unit of gas")
  .setAction(async (args, hre) => {
    const gasPriceOracleV1Address = "";
    const gasPriceOracleV1 = await loadGasPriceOracleV1Contract(hre, gasPriceOracleV1Address);
    const carbonEmissionCoefficient = BigInt(args.carbonEmissionCoefficient);
    const carbonCaptureCost = BigInt(args.carbonCaptureCost);
    const sustainabilityChargeRate = BigInt(args.sustainabilityChargeRate);
    const idlePowerConsumption = BigInt(args.idlePowerConsumption);
    const numberOfValidator = BigInt(args.numberOfValidator);
    const powerConsumptionPerGas = BigInt(args.numberOfValidator);
    const signers = await hre.ethers.getSigners();
    let res : any
    res = await gasPriceOracleV1.connect(signers[0]).setConfiguration({
        carbonEmissionCoefficient,
        carbonCaptureCost,
        sustainabilityChargeRate,
        idlePowerConsumption,
        numberOfValidator,
        powerConsumptionPerGas});      
    await res.wait();
    const { blockNumber, blockHash, hash } = await res.getTransaction();
    console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
  })
