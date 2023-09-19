import ethers from 'hardhat';
import committeeAritifact from "../artifacts/contracts/Committee.sol/Committee.json"
import supplyControlArtifact from "../artifacts/contracts/SupplyContol.sol/SupplyControl.json"

// passing from arg cli propose committee or supply
async function propose() {
    //
}

propose().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });