import { task } from "hardhat/config"
import { loadSupplyControlContract } from "../helpers/helper";

task("initialize_supply", "init system contract")
    .addParam("delay", "voteDelay_")
    .addParam("period", "votePeriod_")
    .addParam("proposeperiod", "proposePeriod_")
    .addParam("committeeaddress", "address committee contract")
    .setAction(async (args, hre) => {
        const supplycontrol = await loadSupplyControlContract(hre);
        const signers = await hre.ethers.getSigners();
        const delay = BigInt(args.delay);
        const period = BigInt(args.period);
        const proposeperiod = BigInt(args.proposeperiod);
        const committeeaddress = String(args.committeeaddress);
        let tx: any
        try {
            // should handle if sigenrs[0] is not match intili
            tx = await supplycontrol.initialize(
                delay, period, proposeperiod, committeeaddress);
            await tx.wait()
            const { blockNumber, blockHash, hash } = await tx.getTransaction()
            console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
        } catch (err) {
            console.error(err)
        }
    })