import {
    loadFixture,
    setBalance,
    mine
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress, ZeroHash, ethers as eth } from "ethers";
import { constants } from "../utils/constants"
import { setSystemContractFixture, targetBlock, SystemContractsFixture } from "../utils/systemContractFixture"
import { revertedMessage } from "../utils/reverted";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { gasLogicV1 } from "../helpers/gasPriceOracleV1";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { GasPriceOracleV1 } from "../../typechain-types";

async function setup() {
    const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
    const accounts = await ethers.getSigners();
    await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
    // deploy implemention contract and point callee to gas price oracle proxy contract
    const configV1 = constants.GASPRICE_CONFIG.V1;
    const implementation = await ethers.deployContract("GasPriceOracleV1",
        [configV1.CARBON_EMISSION_COEFFICIENT,
         configV1.CARBON_CAPTURE_COST,
         configV1.SUSTAINABILITIT_CHARGE_RATE,
         configV1.IDLE_POWER_CONSUMPTION,
         configV1.NUMBER_OF_VALIDATOR,
         configV1.POWER_CONSUMPTION_PER_GAS,
         configV1.BLOCK_PERIOD,
         configV1.CONSTANT,
         constants.GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS]);
    return { initAccount, accounts, implementation};
}

describe("GasPrice Oracle Proxy System Contract", function () {
    // TODO change type any to specific type
    let fixture: SystemContractsFixture;
    let initializer: HardhatEthersSigner;
    let block: bigint;
    let signers: HardhatEthersSigner[];
    let v1: GasPriceOracleV1;
    // TODO change type any to specific type
    let v1Config: any;

    beforeEach(async function () {
        fixture = await loadFixture(setSystemContractFixture);
        const { initAccount, accounts, implementation } = await setup();
        signers = accounts;
        initializer = initAccount;
        v1 = implementation;
        v1Config = constants.GASPRICE_CONFIG.V1
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
            constants.COMMITTEE_CONTRACT_ADDRESS,
            {"consortiumRatio": v1Config.THRESHOLD.CONSORTIUM,
             "nodeValidatorRatio": v1Config.THRESHOLD.NODE_VALIDATOR,
             "merchantRatio":  v1Config.THRESHOLD.MERCHANT,
             "mobileValidatorRatio":  v1Config.THRESHOLD.MOBILE_VALIDATOR
            });
        block = await targetBlock();
    });

    describe("Unit test", async function () {
        it("Gas Price Oracle Proxy: getImplementation", async function () {
            const implementation = await fixture.gaspriceoracleproxy.getImplementation();
            expect(implementation).to.equal(await v1.getAddress());
        });

        it("Gas Price Oracle Proxy: setImplementation", async function () {
            const newImplementation = await ethers.deployContract("GasPriceOracleV1",
            [v1Config.CARBON_EMISSION_COEFFICIENT,
             v1Config.CARBON_CAPTURE_COST,
             v1Config.SUSTAINABILITIT_CHARGE_RATE,
             v1Config.IDLE_POWER_CONSUMPTION,
             v1Config.NUMBER_OF_VALIDATOR,
             v1Config.POWER_CONSUMPTION_PER_GAS,
             v1Config.BLOCK_PERIOD,
             v1Config.CONSTANT,
             constants.GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS]);
            await fixture.gaspriceoracleproxy.connect(fixture.admin).setImplementation(newImplementation.getAddress());
            const implementation = await fixture.gaspriceoracleproxy.getImplementation();
            expect(implementation).to.equal(await newImplementation.getAddress());
        });

        it("Gas Price Oracle Proxy: version", async function () {
            const version = await fixture.gaspriceoracleproxy.version();
            expect(version).to.equal(10);
        });

        it("Gas Price Oracle Proxy: calculateTransactionFee", async function () {
            const gasLimit = 50000n;
            const preCalculateTransactionFee = await gasLogicV1(
                v1Config.CARBON_EMISSION_COEFFICIENT,
                v1Config.CARBON_CAPTURE_COST,
                v1Config.SUSTAINABILITIT_CHARGE_RATE,
                v1Config.IDLE_POWER_CONSUMPTION,
                v1Config.NUMBER_OF_VALIDATOR,
                v1Config.POWER_CONSUMPTION_PER_GAS,
                v1Config.BLOCK_PERIOD,
                v1Config.CONSTANT,
                gasLimit
            )
            const calculatedGasFee = await fixture.gaspriceoracleproxy.calculateTransactionFee(gasLimit);
            expect(calculatedGasFee).to.equal(preCalculateTransactionFee);
        });

        it("Gas Price Oracle Proxy: getThreshold", async function () {
            const threshold = await fixture.gaspriceoracleproxy.getThreshold();
            expect(threshold.consortiumRatio).to.equal(v1Config.THRESHOLD.CONSORTIUM);
            expect(threshold.nodeValidatorRatio).to.equal(v1Config.THRESHOLD.NODE_VALIDATOR);
            expect(threshold.merchantRatio).to.equal(v1Config.THRESHOLD.MERCHANT);
            expect(threshold.mobileValidatorRatio).to.equal(v1Config.THRESHOLD.MOBILE_VALIDATOR);
        });

        it("Gas Price Oracle Proxy: status 'false'", async function () {
            const status = await fixture.gaspriceoracleproxy.paused();
            expect(status).to.equal(false);
        });

        it("Gas Price Oracle Proxy: status 'true'", async function () {
            await v1.connect(fixture.admin).toggle();
            const status = await fixture.gaspriceoracleproxy.paused();
            expect(status).to.equal(true);
        });
    });
});