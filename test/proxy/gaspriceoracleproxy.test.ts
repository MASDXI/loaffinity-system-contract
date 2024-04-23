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

async function setup() {
    const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
    const accounts = await ethers.getSigners();
    await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
    // deploy implemention contract and point callee to gas price oracle proxy contract
    const implementation = await ethers.deployContract("GasPriceOracleV1",
        // TODO fix contstructor
        [constants.GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS]);
    return { initAccount, accounts, implementation};
}

describe("GasPrice Oracle Proxy System Contract", function () {
    let fixture: any;
    let initializer: any;
    let block: bigint;
    let signers: any;
    let v1: any;

    beforeEach(async function () {
        fixture = await loadFixture(setSystemContractFixture);
        const { initAccount, accounts, implementation } = await setup();
        signers = accounts;
        initializer = initAccount;
        v1 = implementation;
        await fixture.committee.connect(initializer).initialize(
          constants.VOTE_DELAY, 
          constants.VOTE_PERIOD, 
          constants.PROPOSE_PERIOD,
          constants.EXECUTE_RETENTION_PERIOD, 
          [fixture.committee1.address], 
          fixture.admin.address)
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1);
        await fixture.gaspriceoracleproxy.connect(initializer).initialize(
            await implementation.getAddress(),
            constants.COMMITTEE_CONTRACT_ADDRESS);
        block = await targetBlock();
    });

    describe("Unit test", async function () {
        it("Gas Price Oracle Proxy: getImplementation", async function () {
            const implementation = await fixture.gaspriceoracleproxy.getImplementation();
            expect(implementation).to.equal(await v1.getAddress());
        });

        it("Gas Price Oracle Proxy: setImplementation", async function () {
            //TODO
        });

        it("Gas Price Oracle Proxy: version", async function () {
            //TODO
        });

        it("Gas Price Oracle Proxy: calculateTransactionFee", async function () {
            //TODO
        });

        it("Gas Price Oracle Proxy: getThreashold", async function () {
            // TODO
        });

        it("Gas Price Oracle Proxy: status", async function () {
            // TODO
        });
    });
});