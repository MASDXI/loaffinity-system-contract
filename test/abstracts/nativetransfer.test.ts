import { expect } from "chai";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "../utils/constants";

async function setup() {
    const contract = await ethers.deployContract("NativeTransferMock");
    const mockaddress = await ethers.getImpersonatedSigner("0x1000000000000000000000000000000000000000");
    const accounts = await ethers.getSigners();
    await setBalance(await contract.getAddress(), constants.ONE_HUNDRED_TOKEN);
    return { contract, accounts, mockaddress };
}

describe("Abstract NativeTransfer Contract", function () {

    let nativeTransferMock: any;
    let signers: any;
    let mockAddress: any;

    beforeEach(async function () {
        const { contract, accounts, mockaddress } = await setup();
        nativeTransferMock = contract;
        signers = accounts;
        mockAddress = mockaddress;
    });

    describe("NativeTransferMock Contract", async function () {
        it("nativetransfer: transfer successful", async function () {
            await nativeTransferMock.transferEther(mockAddress.address,  constants.ONE_HUNDRED_TOKEN);
            const balance = await ethers.provider.getBalance(mockAddress.address);
            expect(balance).to.equal(constants.ONE_HUNDRED_TOKEN);
        });

        it("initializer: transfer failed exceed balance", async function () {
            await expect(nativeTransferMock.transferEther(mockAddress.address,  constants.ONE_MILLION_TOKEN)).
            to.revertedWithCustomError(nativeTransferMock,"TransferExceedBalance");
        });

        it("initializer: transfer failed zero amount", async function () {
            await expect(nativeTransferMock.transferEther(mockAddress.address,  constants.ZERO_TOKEN)).
            to.revertedWithCustomError(nativeTransferMock,"TransferZeroAmount");
        });
    });

});