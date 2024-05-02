import { task } from "hardhat/config"
import { loadCommitteContract, loadTreasuryContract } from "../helpers/helper";

// TODO avoid code duplicate
task("cancel", "cancel proposal")
  .addParam("blocknumber", "blockNumber ")
  .addParam("contract","0:committe 1:supply")
  .setAction(async (args, hre) => {
    const committee = await loadCommitteContract(hre);
    const treasury = await loadTreasuryContract(hre);
    const blocknumber = String(args.blocknumber);
    const contract = Number(args.contract);
    const signers = await hre.ethers.getSigners();
    let res: any;
    switch (contract) {
      case 0: { 
        try{
          if(await committee.isInit()){
            if(await committee.isAgent(signers[0].address)){
              res = await committee.cancel(blocknumber);
              await res.wait();
              res = await res.getTransaction();
              console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`);
            } else{
              console.log("committee: onlyAgent can call")
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
            if(await committee.isAgent(signers[0].address)){
              res = await treasury.cancel(blocknumber);
              await res.wait();
              res = await res.getTransaction();
              console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`);
            } else{
              console.log("committee: onlyAgent can call")
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

