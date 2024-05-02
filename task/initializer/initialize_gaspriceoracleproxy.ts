import { task } from "hardhat/config"
import { loadGasPriceOracleProxyContract, loadTreasuryContract } from "../helpers/helper";
import { ContractTransactionResponse, TransactionResponse } from "ethers";

task("initialize_gasprice_oracle_proxy", "init system contract")
    .addParam("implementaion","implementation")
    .addParam("consortiumRatio","consortiumRatio")
    .addParam("nodeValidatorRatio","nodeValidatorRatio")
    .addParam("merchantRatio","merchantRatio")
    .addParam("mobileValidatorRatio","mobileValidatorRatio")
    // change it to optional cause committee contract preload in genesis json
    .addParam("committeeContract","address committee contract")
    .setAction(async (args, hre) => {
        const proxy = await loadGasPriceOracleProxyContract(hre);
        const signers = await hre.ethers.getSigners();
        const implementaion = String(args.implementaion);
        const committeeaddress = String(args.committeeContract);
        const consortiumRatio = BigInt(args.consortiumRatio);
        const nodeValidatorRatio = BigInt(args.nodeValidatorRatio);
        const merchantRatio = BigInt(args.merchantRatio);
        const mobileValidatorRatio = BigInt(args.mobileValidatorRatio);
        const config = {
            "consortiumRatio": consortiumRatio,
            "nodeValidatorRatio": nodeValidatorRatio,
            "merchantRatio": merchantRatio,
            "mobileValidatorRatio": mobileValidatorRatio
        }
        // TODO validate input config
        // TODO change type any to specific type
        let tx: ContractTransactionResponse;
        let txReceipt: TransactionResponse | null;
        try {
            if(signers[0].address == process.env.INITIALIZER_ADDRESS){
                tx = await proxy.connect(signers[0]).initialize(
                    implementaion, committeeaddress, config);
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

