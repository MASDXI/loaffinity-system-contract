import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("propose_committee", "propose new committee proposal")
  .addParam("account", "destination address")
  .addParam("proposaltype", "remove:0, add:1")
  .addParam("blocknumber", "target block to execute")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre)
    const account = String(args.account)
    const proposalType = Number(args.proposaltype) // TODO validation input
    const blockTarget = BigInt(args.blocknumber)
    console.log(`account: ${account}\nproposalType: ${proposalType}\nblockNumber: ${blockTarget}
    `)
    try {
        const tx: any = await committee.propose(blockTarget, account, proposalType);
        await tx.wait()
        const { blockNumber, blockHash, hash } = await tx.getTransaction()
        console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
    } catch (err) {
        console.error(err)
    }
  })