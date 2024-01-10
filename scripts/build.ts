import fs from 'fs';
import path from 'path';
import committeeAritifact from "../artifacts/contracts/Committee.sol/Committee.json"
import supplyControlArtifact from "../artifacts/contracts/TreasuryContract.sol/TreasuryContract.json"

async function main() {
  // Write deployedBytecode to a file
  const outputDir = './build'; // Update with your desired output directory
  const directoryPath = './artifacts/contracts'
  const contracts = [committeeAritifact,supplyControlArtifact]
  // Check if the output directory exists, and create it if it doesn't
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    // Filter files that end with ".sol"
    const solidityFiles = files.filter((file) => file.endsWith('.sol'));

    for (let i = 0; i < solidityFiles.length; i++) {
      const bytecodeFilePath = path.join(outputDir, `${solidityFiles[i]}.bin`);
      const abiFilePath = path.join(outputDir, `${solidityFiles[i]}.json`);
      fs.writeFileSync(bytecodeFilePath, contracts[i].deployedBytecode);
      fs.writeFileSync(abiFilePath, JSON.stringify(contracts[i].abi, null, 2));
      console.log(`Deployed Bytecode of ${solidityFiles[i]} has been written to ${bytecodeFilePath}`);
      console.log(`ABI of ${solidityFiles[i]} has been written to ${bytecodeFilePath}`);
    }
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
