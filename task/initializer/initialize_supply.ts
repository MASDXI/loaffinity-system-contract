import { task } from "hardhat/config"
import { loadTreasuryContract } from "../helpers/helper";
import { ContractTransactionResponse, TransactionResponse } from "ethers";

task("initialize_supply", "init system contract")
    .addParam("delay", "voteDelay_")
    .addParam("period", "votePeriod_")
    .addParam("proposeperiod", "proposePeriod_")
    .addParam("retention", "retentionPeriod_")
    // change it to optional cause committee contract preload in genesis json
    .addParam("committeeaddress", "address committee contract")
    .setAction(async (args, hre) => {
        const treasury = await loadTreasuryContract(hre);
        const signers = await hre.ethers.getSigners();
        const delay = BigInt(args.delay);
        const period = BigInt(args.period);
        const proposeperiod = BigInt(args.proposeperiod);
        const retention = BigInt(args.retention);
        const committeeaddress = String(args.committeeaddress);
        // TODO change type any to specific type
        let tx: ContractTransactionResponse;
        let txReceipt: TransactionResponse | null;
        try {
            if(signers[0].address == process.env.INITIALIZER_ADDRESS){
                tx = await treasury.connect(signers[0]).initialize(
                    delay, period, proposeperiod, retention, committeeaddress);
                await tx.wait();
                txReceipt = await tx.getTransaction();
                console.log(`blockNumber: ${txReceipt?.blockNumber}\nblockHash: ${txReceipt?.blockHash}\nhash: ${txReceipt?.hash}`);
            }else{
                console.log("initializer: onlyInitializer can call");
            } 
        } catch (err) {
            // TODO move error to error selector
            console.error(err);
        }
    })