import { task } from "hardhat/config"
import { loadTreasuryContract } from "../helpers/helper";

task("initialize_supply", "init system contract")
    .addParam("delay", "voteDelay_")
    .addParam("period", "votePeriod_")
    .addParam("proposeperiod", "proposePeriod_")
    .addParam("retention", "retentionPeriod_")
    .addParam("committeeaddress", "address committee contract")
    .setAction(async (args, hre) => {
        const treasury = await loadTreasuryContract(hre);
        const signers = await hre.ethers.getSigners();
        const delay = BigInt(args.delay);
        const period = BigInt(args.period);
        const proposeperiod = BigInt(args.proposeperiod);
        const retention = BigInt(args.retention);
        const committeeaddress = String(args.committeeaddress);
        let tx: any
        try {
            if(signers[0].address == process.env.INITIALIZER_ADDRESS){
                tx = await treasury.connect(signers[0]).initialize(
                    delay, period, proposeperiod, retention, committeeaddress);
                await tx.wait()
                const { blockNumber, blockHash, hash } = await tx.getTransaction();
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
            }else{
                console.log("initializer: onlyInitializer can call");
            } 
        } catch (err) {
            console.error(err);
        }
    })