import fs from 'fs';
import path from 'path';
import committeeArtifact from "../artifacts/contracts/Committee.sol/Committee.json"
import treasuryArtifact from "../artifacts/contracts/TreasuryContract.sol/TreasuryContract.json"

async function main() {
  // Write deployedBytecode to a file
  const outputDir = './build'; // Update with your desired output directory
  const directoryPath = './artifacts/contracts'
  const contracts = [committeeArtifact, treasuryArtifact]

  // Check if the output directory exists, and create it if it doesn't
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    for (let i = 0; i < contracts.length; i++) {
      const contractName = contracts[i].contractName;
      const solidityFile = files.find((file) => file.startsWith(`${contractName}.sol`));

      if (solidityFile) {
        const bytecodeFilePath = path.join(outputDir, `${contractName}.bin`);
        const abiFilePath = path.join(outputDir, `${contractName}.json`);
        fs.writeFileSync(bytecodeFilePath, contracts[i].deployedBytecode);
        fs.writeFileSync(abiFilePath, JSON.stringify(contracts[i].abi, null, 2));
        console.log(`Deployed Bytecode of ${contractName} has been written to ${bytecodeFilePath}`);
        console.log(`ABI of ${contractName} has been written to ${abiFilePath}`);
      } else {
        console.log(`Solidity file for ${contractName} not found in the specified directory.`);
      }
    }
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
