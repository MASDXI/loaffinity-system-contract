// import { task } from "hardhat/config"
// import { ethers } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { constants as test }  from "../../test/utils/constants";

export const loadCommitteContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("Committee", 
        test.COMMITTEE_CONTRACT_ADDRESS);
}

export const loadTreasuryContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("TreasuryContract", 
        test.TREASURY_CONTRACT_ADDRESS);
}

export const loadGasPriceOracleProxyContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("GasPriceOracleProxy",
        test.GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS);
}

export const loadServiceProviderProxyContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("ServiceProviderProxy",
        test.SERVICE_PROVIER_PROXY_CONTRACT_ADDRESS);
}

export const loadTxFeeDistributorContract = async (hre: HardhatRuntimeEnvironment) => {
    return await hre.ethers.getContractAt("TransactionFeeDistributor", 
        "0x0000000000000000000000000000000000000fff");
}

export const loadGasPriceOracleV1Contract = async (hre: HardhatRuntimeEnvironment, ContractAddress:string ) => {
    return await hre.ethers.getContractAt("GasPriceOracleV1", ContractAddress);
}

export const constants = { 
    // should refactor
    "TESTNET_URL":"http://localhost:8545",
}

export const validateSigner = async (account: SignerWithAddress) => {
    // return true if signer can call
    // return false if signer can't call
}

export const isContractInitialized = async () => {
    // return true if contract initialized
    // return false if contract no initialized
}
