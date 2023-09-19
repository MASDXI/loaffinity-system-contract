import { HardhatUserConfig, task } from "hardhat/config"
import { constants } from "../test/utils/constanst";
import { ethers } from "ethers";

task("grant_proposer", "propose new committee proposal")
  .addParam("account", "destination address")
  .addParam("action", "revoke:0, grant:1")
  .setAction(async (args, hre) => {
    const committee = await hre.ethers.getContractAt("Committee",constants.COMMITTEE_CONTRACT_ADDRESS)
    const account = String(args.account)
    const action = Number(args.action)
    switch(action) { 
        case 0: { 
            try { 
                const tx = await committee.revokeProposer(account)
                await tx.wait()
                const { blockNumber, blockHash, hash } = await tx.getTransaction()
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
            } catch (error) {
                console.error(error);
            }
            break; 
        } 
        case 1: {
            try { 
                const tx = await committee.grantProposer(account)
                await tx.wait()
                const { blockNumber, blockHash, hash } = await tx.getTransaction()
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
            } catch (error) {
                console.error(error);
            }
            break; 
        } 
        default: { 
            console.log(`Invalid acction`)
           break; 
        } 
     }
  })

task("propose_committee", "propose new committee proposal")
  .addParam("account", "destination address")
  .addParam("proposaltype", "remove:0, add:1")
  .addParam("blocknumber", "target block to execute")
  .setAction(async (args, hre) => {
    const committee = await hre.ethers.getContractAt("Committee",constants.COMMITTEE_CONTRACT_ADDRESS)
    const account = String(args.account)
    const proposalType = Number(args.proposaltype) // TODO validation input
    const blockTarget = BigInt(args.blocknumber)
    console.log(`account: ${account}\nproposalType: ${proposalType}\nblockNumber: ${blockTarget}
    `)
    try {
        const tx = await committee.propose(blockTarget, account, proposalType);
        await tx.wait()
        const { blockNumber, blockHash, hash } = await tx.getTransaction()
        console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
    } catch (err) {
        console.error(err)
    }
  })

task("propose_supply", "propose new supply proposal")
  .addParam("account", "destination address")
  .addParam("amount", "token new listing price")
  .addParam("proposaltype", "burn:0, mint:1")
  .addParam("blocknumber", "target block to execute")
  .setAction(async (args, hre) => {
    const supplycontrol = await hre.ethers.getContractAt("SupplyControl",constants.SUPPLY_CONTRACT_ADDRESS)
    const signers = await hre.ethers.getSigners();
    const account = String(args.account)
    const amount = String(args.amount)
    const proposalType = Number(args.proposaltype) // TODO validation input
    const blockTarget = BigInt(args.blocknumber)
    console.log(`PrepareTransaction`)
    console.log(`account: ${account}\namount: ${amount}\nproposalType: ${proposalType}\nblockNumber: ${blockTarget}`)
    try {
        const tx = await supplycontrol.connect(signers[0]).propose(blockTarget,  ethers.parseEther(amount), account, proposalType);
        await tx.wait()
        // const { blockNumber, blockHash, hash } = await tx.getTransaction()
        console.log(`TransactionResponse`)
        console.log(await tx.getTransaction())
    } catch (err) {
        console.error(err)
    }
  })

task("isproposer", "propose new committee proposal")
  .addParam("account", "destination address")
  .setAction(async (args, hre) => {
    const committee = await hre.ethers.getContractAt("Committee",constants.COMMITTEE_CONTRACT_ADDRESS)
    const account = String(args.account)
    try {
        const tx = await committee.isProposer(account);
        console.log(tx)
    } catch (err) {
        console.error(err)
    }
  })

  task("getproposal", "propose new committee proposal")
  .addParam("block", "destination address")
  .setAction(async (args, hre) => {
    const committee = await hre.ethers.getContractAt("SupplyControl",constants.SUPPLY_CONTRACT_ADDRESS)
    const block = BigInt(args.block)
    try {
        const tx = await committee.getProposalSupplyInfoByBlockNumber(block);
        console.log(tx)
    } catch (err) {
        console.error(err)
    }
  })

task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log("address :", account.address);
    }
});