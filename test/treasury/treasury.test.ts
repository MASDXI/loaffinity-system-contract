import { expect } from "chai";
import { ZeroAddress, ZeroHash } from "ethers";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, setBalance, time, mine} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "../utils/constants"
import { revertedMessage } from "../utils/reverted";
import { setSystemContractFixture } from "../utils/systemContractFixture"

async function setup() {
  const contract = await ethers.deployContract("TreasuryContract");
  const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
  const accounts = await ethers.getSigners();
  await setBalance(await initAccount.getAddress(), constants.ONE_HUNDRED_TOKEN);
  return { contract, accounts, initAccount };
}

describe("Supply Control System Contract", function () {

  let fixture: any;
  let treasury: any;
  let signers: any;
  let initializer: any;

  beforeEach(async function () {
    fixture = await loadFixture(setSystemContractFixture);
    const { contract, accounts, initAccount } = await setup();
    treasury = contract;
    signers = accounts;
    initializer = initAccount;
    await fixture.committee.connect(initializer).initialize(
      constants.VOTE_DELAY, 
      constants.VOTE_PERIOD, 
      constants.PROPOSE_PERIOD, 
      [fixture.committee1.address], 
      fixture.committee1.address);
    await fixture.committee.connect(fixture.committee1).grantProposer(fixture.proposer1.address);
    await fixture.supplycontrol.connect(initializer).initialize(
      constants.VOTE_DELAY, 
      constants.VOTE_PERIOD, 
      constants.PROPOSE_PERIOD, 
      constants.COMMITTEE_CONTRACT_ADDRESS);
  });

  describe("Unit test", function () {
    it("function: getAvailableBalance", async function () {
      expect(await fixture.supplycontrol.getAvailableBalance())
        .to.be.equal(constants.ONE_TRILLION_TOKEN);
    });

    it("function: getLockedBalance", async function () {
      expect(await fixture.supplycontrol.getLockedBalance())
        .to.be.equal(constants.ZERO_TOKEN);
    });

    it("function: catch propose event", async function () {
      await ethers.provider.getBlockNumber();
      const proposeTx = await fixture.supplycontrol.connect(fixture.proposer1).propose(
        300, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      console.log("🚀 ~ proposeTx:", proposeTx)
      
      // await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
      //     300, 
      //     constants.ONE_TOKEN, 
      //     fixture.committee1.address, 
      //     constants.VOTE_TYPE_ADD))
      //   .to.emit(fixture.supplycontrol, "TreasuryProposalProposed")
      //   .withArgs(
      //     anyValue,
      //     fixture.proposer1.address,
      //     fixture.committee1.address,
      //     constants.VOTE_TYPE_ADD,
      //     constants.ONE_TRILLION_TOKEN,
      //     300,
      //     anyValue);
    });

    it(revertedMessage.treasury_propose_past_block, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        [committee1.address], 
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(0, constants.ONE_TRILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD))
        .to.be.revertedWith(revertedMessage.treasury_propose_past_block)
    });

    it(revertedMessage.treasury_propose_invalid_block, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        [committee1.address], 
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(100, constants.ONE_TRILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD))
        .to.be.revertedWith(revertedMessage.treasury_propose_invalid_block)
    });

    it(revertedMessage.treasury_propose_invalid_amount, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        [committee1.address], 
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ZERO_TOKEN, committee1.address, constants.VOTE_TYPE_ADD))
        .to.be.revertedWith(revertedMessage.treasury_propose_invalid_amount)
    });

    it(revertedMessage.treasury_propose_to_exist_block, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY,
        constants.VOTE_PERIOD,
        constants.PROPOSE_PERIOD,
        [committee1.address],
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD)
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD))
        .to.be.revertedWith(revertedMessage.treasury_propose_to_exist_block)
    });

    it(revertedMessage.treasury_propose_released_to_zero_address, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY,
        constants.VOTE_PERIOD,
        constants.PROPOSE_PERIOD,
        [committee1.address],
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, ZeroAddress, constants.VOTE_TYPE_ADD))
        .to.be.revertedWith(revertedMessage.treasury_propose_released_to_zero_address)
    });

    it(revertedMessage.treasury_propose_locked_to_non_zero_address, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY,
        constants.VOTE_PERIOD,
        constants.PROPOSE_PERIOD,
        [committee1.address],
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, constants.VOTE_TYPE_REMOVE))
        .to.be.revertedWith(revertedMessage.treasury_propose_locked_to_non_zero_address)
    });

    it(revertedMessage.treasury_proposal_not_exist, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY,
        constants.VOTE_PERIOD,
        constants.PROPOSE_PERIOD,
        [committee1.address],
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).getProposalSupplyInfoByProposalId(ZeroHash))
        .to.be.revertedWith(revertedMessage.treasury_proposal_not_exist);
    });

    it(revertedMessage.treasury_proposal_not_exist, async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1 } = 
        await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY,
        constants.VOTE_PERIOD,
        constants.PROPOSE_PERIOD,
        [committee1.address],
        admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).getProposalSupplyInfoByBlockNumber(0))
        .to.be.revertedWith(revertedMessage.treasury_proposal_not_exist);
    });
  });
});