import { task } from "hardhat/config"
import { loadCommitteContract, loadSupplyControlContract } from "../helpers/helper";
import { ContractTransactionResponse, TransactionResponse } from "ethers";

task("initialize", "init system contract")
    .addParam("proposal", "voteDelay_")
    .addParam("auth", "votePeriod_")
    .addParam("contract", "proposePeriod_")
    .addParam("contract", "address [] calldata committees_")
    .addParam("admin","admin_")
    .setAction(async (args, hre) => {

    })