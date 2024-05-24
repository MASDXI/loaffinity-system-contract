import { task } from "hardhat/config"
import { loadServiceProviderProxyContract } from "../helpers/helper"

task("grant_merchant", "grant a merchant")
  .addParam("account", "expected agent address")
  .addParam("action", "revoke:0, grant:1")
  .setAction(async (args, hre) => {
    const serviceProvider = await loadServiceProviderProxyContract(hre);
    const account = String(args.account);
    const action = Number(args.action);
    const signers = await hre.ethers.getSigners();
    let res : any
    switch (action) {
        case 0:
            {
                res = await serviceProvider.connect(signers[0]).revokeMerchant(account);
                await res.wait();
                const { blockNumber, blockHash, hash } = await res.getTransaction();
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
            }
            break;
        case 1:
            {
                res = await serviceProvider.connect(signers[0]).grantMerchant(account);
                await res.wait();
                const { blockNumber, blockHash, hash } = await res.getTransaction();
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
            }
            break;
        default:
            console.log(`Invalid action`);
            break;
    }
  })