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
    // TODO change type any to specific type and validate signer before action.
    let res: any;
    switch (contract) {
      case 0: { 
        try{
          res = await committee.cancel(blocknumber);
          await res.wait();
          res = await res.getTransaction();
          console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`);
        } catch (error) {
          console.error(error);
        }
        break; 
      }
      case 1: {
        try{
          res = await treasury.cancel(blocknumber);
          await res.wait();
          res = await res.getTransaction();
          console.log(`blockNumber: ${res.blockNumber}\nblockHash: ${res.blockHash}\nhash: ${res.hash}`);
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

