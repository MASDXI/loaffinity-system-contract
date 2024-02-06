import { expect } from "chai";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "../utils/constants";
import { revertedMessage } from "../utils/reverted";

async function setup() {
    const contract = await ethers.deployContract("InitializedMock");
    const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
    const accounts = await ethers.getSigners();
    await setBalance(await initAccount.getAddress(), constants.ONE_HUNDRED_TOKEN);
    return { contract, accounts, initAccount };
}

describe("Abstract Initialized Contract", function () {
    
    let initializedMock: any;
    let signers: any;
    let initializer: any

    beforeEach(async function () {
        const { contract, accounts, initAccount } = await setup();
        initializedMock = contract;
        signers = accounts;
        initializer = initAccount;
    });
    
    describe("InitializedMock Contract", async function () {
        it("initializer: isinit false", async function () {
            const status = await initializedMock.isInit();
            expect(status).to.equal(false);
        });

        it("initializer: isinit true", async function () {
            await initializedMock.connect(initializer).init();
            const status = await initializedMock.isInit();
            expect(status).to.equal(true);
        });

        it("initializer: is initializer true", async function () {
            const output = await initializedMock.isIntializer(initializer.address);
            expect(output).to.equal(true);
        });

        it("initializer: is initializer false", async function () {
            const output = await initializedMock.isIntializer(signers[0].address);
            expect(output).to.equal(false);
        });

        it(revertedMessage.initializer_only_can_call, async function () {
            await expect(initializedMock.connect(signers[0]).init())
                .to.revertedWith(revertedMessage.initializer_only_can_call);
        });

        it(revertedMessage.initializer_already_initialized, async function () {
            await initializedMock.connect(initializer).init();
            await expect(initializedMock.connect(initializer).init())
                .to.revertedWith(revertedMessage.initializer_already_initialized);
        });

        it("initializer: events", async function () {
            await expect(initializedMock.connect(initializer).init())
                .to.emit(initializedMock,"Initialized");
        });
    });
});