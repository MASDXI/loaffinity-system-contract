// import { task } from "hardhat/config"
// import { ethers } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const loadCommitteContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("Committee", process.env.COMMITEE_CONTRACT_ADDRESS ?
    process.env.COMMITEE_CONTRACT_ADDRESS:"0x0000000000000000000000000000000000000069") 
}

export const loadSupplyControlContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("SupplyControl", process.env.SUPPLY_CONTROL_CONTRACT_ADDRESS ? 
    process.env.SUPPLY_CONTROL_CONTRACT_ADDRESS:"0x0000000000000000000000000000000000000070")
}

export const getProposerSigner = async (account: SignerWithAddress) => {

    // return proposer
}

export const getCommitteeSigner = async (account: SignerWithAddress) => {

    // return committee
}
