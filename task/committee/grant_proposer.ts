import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("grant_proposer", "propose new committee proposal")
  .addParam("account", "destination address")
  .addParam("action", "revoke:0, grant:1")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre)
    const account = String(args.account)
    const action = Number(args.action)
    let res : any
    switch(action) { 
        case 0: { 
            try { 
                res = await committee.revokeProposer(account)
                await res.wait()
                const { blockNumber, blockHash, hash } = await res.getTransaction()
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
            } catch (error) {
                console.error(error);
            }
            break; 
        } 
        case 1: {
            try { 
                res = await committee.grantProposer(account)
                await res.wait()
                const { blockNumber, blockHash, hash } = await res.getTransaction()
                console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`)
            } catch (error) {
                console.error(error);
            }
            break; 
        } 
        default: { 
            console.log(`Invalid action`)
           break; 
        } 
     }
  })