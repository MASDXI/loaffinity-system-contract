import * as fs from 'fs';
import { ethers } from 'ethers';

const solidityFilePath = './contracts/abstracts/Initializer.sol';
const constantFilePath = './test/utils/constants.ts';
const listFilePath = [solidityFilePath, constantFilePath];
const oldAddress = '0x0000000000000000000000000000000000000000';
const newAddress =
  process.env.INITIALIZER_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address);
}

async function updateAddressInFile(filePath: string): Promise<void> {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');

    // Replace the old address with the new address
    const match = data.match(newAddress);
    if (match == null) {
        const updatedContent = data.replace(oldAddress, newAddress);
        // Validate the new address
        if (!isValidEthereumAddress(newAddress)) {
            console.error('Invalid Ethereum address.');
            return;
        }
    
        await fs.promises.writeFile(filePath, updatedContent, 'utf8');
        console.log(`Address replaced and validated successfully in ${filePath}.`);
    } else {
        console.error(`Address already updated in ${filePath}.`);
        return;
    }

  } catch (error) {
    console.error(`Error updating file ${filePath}: ${error}`);
  }
}

async function main() {
  for (const filePath of listFilePath) {
    await updateAddressInFile(filePath);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});