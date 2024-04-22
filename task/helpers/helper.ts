// import { task } from "hardhat/config"
// import { ethers } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const loadCommitteContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("Committee", 
        "0x0000000000000000000000000000000000000776");
}

export const loadTreasuryContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("TreasuryContract", 
        "0x0000000000000000000000000000000000000777");
}

export const loadTxFeeDistributorContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("treasury", 
        "0x0000000000000000000000000000000000000778");
}

export const constants = { 
    // should refactor
    "TESTNET_URL":"http://localhost:8545",
}

export const getProposerSigner = async (account: SignerWithAddress) => {

    // return proposer
}

export const getCommitteeSigner = async (account: SignerWithAddress) => {

    // return committee
}
