import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";
import { constants } from "../utils/constants";
import { revertedMessage } from "../utils/reverted";

async function setup() {
    // read target from constant file
    const targetV1 = ethers.getAddress("0x00000000000000000000000000000000000000E1");
    const targetV2 = ethers.getAddress("0x00000000000000000000000000000000000000E2");
    const contract = await ethers.deployContract("ProxyMock", [targetV1]);
    const accounts = await ethers.getSigners();
    return { contract, accounts, targetV1, targetV2 };
}

describe("Abstract Proxy Contract", function () {
    
    let proxyMock: any;
    let signers: any;
    let v1: any;
    let v2: any;

    beforeEach(async function () {
        const { contract, accounts, targetV1, targetV2 } = await setup();
        proxyMock = contract;
        signers = accounts;
        v1 = targetV1;
        v2 = targetV2;
    });
    
    describe("ProxyMock Contract", async function () {
        it("Proxy: getImplementation", async function () {
            const implemetation = await proxyMock.getImplementation();
            expect(implemetation).to.equal(v1);
        });

        it("Proxy: setImplementation", async function () {
            await proxyMock.setImplementation(v2);
            const implemetation = await proxyMock.getImplementation();
            expect(implemetation).to.equal(v2);
        });

        // revert file
        it(revertedMessage.proxy_set_zero_address, async function () {
            await expect(proxyMock.setImplementation(ZeroAddress))
                .to.revertedWith(revertedMessage.proxy_set_zero_address);
        });

        it(revertedMessage.proxy_already_exists, async function () {
            await proxyMock.setImplementation(v2);
            await expect(proxyMock.setImplementation(v2))
                .to.revertedWith(revertedMessage.proxy_already_exists);
        });

        it("Proxy: events", async function () {
            await expect(proxyMock.setImplementation(v2))
                .to.emit(proxyMock,"ImpelementationContractUpdated")
                .withArgs(v1,v2);
        });
    });
});