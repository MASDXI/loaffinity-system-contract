import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("is_committee", "check is given address is committee")
  .addParam("account", `given address e.g. "0x7c55259cc19af2ab5f417680884b5b642e20cdc4"`)
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre)
    const account = String(args.account)
    try {
        const tx = await committee.isCommittee(account);
        console.log(tx)
    } catch (err) {
        console.error(err)
    }
})