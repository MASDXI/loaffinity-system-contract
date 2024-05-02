import { task } from "hardhat/config"
import { loadServiceProviderProxyContract, loadTreasuryContract } from "../helpers/helper";

task("initialize_service_provider_proxy", "init system contract")
    .addParam("implementaion","implementation")
    .addParam("configuration","configuration")
    // change it to optional cause committee contract preload in genesis json
    .addParam("committeeContract")
    .setAction(async (args, hre) => {
        const proxy = await loadServiceProviderProxyContract(hre);
        const signer = await hre.ethers.getSigners();
        // parameters
    })