import {
    loadFixture,
    setBalance,
    time,
    mine,
    setCode
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import { ethers } from "hardhat";
  import { constants } from "./constants"

 export async function setSystemContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [admin, committee1, committee2, committee3, proposer1 , proposer2 , otherAccount] = await ethers.getSigners();
    
    const initializerCallerSigner = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
    await setBalance(constants.INITIALIZER_ADDRESS, 100n ** 18n);
    await setCode(constants.SUPPLY_CONTRACT_ADDRESS, constants.SUPPLY_CONTRACT_BIN);
    await setCode(constants.COMMITTEE_CONTRACT_ADDRESS, constants.COMMITEE_CONTRACT_BIN);
    const supplycontrol = await ethers.getContractAt("TreasuryContract",constants.SUPPLY_CONTRACT_ADDRESS);
    const committee = await ethers.getContractAt("Committee",constants.COMMITTEE_CONTRACT_ADDRESS);
    return { committee, admin , committee1, committee2, committee3, proposer1 , proposer2 , otherAccount, initializerCallerSigner, supplycontrol };
  }

//   export { deployCommitteeFixture }

