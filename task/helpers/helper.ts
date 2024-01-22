// import { task } from "hardhat/config"
// import { ethers } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const loadCommitteContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("Committee", 
        "0x0000000000000000000000000000000000000776");
}

export const loadSupplyControlContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("SupplyControl", 
        "0x0000000000000000000000000000000000000777");
}

export const loadTxFeeDistributorContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("SupplyControl", 
        "0x0000000000000000000000000000000000000778");
}

export const getProposerSigner = async (account: SignerWithAddress) => {

    // return proposer
}

export const getCommitteeSigner = async (account: SignerWithAddress) => {

    // return committee
}
