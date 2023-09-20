import { task } from "hardhat/config"
import { loadSupplyControlContract, loadCommitteContract } from "./helper"

task("get_proposal_id_by_blocknumber", "get proposal id by given blocknumber")
  .addParam("block", "destination address")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const block = BigInt(args.block)
    const contract = Number(args.contract)
    let ret: any
    switch (contract) {
      case 0:
        const committee = await loadCommitteContract(hre)
        ret = await committee.getProposalCommitteeInfoByBlockNumber(block)
        console.log(ret)
        break;
      case 1:
        const supplycontrol = await loadSupplyControlContract(hre)
        ret = await supplycontrol.getProposalSupplyInfoByBlockNumber(block)
        console.log(ret)
        break;
      default:
        console.log("Invalid contract type")
        break;
    }
  })

task("get_proposal_by_proposalid", "get proposal by given proposal id")
  .addParam("proposalid", "destination address")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const proposalid = String(args.block)
    const contract = Number(args.contract)
    let ret
    switch (contract) {
      case 0:
        const committe = await loadSupplyControlContract(hre)
        ret = await committe.getProposalSupplyInfoByProposalId(proposalid);
        console.log(ret)
        break;
      case 1:
        const supplycontrol = await loadSupplyControlContract(hre)
        ret = await supplycontrol.getProposalSupplyInfoByProposalId(proposalid);
        console.log(ret)
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