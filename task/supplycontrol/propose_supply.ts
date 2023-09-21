import { task } from "hardhat/config"
import { ethers } from "ethers";
import { loadSupplyControlContract } from "../helpers/helper"

task("propose_supply", "propose new supply proposal")
  .addParam("account", "destination address")
  .addParam("amount", "token new listing price")
  .addParam("proposaltype", "burn:0, mint:1")
  .addParam("blocknumber", "target block to execute")
  .setAction(async (args, hre) => {
    const supplycontrol = await loadSupplyControlContract(hre)
    const signers = await hre.ethers.getSigners();
    const account = String(args.account)
    const amount = String(args.amount)
    const proposalType = Number(args.proposaltype) // TODO validation input
    const blockTarget = BigInt(args.blocknumber)
    let res: any
    console.log(`PrepareTransaction`)
    console.log(`account: ${account}\namount: ${amount}\nproposalType: ${proposalType}\nblockNumber: ${blockTarget}`)
    try {
        res = await supplycontrol.connect(signers[0]).propose(blockTarget,  ethers.parseEther(amount), account, proposalType);
        await res.wait()
        const { blockNumber, blockHash, hash } = await res.getTransaction()
        console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
    } catch (err) {
        console.error(err)
    }
  })