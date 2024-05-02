import { task } from "hardhat/config"
import { loadServiceProviderProxyContract } from "../helpers/helper";

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
        let tx: any;
        try {
            if(signers[0].address == process.env.INITIALIZER_ADDRESS){
                tx = await proxy.connect(signers[0]).initialize(implementaion, committeeaddress);
                await tx.wait();
                const { blockNumber, blockHash, hash } = await tx.getTransaction();
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
            }else{
                console.log("initializer: onlyInitializer can call");
            } 
        } catch (err) {
            // TODO move error to error selector
            console.error(err);
        }
    })