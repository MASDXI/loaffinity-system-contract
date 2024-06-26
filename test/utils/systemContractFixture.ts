import { expect } from "chai";
import { ethers ,artifacts } from "hardhat";
import {
  loadFixture,
  setBalance,
  time,
  mine,
  setCode,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "./constants"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Committee, GasPriceOracleProxy, ServiceProviderProxy, TreasuryContract } from "../../typechain-types";

export interface SystemContractsFixture {
  admin: HardhatEthersSigner;
  committee: Committee;
  committee1: HardhatEthersSigner;
  committee2: HardhatEthersSigner;
  committee3: HardhatEthersSigner;
  gaspriceoracleproxy: GasPriceOracleProxy;
  proposer1: HardhatEthersSigner;
  proposer2: HardhatEthersSigner;
  otherAccount: HardhatEthersSigner;
  otherAccount1: HardhatEthersSigner;
  initializerCallerSigner: HardhatEthersSigner;
  serviceproviderproxy: ServiceProviderProxy;
  treasury: TreasuryContract;
}

export async function setSystemContractFixture(): Promise<SystemContractsFixture> {
  // Contracts are deployed using the first signer/account by default.
  const [admin, 
    committee1, 
    committee2, 
    committee3,
    proposer1, 
    proposer2, 
    otherAccount] = await ethers.getSigners();
    
  const initializerCallerSigner = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
  const otherAccount1 = await ethers.getImpersonatedSigner(constants.RELEASE_TARGET_ADDESS);
    
  // pre-mint native token for initializer.
  await setBalance(constants.INITIALIZER_ADDRESS, constants.ONE_HUNDRED_TOKEN);
  await setBalance(constants.TREASURY_CONTRACT_ADDRESS, constants.ONE_TRILLION_TOKEN);

  // set contract code to pre-load contract address.
  await setCode(constants.COMMITTEE_CONTRACT_ADDRESS, (await (artifacts.readArtifact("contracts/Committee.sol:Committee"))).deployedBytecode);
  await setCode(constants.GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS, (await (artifacts.readArtifact("contracts/proxies/GasPriceOracleProxy.sol:GasPriceOracleProxy"))).deployedBytecode);
  await setCode(constants.SERVICE_PROVIER_PROXY_CONTRACT_ADDRESS, (await (artifacts.readArtifact("contracts/proxies/ServiceProviderProxy.sol:ServiceProviderProxy"))).deployedBytecode);
  await setCode(constants.TREASURY_CONTRACT_ADDRESS, (await (artifacts.readArtifact("contracts/TreasuryContract.sol:TreasuryContract"))).deployedBytecode);

  // load contract from to address
  const committee = await ethers.getContractAt("Committee",
    constants.COMMITTEE_CONTRACT_ADDRESS);
  const gaspriceoracleproxy = await ethers.getContractAt("GasPriceOracleProxy",
    constants.GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS);
  const serviceproviderproxy = await ethers.getContractAt("ServiceProviderProxy",
    constants.SERVICE_PROVIER_PROXY_CONTRACT_ADDRESS);
  const treasury = await ethers.getContractAt("TreasuryContract",
  constants.TREASURY_CONTRACT_ADDRESS);
  // skip first 200 blocks
  await mine(200);
  return { admin, 
      committee,
      committee1, 
      committee2, 
      committee3, 
      gaspriceoracleproxy, 
      proposer1, 
      proposer2,
      otherAccount, 
      otherAccount1, 
      initializerCallerSigner, 
      serviceproviderproxy, 
      treasury
    };
}

export async function setUp(contractName: string, params: any) {
  const { contract } = await ethers.deployContract(contractName, params);
  return contract;
}

export async function targetBlock() {
  const currentBlock = await ethers.provider.getBlockNumber();
  const targetBlock = (BigInt(currentBlock) + constants.VOTE_PERIOD + constants.VOTE_DELAY + constants.EXECUTE_RETENTION_PERIOD) + 2n;
  return targetBlock;
}