import {
    loadFixture,
    setBalance,
    mine
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress, ZeroHash, ethers as eth } from "ethers";
import { constants } from "../utils/constants"
import { setSystemContractFixture, targetBlock } from "../utils/systemContractFixture"
import { revertedMessage } from "../utils/reverted";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ServiceProvider } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

async function setup() {
    const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
    const accounts = await ethers.getSigners();
    await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
    // deploy implemention contract and point callee to service provider proxy contract
    const implementation = await ethers.deployContract("ServiceProvider",
        [constants.SERVICE_PROVIER_PROXY_CONTRACT_ADDRESS]);
    return { initAccount, accounts, implementation };
}

describe("Service Provider Proxy System Contract", function () {
    // TODO change type any to specific type
    let fixture: any;
    let initializer: HardhatEthersSigner;
    let block: bigint;
    let signers: HardhatEthersSigner[];
    let v1: ServiceProvider;

    beforeEach(async function () {
        fixture = await loadFixture(setSystemContractFixture);
        const { initAccount, accounts, implementation } = await setup();
        signers = accounts;
        initializer = initAccount;
        v1= implementation
        await fixture.committee.connect(initializer).initialize(
          constants.VOTE_DELAY, 
          constants.VOTE_PERIOD, 
          constants.PROPOSE_PERIOD,
          constants.EXECUTE_RETENTION_PERIOD, 
          [fixture.committee1.address], 
          fixture.admin.address)
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1);
        await fixture.serviceproviderproxy.connect(initializer).initialize(
            await implementation.getAddress(),
            constants.COMMITTEE_CONTRACT_ADDRESS);
        block = await targetBlock();
    });

    describe("Unit test", async function () {
        it("Service Provider Proxy: version", async function () {
            const version = await fixture.serviceproviderproxy.version();
            expect(version).to.equal(10n);
        });

        it("Service Provider Proxy: setImplementation", async function () {
            const v2 = await ethers.deployContract("ServiceProvider",
                [constants.SERVICE_PROVIER_PROXY_CONTRACT_ADDRESS]);
            await fixture.serviceproviderproxy.connect(fixture.admin).setImplementation(await v2.getAddress());
            const implementation = await fixture.serviceproviderproxy.getImplementation();
            expect(implementation).to.equal(await v2.getAddress());
        });

        it("Service Provider Proxy: getImplementation", async function () {
            const implementation = await fixture.serviceproviderproxy.getImplementation();
            expect(implementation).to.equal(await v1.getAddress());
        });

        it("Service Provider Proxy: grantServiceProvier", async function () {
            // TODO
        });
        
        it("Service Provider Proxy: revokeServiceProvider", async function () {
            // TODO
        });

        it("Service Provider Proxy: grantMerchant", async function () {
            // TODO
        });

        it("Service Provider Proxy: revokeMerchant", async function () {
            // TODO
        });



    });
});