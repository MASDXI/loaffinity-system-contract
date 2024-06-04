import { task } from "hardhat/config"
import { loadCommitteContract} from "../helpers/helper";
import { ContractTransactionResponse, TransactionResponse } from "ethers";

task("initialize_committee", "init system contract")
    .addParam("delay", "voteDelay_")
    .addParam("period", "votePeriod_")
    .addParam("proposeperiod", "proposePeriod_")
    .addParam("retention", "retentionPeriod_")
    .addParam("committees", "address [] calldata committees_")
    .addParam("admin","admin_")
    .setAction(async (args, hre) => {
        const committee = await loadCommitteContract(hre);
        const signers = await hre.ethers.getSigners();
        const delay = BigInt(args.delay);
        const period = BigInt(args.period);
        const retention = BigInt(args.retention);
        const committees = Array(args.committees);
        const proposeperiod = BigInt(args.proposeperiod);
        const admin = String(args.admin);
        // TODO change type any to specific type and validate signer before action.
        let tx: ContractTransactionResponse;
        let txReceipt: TransactionResponse | null;
        try {
            if(signers[0].address == process.env.INITIALIZER_ADDRESS) {
                tx = await committee.connect(signers[0]).initialize(
                    delay, 
                    period, 
                    proposeperiod, 
                    retention, 
                    committees,  
                    admin ? admin : signers[0].address);
                await tx.wait();
                txReceipt = await tx.getTransaction();
                console.log(`blockNumber: ${txReceipt?.blockNumber}\nblockHash: ${txReceipt?.blockHash}\nhash: ${txReceipt?.hash}`);
            }else{
                console.log("initializer: onlyInitializer can call")
            } 
        } catch (err) {
            // TODO move error to error selector
            console.error(err);
        }
    })