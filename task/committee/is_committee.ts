import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("is_committee", "check is given address is committee")
  .addParam("account", `given address e.g. "0x9784e7348e2A4EbDC059e0BCC575D874d96ce88c"`)
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