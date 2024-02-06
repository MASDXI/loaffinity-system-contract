import { task } from "hardhat/config"
import { JsonRpcProvider } from "ethers";
import { constants } from "./helper";


task("check_balance", "check balance of a given address")
  .addParam("account", `given address example "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c"`)
  .setAction(async (args, hre) => {

    const provider = new JsonRpcProvider(constants.TESTNET_URL);
    const account = String(args.account)
    try {
        const  balance = await provider.getBalance(account);
        console.log(balance)
    } catch (err) {
        console.error(err)
    }
})
