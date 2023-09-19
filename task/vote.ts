import ethers from 'hardhat';
import committeeAritifact from "../artifacts/contracts/Committee.sol/Committee.json"
import supplyControlArtifact from "../artifacts/contracts/SupplyContol.sol/SupplyControl.json"

// passing from arg cli proposalId, auth
async function vote() {
    //
}

vote().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });