import { task } from "hardhat/config"
import { loadSupplyControlContract, loadCommitteContract } from "./helper"
import { BytesLike } from "ethers"

task("get_proposal_id_by_blocknumber", "get proposal id by given blocknumber")
  .addParam("block", "destination address")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const block = BigInt(args.block);
    const contract = Number(args.contract);
    let ret: any
    switch (contract) {
      case 0:
        const committee = await loadCommitteContract(hre);
        ret = await committee.blockProposal(block);
        console.log(ret);
        break;
      case 1:
        const supplycontrol = await loadSupplyControlContract(hre);
        ret = await supplycontrol.blockProposal(block);
        console.log(ret);
        break;
      default:
        console.log("Invalid contract type");
        break;
    }
  })

task("get_proposal_by_proposalid", "get proposal by given proposal id")
  .addParam("proposalid", "proposal id example 0x57b009ce2ed43e72782f9f16663c06389009da18e252b5472d2ce2fc8f9cedc9")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const proposalid: BytesLike = (args.proposalid);
    const contract = Number(args.contract);
    let ret: any
    switch (contract) {
      case 0:
        const committe = await loadCommitteContract(hre);
        ret = await committe.getProposalCommitteeInfoByProposalId(proposalid);
        console.log(ret);
        break;
      case 1:
        const supplycontrol = await loadSupplyControlContract(hre);
        ret = await supplycontrol.getProposalSupplyInfoByProposalId(proposalid);
        console.log(ret);
        break;
    }
  })

  task("is_proposal_pass", "get proposal by given proposal id")
  .addParam("proposalid", "destination address")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const proposalid: BytesLike = (args.proposalid);
    const contract = Number(args.contract);
    let ret
    switch (contract) {
      case 0:
        const committe = await loadCommitteContract(hre);
        ret = await committe.isProposalPassed(proposalid);
        console.log(ret)
        break;
      case 1:
        const supplycontrol = await loadSupplyControlContract(hre);
        ret = await supplycontrol.isProposalPassed(proposalid);
        console.log(ret);
        break;
    }
  })

task("get_proposal_by_blocknumber", "get proposal by given blocknumber")
  .addParam("block", "destination address")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const block = BigInt(args.block)
    const contract = Number(args.contract)
    let ret: any
    switch (contract) {
      case 0:
        const committe = await loadCommitteContract(hre)
        ret = await committe.getProposalCommitteeInfoByBlockNumber(block);
        console.log(ret)
        break;
      case 1:
        const supplycontrol = await loadSupplyControlContract(hre)
        ret = await supplycontrol.getProposalSupplyInfoByBlockNumber(block);
        console.log(ret)
        break;
    }
  })

