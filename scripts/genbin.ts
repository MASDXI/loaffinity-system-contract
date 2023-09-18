// import { ethers } from "hardhat";
import committeeAritifact from "../artifacts/contracts/Committee.sol/Committee.json"
import supplyControlArtifact from "../artifacts/contracts/SupplyContol.sol/SupplyControl.json"

async function main() {
  console.log("CommitteeBin:", committeeAritifact.abi)
  console.log("CommitteeBin:", committeeAritifact.deployedBytecode)
  console.log("SupplyControlBin:", supplyControlArtifact.abi)
  console.log("SupplyControlBin:", supplyControlArtifact.deployedBytecode)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
