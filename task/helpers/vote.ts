import { task } from "hardhat/config"
import { loadCommitteContract, loadSupplyControlContract } from "../helpers/helper";
import { ContractTransactionResponse, TransactionResponse } from "ethers";

task("vote", "vote proposal")
  .addParam("proposal", "destination ")
  .addParam("auth", "auth")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const proposal = String(args.proposal)
    const auth = Boolean(args.auth)
    const contract = Number(args.contract)
    let res: any
    switch (contract) {
        case 0:
          const committee = await loadCommitteContract(hre)
          res = await committee.vote(proposal, auth)
          await res.wait()
          res = await res.getTransaction()
          console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`)
          break;
        case 1:
          const supplycontrol = await loadSupplyControlContract(hre)
          res = await supplycontrol.vote(proposal, auth)
          await res.wait()
          res = await res.getTransaction()
          console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`)
          break;
        default:
          console.log("Invalid contract type")
          break;
      }
  })
