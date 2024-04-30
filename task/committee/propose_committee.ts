import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("propose_committee", "propose new committee proposal")
  .addParam("account", "destination address")
  .addParam("proposaltype", "remove:0, add:1")
  .addParam("blocknumber", "target block to execute")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre);
    const account = String(args.account);
    const proposalType = Number(args.proposaltype);
    if (!isValidProposalType(proposalType)) {
      console.error("Invalid proposalType. Please provide either 0 for remove or 1 for add.");
      return;
    }
    const blockTarget = BigInt(args.blocknumber);
    const signers = await hre.ethers.getSigners();
    console.log(`account: ${account}\nproposalType: ${proposalType}\nblockNumber: ${blockTarget}`);
    
    try {
      if(await committee.isInit()){
        if(await committee.isProposer(signers[0].address)){
            // TODO change type any to specific type
            const tx: any = await committee.propose(blockTarget, account, proposalType);
            await tx.wait();
            const { blockNumber, blockHash, hash } = await tx.getTransaction();
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