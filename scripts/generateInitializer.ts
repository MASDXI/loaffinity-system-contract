import * as fs from 'fs/promises';
import { ZeroAddress, ethers } from 'ethers';
import { PathLike } from 'fs';

const solidityFilePath = './contracts/abstracts/Initializer.sol';
const listFilePath = [solidityFilePath];
const lineToReplace = 10; // Replace with the line number where _initializer is defined
const charToReplace = 45; // Replace with the character position within the line
const newAddress = process.env.INITIALIZER_ADDRESS || ZeroAddress;

function isValidEthereumAddress(address: any) {
  return ethers.isAddress(address);
}

async function updateAddressInFile(filePath: PathLike | fs.FileHandle, newAddress: string) {
  try {
     // Validate the new address first
    newAddress = ethers.getAddress(newAddress);
    if (!isValidEthereumAddress(newAddress)) {
      throw new Error('Invalid Ethereum address.');
    }
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');

    if (lines.length >= lineToReplace) {
      const line = lines[lineToReplace - 1];
      if (line.length >= charToReplace) {
        lines[lineToReplace - 1] =
          line.substring(0, charToReplace - 1) +
          newAddress +
          line.substring(charToReplace + newAddress.length - 1);
      } else {
        throw new Error('Character position is beyond the line length.');
      }
    } else {
      throw new Error('Line number is beyond the total number of lines.');
    }

    const updatedContent = lines.join('\n');


    await fs.writeFile(filePath, updatedContent, 'utf8');
    console.log(`Address replaced and validated successfully in ${filePath}.`);
    console.log(`Address replaced with ${newAddress}`);
  } catch (error) {
    console.error(`Error updating file ${filePath}: ${error}`);
  }
}

async function main() {
  for (const filePath of listFilePath) {
    await updateAddressInFile(filePath, newAddress);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
