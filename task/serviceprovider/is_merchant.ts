import { task } from "hardhat/config"
import { loadServiceProviderProxyContract } from "../helpers/helper"
import { ZeroAddress } from "ethers";

task("is_merchant", "check is given address is merchant")
  .addParam("account", `given address example "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c"`)
  .setAction(async (args, hre) => {
    const serviceProvider = await loadServiceProviderProxyContract(hre);
    const account = String(args.account);
    try {
        const tx = await serviceProvider.getServiceProviderOfMerchant(account);
        console.log(tx != ZeroAddress ? true : false);
    } catch (err) {
        console.error(err);
    }
})
