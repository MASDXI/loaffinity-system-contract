import * as fs from 'fs/promises';
import { AddressLike, ZeroAddress, ethers } from 'ethers';
import { PathLike } from 'fs';

const solidityFilePath = './contracts/abstracts/Initializer.sol.template';
const newAddress = process.env.INITIALIZER_ADDRESS || ZeroAddress;

function isValidEthereumAddress(address: AddressLike) {
  return ethers.isAddress(address);
}

async function updateAddressInFile(filePath: PathLike | fs.FileHandle, newAddress: string) {
  try {
    // validate the new address first.
    newAddress = ethers.getAddress(newAddress);
    if (!isValidEthereumAddress(newAddress)) {
      throw new Error('Invalid Ethereum address.');
    }
    let data = await fs.readFile(filePath, 'utf8');
    data = data.replace(/<intializer-address>/, `${newAddress}`);
    // write to file.
    await fs.writeFile(solidityFilePath.replace('.template', ''), data, 'utf8');
    console.log(`Address replaced and validated successfully in ${filePath}.`);
    console.log(`Address replaced with ${newAddress}`);
  } catch (error) {
    console.error(`Error updating file ${filePath}: ${error}`);
  }
}

async function main() {
  await updateAddressInFile(solidityFilePath, newAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
