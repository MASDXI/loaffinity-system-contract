import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("get_committee_count", "check committee number")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre);
    try {
        const tx = await committee.getCommitteeCount();
        console.log(tx);
    } catch (err) {
        console.error(err);
    }
})