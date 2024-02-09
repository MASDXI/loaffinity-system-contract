import { task } from "hardhat/config"
import { loadCommitteContract, loadSupplyControlContract } from "../helpers/helper";

task("cancel", "execute proposal")
  .addParam("blocknumber", "blockNumber ")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const blocknumber = String(args.blocknumber)
    const contract = Number(args.contract)
    let res: any
    switch (contract) {
        case 0:
          const committee = await loadCommitteContract(hre)
          res = await committee.cancel(blocknumber)
          await res.wait()
          res = await res.getTransaction()
          console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`)
          break;
        case 1:
          const supplycontrol = await loadSupplyControlContract(hre)
          res = await supplycontrol.cancel(blocknumber)
          await res.wait()
          res = await res.getTransaction()
          console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`)
          break;
        default:
          console.log("Invalid contract type")
          break;
      }
  })

