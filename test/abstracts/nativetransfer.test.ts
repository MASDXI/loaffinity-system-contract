import { expect } from "chai";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "../utils/constants";

async function setup() {
    const contract = await ethers.deployContract("NativeTransferMock");
    const accounts = await ethers.getSigners();
    await setBalance(await contract.getAddress(), constants.ONE_HUNDRED_TOKEN);
    return { contract, accounts };
}

describe("Abstract NativeTransfer Contract", function () {

    let nativeTransferMock: any;
    let signers: any;
    const mockAddress: string = "0x1000000000000000000000000000000000000000";

    beforeEach(async function () {
        const { contract, accounts } = await setup();
        nativeTransferMock = contract;
        signers = accounts;
    });

    describe("Uint test", async function () {

        it("nativetransfer: transfer successful", async function () {
            await nativeTransferMock.transferEther(mockAddress, constants.ONE_HUNDRED_TOKEN);
            const balance = await ethers.provider.getBalance(mockAddress);
            expect(balance).to.equal(constants.ONE_HUNDRED_TOKEN);
        });

        it("nativetransfer: transfer failed exceed balance", async function () {
            await expect(nativeTransferMock.transferEther(mockAddress,  constants.ONE_MILLION_TOKEN)).
            to.revertedWithCustomError(nativeTransferMock,"TransferExceedBalance");
        });

        it("nativetransfer: transfer failed zero amount", async function () {
            await expect(nativeTransferMock.transferEther(mockAddress,  constants.ZERO_TOKEN)).
            to.revertedWithCustomError(nativeTransferMock,"TransferZeroAmount");
        });
    });

});