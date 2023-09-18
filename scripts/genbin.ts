// import { ethers } from "hardhat";
import { deployedBytecode as CommitteeBin } from "../artifacts/contracts/Committee.sol/Committee.json"
import { deployedBytecode as SupplyControlBin } from "../artifacts/contracts/SupplyContol.sol/SupplyControl.json"

async function main() {
  console.log("CommitteeBin:", CommitteeBin)
  console.log("SupplyControlBin:", SupplyControlBin)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
