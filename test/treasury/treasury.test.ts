import { expect } from "chai";
import { ZeroAddress, ZeroHash } from "ethers";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, setBalance, mine } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "../utils/constants"
import { revertedMessage } from "../utils/reverted";
import { setSystemContractFixture, targetBlock } from "../utils/systemContractFixture"

async function setup() {
  const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
  const accounts = await ethers.getSigners();
  await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
  return { accounts, initAccount };
}

describe("Treasury System Contract", function () {

  let fixture: any;
  let signers: any;
  let initializer: any;
  let block: bigint;

  beforeEach(async function () {
    fixture = await loadFixture(setSystemContractFixture);
    const { accounts, initAccount } = await setup();
    signers = accounts;
    initializer = initAccount;
    await fixture.committee.connect(initializer).initialize(
      constants.VOTE_DELAY, 
      constants.VOTE_PERIOD, 
      constants.PROPOSE_PERIOD, 
      [fixture.committee1.address], 
      fixture.admin.address);
    await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address);
    await fixture.committee.connect(fixture.admin).grantAgent(fixture.otherAccount.address);
    await fixture.supplycontrol.connect(initializer).initialize(
      constants.VOTE_DELAY, 
      constants.VOTE_PERIOD, 
      constants.PROPOSE_PERIOD, 
      constants.COMMITTEE_CONTRACT_ADDRESS);
    block = await targetBlock();
  });

  describe("Unit test", function () {
    it("treasury: getAvailableBalance", async function () {
      expect(await fixture.supplycontrol.getAvailableBalance())
        .to.equal(constants.ONE_TRILLION_TOKEN);
    });

    it("treasury: getLockedBalance", async function () {
      expect(await fixture.supplycontrol.getLockedBalance())
        .to.equal(constants.ZERO_TOKEN);
    });

    it("treasury: catch propose event", async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
          block, 
          constants.ONE_TRILLION_TOKEN, 
          fixture.committee1.address, 
          constants.VOTE_TYPE_ADD))
        .to.emit(fixture.supplycontrol, "TreasuryProposalProposed")
        .withArgs(
          anyValue,
          fixture.proposer1.address,
          fixture.committee1.address,
          constants.VOTE_TYPE_ADD,
          constants.ONE_TRILLION_TOKEN,
          block,
          anyValue);
      const [ proposer, target, amount, blockNumber, type] = 
        await fixture.supplycontrol.getProposalSupplyInfoByBlockNumber(block)
      expect(proposer).to.equal(fixture.proposer1.address);
      expect(target).to.equal(fixture.committee1.address);
      expect(amount).to.equal(constants.ONE_TRILLION_TOKEN);
      expect(blockNumber).to.equal(block);
      expect(type).to.equal(constants.VOTE_TYPE_ADD);
    });

    it("treasury: intialized fail", async function () {
      await expect(fixture.supplycontrol.connect(fixture.admin).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS))
        .to.revertedWith(revertedMessage.initializer_only_can_call)
    });

    it("treasury: vote", async function () {
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        fixture.committee2.address, 
        constants.VOTE_TYPE_ADD);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.supplycontrol.blockProposal(block);
      await expect(fixture.supplycontrol.connect(fixture.committee1).vote(
        proposalId,
        constants.VOTE_AGREE
      )).to.emit(fixture.supplycontrol,"TreasuryVoted")
        .withArgs(proposalId, fixture.committee1.address, constants.VOTE_AGREE, anyValue);
    });

    it("treasury: execute release", async function () {
      // before locked balance
      const balanceBefore = await fixture.supplycontrol.getLockedBalance();
      expect(balanceBefore).to.equal(constants.ZERO);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        fixture.otherAccount1.address, 
        constants.VOTE_TYPE_ADD);
      // after locked after
      const balanceAfter = await fixture.supplycontrol.getLockedBalance();
      expect(balanceAfter).to.equal(constants.ONE_HUNDRED_TOKEN);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.supplycontrol.blockProposal(block);
      await fixture.supplycontrol.connect(fixture.committee1)
        .vote(proposalId,constants.VOTE_AGREE);
      await mine(constants.VOTE_PERIOD);
      await expect(fixture.supplycontrol.connect(fixture.otherAccount).execute(block))
        .to.emit(fixture.supplycontrol, "TreasuryProposalExecuted")
        .withArgs(
          proposalId,
          constants.VOTE_TYPE_ADD,
          fixture.otherAccount1.address,
          constants.ONE_HUNDRED_TOKEN,
          anyValue
        );
      const balance = await ethers.provider.getBalance(fixture.otherAccount1.address);
      expect(balance).to.equal(ethers.parseEther("10100"));
    });

    it("treasury: execute locked", async function () {
      // before locked balance
      const balanceBefore = await fixture.supplycontrol.getLockedBalance();
      expect(balanceBefore).to.equal(constants.ZERO);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        ZeroAddress, 
        constants.VOTE_TYPE_REMOVE);
      // after locked after
      const balanceAfter = await fixture.supplycontrol.getLockedBalance();
      expect(balanceAfter).to.equal(constants.ONE_HUNDRED_TOKEN);
      await mine(constants.VOTE_DELAY);
      await fixture.supplycontrol.getLockedBalance();
      const proposalId = await fixture.supplycontrol.blockProposal(block);
      await fixture.supplycontrol.connect(fixture.committee1)
        .vote(proposalId,constants.VOTE_AGREE);
      await mine(constants.VOTE_PERIOD);
      await expect(fixture.supplycontrol.connect(fixture.otherAccount).execute(block))
        .to.emit(fixture.supplycontrol, "TreasuryProposalExecuted")
        .withArgs(
          proposalId,
          constants.VOTE_TYPE_REMOVE,
          ZeroAddress,
          constants.ONE_HUNDRED_TOKEN,
          anyValue
        );
      const balance = await ethers.provider.getBalance(ZeroAddress);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("treasury: execute reject", async function () {
      // TODO
    });

    it(revertedMessage.treasury_only_agent_can_call, async function () {
      await expect(fixture.supplycontrol.connect(fixture.admin).execute(
        ZeroHash))
        .to.revertedWith(revertedMessage.treasury_only_agent_can_call);
    });

    it(revertedMessage.treasury_only_committee_can_call, async function () {
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        block,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.supplycontrol.blockProposal(block);
      await expect(fixture.supplycontrol.connect(fixture.admin).vote(
        proposalId,
        constants.VOTE_AGREE))
        .to.revertedWith(revertedMessage.treasury_only_committee_can_call);
    });

    it(revertedMessage.treasury_only_proposer_can_call, async function () {
      await expect(fixture.supplycontrol.connect(fixture.committee1).propose(
        block,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_only_proposer_can_call);
    });

    it(revertedMessage.treasury_propose_past_block, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        constants.ZERO,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_past_block);
    });

    it(revertedMessage.treasury_propose_invalid_block, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block -1n, 
        constants.ONE_TOKEN, 
        fixture.committee1.address,
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_invalid_block);
    });

    it(revertedMessage.treasury_propose_too_future, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block + constants.EXCEED_UINT16,
        constants.ONE_TOKEN,
        fixture.committee1.address,
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_too_future);
    });

    it(revertedMessage.treasury_propose_amount_exceed, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        (constants.ONE_TRILLION_TOKEN + constants.ONE_TOKEN), 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_amount_exceed);
    });

    it(revertedMessage.treasury_propose_invalid_amount, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ZERO_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_invalid_amount);
    });

    it(revertedMessage.treasury_propose_to_exist_block, async function () {
      const block = (await targetBlock()) + 5n;
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_REMOVE))
        .to.revertedWith(revertedMessage.treasury_propose_to_exist_block);
    });

    it(revertedMessage.treasury_propose_released_to_zero_address, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_released_to_zero_address);
    });

    it(revertedMessage.treasury_propose_locked_to_non_zero_address, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_REMOVE))
        .to.revertedWith(revertedMessage.treasury_propose_locked_to_non_zero_address);
    });

    it(revertedMessage.treasury_proposal_not_exist, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1)
        .getProposalSupplyInfoByProposalId(ZeroHash))
        .to.revertedWith(revertedMessage.treasury_proposal_not_exist);
    });

  });
});