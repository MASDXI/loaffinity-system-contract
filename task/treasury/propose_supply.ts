import { task } from "hardhat/config"
import { ethers } from "ethers";
import { loadCommitteContract, loadSupplyControlContract } from "../helpers/helper"

task("propose_supply", "propose new supply proposal")
  .addParam("account", "destination address")
  .addParam("amount", "token new listing price")
  .addParam("proposaltype", "burn:0, mint:1")
  .addParam("blocknumber", "target block to execute")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre);
    const supplycontrol = await loadSupplyControlContract(hre);
    const signers = await hre.ethers.getSigners();
    const account = String(args.account);
    const amount = String(args.amount);
    const proposalType = Number(args.proposaltype);
    if (!isValidProposalType(proposalType)) {
      console.error("Invalid proposalType. Please provide either 0 for remove or 1 for add.");
      return;
    }
    const blockTarget = BigInt(args.blocknumber);
    console.log(`PrepareTransaction`);
    console.log(`account: ${account}\namount: ${amount}\nproposalType: ${proposalType}\nblockNumber: ${blockTarget}`);
    try {
      if(await supplycontrol.isInit()){
        if(await committee.isProposer(signers[0].address)){
          const res: any = await supplycontrol.propose(blockTarget, amount, account, proposalType);
          await res.wait();
          const { blockNumber, blockHash, hash } = await res.getTransaction();
          console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
        }else{
          console.log("committee: onlyProposer can call");
        } 
      }else{
        console.log("committee: not initialized yet")
      }
    } catch (err) {
        console.error(err);
    }
  })
  function isValidProposalType(type: number) {
    return type === 0 || type === 1;
  }