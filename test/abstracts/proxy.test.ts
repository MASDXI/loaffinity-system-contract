import { expect } from "chai";
import { ethers } from "hardhat";
import { constants } from "../utils/constants";
import { revertedMessage } from "../utils/reverted";

async function setup() {
    const target =  "0x00000000000000000000000000000000000000EF";
    const contract = await ethers.deployContract("ProxyMock", target);
    const accounts = await ethers.getSigners();
    return { contract, accounts };
}

describe("Abstract Proxy Contract", function () {
    
    let proxyMock: any;
    let signers: any;
    let initializer: any

    beforeEach(async function () {
        const { contract, accounts } = await setup();
        proxyMock = contract;
        signers = accounts;
    });
    
    describe("ProxyMock Contract", async function () {
        it("Proxy: isinit false", async function () {
            const status = await proxyMock.isInit();
            expect(status).to.equal(false);
        });

        it("Proxy: isinit true", async function () {
            await proxyMock.connect(initializer).init();
            const status = await proxyMock.isInit();
            expect(status).to.equal(true);
        });

        it("Proxy: is initializer true", async function () {
            const output = await proxyMock.getImplemetation();
            expect(output).to.equal(true);
        });

        it("Proxy: is initializer false", async function () {
            const output = await proxyMock.isIntializer(signers[0].address);
            expect(output).to.equal(false);
        });

        it(revertedMessage.initializer_already_initialized, async function () {
            await proxyMock.setImplementation(initializer).init();
            await expect(proxyMock.connect(initializer).init())
                .to.revertedWith(revertedMessage.initializer_already_initialized);
        });

        it("Proxy: events", async function () {
            await expect(proxyMock.connect(initializer).init())
                .to.emit(proxyMock,"Proxy");
        });
    });
});