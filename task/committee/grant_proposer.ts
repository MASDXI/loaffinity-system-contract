import { task } from "hardhat/config"
import { loadCommitteContract } from "../helpers/helper"

task("grant_proposer", "propose new committee proposal")
  .addParam("account", "expected committee address")
  .addParam("action", "revoke:0, grant:1")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre);
    const account = String(args.account);
    const signers = await hre.ethers.getSigners();
    const action = Number(args.action);
    const adminHash = await committee.ROOT_ADMIN_ROLE();      
    let res : any
    switch(action) { 
        case 0: { 
            try { 
                if(await committee.isInit()){
                    if(await committee.hasRole(adminHash, signers[0].address)){
                        res = await committee.connect(signers[0]).revokeProposer(account);
                        await res.wait();
                        const { blockNumber, blockHash, hash } = await res.getTransaction();
                        console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
                    }else{
                        console.log("committee: onlyAdmin can call");
                    } 
                }else{
                    console.log("committee: not initialized yet")
                }
            } catch (error) {
                console.error(error);
            }
            break; 
        } 
        case 1: {
            try { 
                if(await committee.isInit()){
                    if(await committee.hasRole(adminHash, signers[0].address)){
                        res = await committee.connect(signers[0]).grantProposer(account);
                        await res.wait()
                        const { blockNumber, blockHash, hash } = await res.getTransaction();
                        console.log(`blockNumber: ${blockNumber}\nblockHash: ${blockHash}\nhash: ${hash}`);
                    }else{
                        console.log("committee: onlyAdmin can call");
                    } 
                }else{
                    console.log("committee: not initialized yet")
                }
            } catch (error) {
                console.error(error);
            }
            break; 
        } 
        default: { 
            console.log(`Invalid action`);
           break; 
        } 
     }
  })