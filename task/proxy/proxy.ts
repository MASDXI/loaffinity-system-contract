import { task } from "hardhat/config"
import { loadGasPriceOracleProxyContract, loadServiceProviderProxyContract } from "../helpers/helper";
import { GasPriceOracleProxy, ServiceProviderProxy } from "../../typechain-types";
import { AddressLike, ContractTransactionResponse, TransactionResponse } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const setImplementation = async (
    contract: GasPriceOracleProxy | ServiceProviderProxy,
    implementaion:AddressLike ) => {
    let tx: ContractTransactionResponse;
    let txReceipt: TransactionResponse | null;
    try {
        tx = await contract.setImplementation(implementaion);
        await tx.wait();
        txReceipt = await tx.getTransaction();
        console.log("tx complete");
    } catch (error) {
        console.log(error);
    }
}

const setImplemetationSelector = async (
    selector:Number, contract:AddressLike,
    hre:HardhatRuntimeEnvironment) => {
    let proxy: GasPriceOracleProxy | ServiceProviderProxy;
    switch (selector) {
        case 0:
            proxy = await loadGasPriceOracleProxyContract(hre);
            await setImplementation(proxy, contract);
            break;
        case 1:
            proxy = await loadServiceProviderProxyContract(hre);
            await setImplementation(proxy, contract);
            break;
    }
}

task("change_implementation", "upgrade smart contract by change implementation logic contract")
    .addParam("implementation", "implementation address")
    .addParam("contract","0:gaspriceoracle 1:serviceprovider")
    .setAction(async (args, hre) => {
        const contract = Number(args.contract);
        const implementation = String(args.implementation);
        await setImplemetationSelector(contract,implementation, hre);
    })