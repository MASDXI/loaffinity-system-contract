import { expect } from "chai";
import { ethers } from "hardhat";
import { mine, setBalance } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import { constants } from "../utils/constants";

async function setup() {
    const initializedMock = await ethers.deployContract("InitializedMock");
    const initializer = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
    const signers = await ethers.getSigners();
    await setBalance(await initializer.getAddress(),constants.ONE_HUNDRED_TOKEN);
    return { initializedMock, signers, initializer };
}

describe("Abstract Initialized Contract", function () {
    describe("InitializedMock Contract", async function () {
        it("initializer: isinit false", async function () {
            const { initializedMock } = await setup();
            const status = await initializedMock.isInit();
            expect(status).to.be.equal(false);
        });

        it("initializer: isinit true", async function () {
            const { initializedMock, initializer } = await setup();
            await initializedMock.connect(initializer).init();
            const status = await initializedMock.isInit();
            expect(status).to.be.equal(true);
        });

        it("initializer: onlyInitializer can call", async function () {
            const { initializedMock, signers } = await setup();
            await expect(initializedMock.connect(signers[0]).init()).to.be.revertedWith("initializer: onlyInitializer can call");
        });

        it("initializer: already init", async function () {
            const { initializedMock, initializer } = await setup();
            await initializedMock.connect(initializer).init();
            await expect(initializedMock.connect(initializer).init()).to.be.revertedWith("initializer: already init");
        });

        it("initializer: events", async function () {
            const { initializedMock, initializer } = await setup();
            await expect(initializedMock.connect(initializer).init()).to.be.emit(initializedMock,"Initialized");
        });
    });
});