import { task } from "hardhat/config"
import { loadCommitteContract} from "../helpers/helper";

task("initialize_committee", "init system contract")
    .addParam("delay", "voteDelay_")
    .addParam("period", "votePeriod_")
    .addParam("proposeperiod", "proposePeriod_")
    .addParam("committees", "address [] calldata committees_")
    .addParam("admin","admin_")
    .setAction(async (args, hre) => {
        const committee = await loadCommitteContract(hre);
        const signers = await hre.ethers.getSigners();
        const delay = BigInt(args.delay);
        const period = BigInt(args.period);
        const committees = Array(args.committees);
        const proposeperiod = BigInt(args.proposeperiod);
        let tx: any
        try {
            // should handle if sigenrs[0] is not match intili
            tx = await committee.connect(signers[0]).initialize(
                delay, period, proposeperiod, committees, signers[0].address);
            await tx.wait()
            const { blockNumber, blockHash, hash } = await tx.getTransaction()
            console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
        } catch (err) {
            console.error(err)
        }
    })