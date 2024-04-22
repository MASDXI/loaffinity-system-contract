import { task } from "hardhat/config"
import { loadCommitteContract, loadTreasuryContract } from "../helpers/helper";

task("vote", "vote proposal")
  .addParam("proposal", "destination ")
  .addParam("auth", "auth")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre);
    const treasury = await loadTreasuryContract(hre);
    const signers = await hre.ethers.getSigners();
    const proposal = String(args.proposal);
    const auth = Boolean(args.auth);
    const contract = Number(args.contract);
    let res: any
    switch (contract) {
      case 0: { 
        try{
          if(await committee.isInit()){
            if(await committee.isCommittee(signers[0].address)){
              res = await committee.vote(proposal, auth);
              await res.wait();
              res = await res.getTransaction();
              console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`);
            } else{
              console.log("committee: onlyCommittee can call")
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
          try{
            if(await treasury.isInit()){
              if(await committee.isCommittee(signers[0].address)){
                res = await treasury.vote(proposal, auth);
                await res.wait();
                res = await res.getTransaction();
                console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`);
              } else{
                console.log("committee: onlyCommittee can call")
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
          console.log(`Invalid contract type`)
        break; 
      } 
      }
  })
