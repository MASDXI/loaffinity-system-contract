import { task } from "hardhat/config"
import { loadServiceProviderProxyContract } from "../helpers/helper";
import { ContractTransactionResponse, TransactionResponse } from "ethers";

task("initialize_service_provider_proxy", "init system contract")
    .addParam("implementaion","implementation")
    // change it to optional cause committee contract preload in genesis json
    .addParam("committeeContract","address committee contract")
    .setAction(async (args, hre) => {
        const proxy = await loadServiceProviderProxyContract(hre);
        const signers = await hre.ethers.getSigners();
        const implementaion = String(args.implementaion);
        const committeeaddress = String(args.committeeContract);
        // TODO change type any to specific type
        let tx: ContractTransactionResponse;
        let txReceipt: TransactionResponse | null;
        try {
            if(signers[0].address == process.env.INITIALIZER_ADDRESS){
                tx = await proxy.connect(signers[0]).initialize(implementaion, committeeaddress);
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