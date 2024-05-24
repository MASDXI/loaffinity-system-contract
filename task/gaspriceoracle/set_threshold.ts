import { task } from "hardhat/config"
import { loadGasPriceOracleProxyContract } from "../helpers/helper"

task("grant_merchant", "grant a merchant")
  .addParam("consortiumRatio", "consortium ratio")
  .addParam("nodeValidatorRatio", "node validator ratio")
  .addParam("merchantRatio", "merchant ratio")
  .addParam("mobileValidatorRatio", "mobile validator ratio")
  .setAction(async (args, hre) => {
    const gasPriceOracle = await loadGasPriceOracleProxyContract(hre);
    const consortiumRatio = BigInt(args.consortiumRatio);
    const nodeValidatorRatio = BigInt(args.nodeValidatorRatio);
    const merchantRatio = BigInt(args.merchantRatio);
    const mobileValidatorRatio = BigInt(args.mobileValidatorRatio);
    const signers = await hre.ethers.getSigners();

    let res : any
    res = await gasPriceOracle.connect(signers[0]).updateThreshold({
      consortiumRatio,
      nodeValidatorRatio,
      merchantRatio,
      mobileValidatorRatio});      
    await res.wait();
    const { blockNumber, blockHash, hash } = await res.getTransaction();
    console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
  })