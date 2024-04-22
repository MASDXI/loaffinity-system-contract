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
      constants.EXECUTE_RETENTION_PERIOD, 
      [fixture.committee1.address], 
      fixture.admin.address);
    await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address);
    await fixture.committee.connect(fixture.admin).grantAgent(fixture.otherAccount.address);
    await fixture.treasury.connect(initializer).initialize(
      constants.VOTE_DELAY, 
      constants.VOTE_PERIOD, 
      constants.PROPOSE_PERIOD, 
      constants.EXECUTE_RETENTION_PERIOD, 
      constants.COMMITTEE_CONTRACT_ADDRESS);
    block = await targetBlock();
  });

  describe("Unit test", function () {

    it("1. function: getAvailableBalance", async function () {
      expect(await fixture.treasury.getAvailableBalance())
        .to.equal(constants.ONE_TRILLION_TOKEN);
    });

    it("2. function: getLockedBalance", async function () {
      expect(await fixture.treasury.getLockedBalance())
        .to.equal(constants.ZERO_TOKEN);
    });

    it("treasury: catch propose event", async function () {
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
          block, 
          constants.ONE_TRILLION_TOKEN, 
          fixture.committee1.address, 
          constants.VOTE_TYPE_ADD))
        .to.emit(fixture.treasury, "TreasuryProposalProposed")
        .withArgs(
          anyValue,
          fixture.proposer1.address,
          fixture.committee1.address,
          constants.VOTE_TYPE_ADD,
          constants.ONE_TRILLION_TOKEN,
          block,
          anyValue);
      const [ proposer, target, amount, blockNumber, type] = 
        await fixture.treasury.getProposalSupplyInfoByBlockNumber(block)
      expect(proposer).to.equal(fixture.proposer1.address);
      expect(target).to.equal(fixture.committee1.address);
      expect(amount).to.equal(constants.ONE_TRILLION_TOKEN);
      expect(blockNumber).to.equal(block);
      expect(type).to.equal(constants.VOTE_TYPE_ADD);
    });

    it("treasury: intialized fail", async function () {
      await expect(fixture.treasury.connect(fixture.admin).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.EXECUTE_RETENTION_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS))
        .to.revertedWith(revertedMessage.initializer_only_can_call)
    });

    it("treasury: vote", async function () {
      await fixture.treasury.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        fixture.committee2.address, 
        constants.VOTE_TYPE_ADD);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.treasury.blockProposal(block);
      await expect(fixture.treasury.connect(fixture.committee1).vote(
        proposalId,
        constants.VOTE_AGREE
      )).to.emit(fixture.treasury,"TreasuryVoted")
        .withArgs(proposalId, fixture.committee1.address, constants.VOTE_AGREE, anyValue);
    });

    it("treasury: cancel proposal", async function () {
      await fixture.treasury.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        fixture.otherAccount1.address, 
        constants.VOTE_TYPE_ADD);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.treasury.blockProposal(block);
      await fixture.treasury.connect(fixture.committee1)
        .vote(proposalId,constants.VOTE_AGREE);
      await mine(constants.VOTE_PERIOD);
      await mine(10n);
      await expect(fixture.treasury.connect(fixture.otherAccount)
        .cancel(block))
        .to.be.emit(fixture.treasury,"TreasuryCancel");
    });

    it("treasury: execute release", async function () {
      // before locked balance
      const balanceBefore = await fixture.treasury.getLockedBalance();
      expect(balanceBefore).to.equal(constants.ZERO);
      await fixture.treasury.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        fixture.otherAccount1.address, 
        constants.VOTE_TYPE_ADD);
      // after locked after
      const balanceAfter = await fixture.treasury.getLockedBalance();
      expect(balanceAfter).to.equal(constants.ONE_HUNDRED_TOKEN);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.treasury.blockProposal(block);
      await fixture.treasury.connect(fixture.committee1)
        .vote(proposalId,constants.VOTE_AGREE);
      await mine(constants.VOTE_PERIOD);
      await mine(constants.EXECUTE_RETENTION_PERIOD);
      await mine(10n);
      await expect(fixture.treasury.connect(fixture.otherAccount).execute(block))
        .to.emit(fixture.treasury, "TreasuryProposalExecuted")
        .withArgs(
          proposalId,
          constants.VOTE_TYPE_ADD,
          fixture.otherAccount1.address,
          constants.ONE_HUNDRED_TOKEN,
          anyValue
        );
      const balance = await ethers.provider.getBalance(fixture.otherAccount1.address);
      expect(balance).to.equal(constants.ONE_HUNDRED_TOKEN);
    });

    it("treasury: execute locked", async function () {
      // before locked balance
      const balanceBefore = await fixture.treasury.getLockedBalance();
      expect(balanceBefore).to.equal(constants.ZERO);
      await fixture.treasury.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        ZeroAddress, 
        constants.VOTE_TYPE_REMOVE);
      // after locked after
      const balanceAfter = await fixture.treasury.getLockedBalance();
      expect(balanceAfter).to.equal(constants.ONE_HUNDRED_TOKEN);
      await mine(constants.VOTE_DELAY);
      await fixture.treasury.getLockedBalance();
      const proposalId = await fixture.treasury.blockProposal(block);
      await fixture.treasury.connect(fixture.committee1)
        .vote(proposalId,constants.VOTE_AGREE);
      await mine(constants.VOTE_PERIOD);
      await mine(constants.EXECUTE_RETENTION_PERIOD);
      await mine(10n);
      await expect(fixture.treasury.connect(fixture.otherAccount).execute(block))
        .to.emit(fixture.treasury, "TreasuryProposalExecuted")
        .withArgs(
          proposalId,
          constants.VOTE_TYPE_REMOVE,
          ZeroAddress,
          constants.ONE_HUNDRED_TOKEN,
          anyValue
        );
      const balance = await ethers.provider.getBalance(ZeroAddress);
      expect(balance).to.equal(constants.ONE_HUNDRED_TOKEN);
    });

    it("treasury: execute reject", async function () {
      const contract = await loadFixture(setSystemContractFixture);
      await contract.committee.connect(initializer).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.EXECUTE_RETENTION_PERIOD, 
        [signers[1].address, signers[2].address, signers[3].address, signers[4].address], 
        signers[0].address);
      await contract.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address);
      await contract.committee.connect(fixture.admin).grantAgent(fixture.otherAccount.address);
      await contract.treasury.connect(initializer).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.EXECUTE_RETENTION_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS);
      await fixture.treasury.connect(fixture.proposer1).propose(
        block,
        constants.ONE_HUNDRED_TOKEN,
        fixture.otherAccount1.address, 
        constants.VOTE_TYPE_ADD);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.treasury.blockProposal(block);
      await contract.treasury.connect(signers[1])
        .vote(proposalId, constants.VOTE_AGREE);
      await contract.treasury.connect(signers[2])
        .vote(proposalId, constants.VOTE_AGREE);
      await contract.treasury.connect(signers[3])
        .vote(proposalId, constants.VOTE_DIAGREE);
      await contract.treasury.connect(signers[4])
        .vote(proposalId, constants.VOTE_DIAGREE);
      await mine(constants.VOTE_PERIOD);
      await mine(constants.EXECUTE_RETENTION_PERIOD);
      await mine(10n);
      await expect(fixture.treasury.connect(fixture.otherAccount).execute(block))
        .to.emit(fixture.treasury, "TreasuryProposalRejected")
        .withArgs(
          proposalId,
          constants.VOTE_TYPE_ADD,
          fixture.otherAccount1.address,
          constants.ONE_HUNDRED_TOKEN,
          anyValue
        );
    });

    it(revertedMessage.treasury_only_agent_can_call, async function () {
      await expect(fixture.treasury.connect(fixture.admin).execute(
        ZeroHash))
        .to.revertedWith(revertedMessage.treasury_only_agent_can_call);
    });

    it(revertedMessage.treasury_only_committee_can_call, async function () {
      await fixture.treasury.connect(fixture.proposer1).propose(
        block,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      await mine(constants.VOTE_DELAY);
      const proposalId = await fixture.treasury.blockProposal(block);
      await expect(fixture.treasury.connect(fixture.admin).vote(
        proposalId,
        constants.VOTE_AGREE))
        .to.revertedWith(revertedMessage.treasury_only_committee_can_call);
    });

    it(revertedMessage.treasury_only_proposer_can_call, async function () {
      await expect(fixture.treasury.connect(fixture.committee1).propose(
        block,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_only_proposer_can_call);
    });

    it(revertedMessage.treasury_propose_amount_exceed, async function () {
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        (constants.ONE_TRILLION_TOKEN + constants.ONE_TOKEN), 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_amount_exceed);
    });

    it(revertedMessage.treasury_propose_invalid_amount, async function () {
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        constants.ZERO_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_invalid_amount);
    });

    it(revertedMessage.treasury_propose_amount_exceed, async function () {
      const block = await targetBlock();
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TRILLION_TOKEN + 200n, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_amount_exceed);
    });


    it(revertedMessage.treasury_only_proposer_can_call, async function () {
      const Block = await targetBlock() + BigInt(100);
      await expect(fixture.treasury.connect(fixture.committee1).propose(
        Block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_only_proposer_can_call);
    });

    it(revertedMessage.treasury_only_committee_can_call, async function () {
      const currentBlock = await targetBlock() + BigInt(100);
      await fixture.treasury.connect(fixture.proposer1).propose(
        currentBlock, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      const proposalId = await fixture.treasury.connect(fixture.proposer1).blockProposal(currentBlock);
      await expect(fixture.treasury.connect(fixture.proposer2).vote(proposalId, true))
      .to.revertedWith(revertedMessage.treasury_only_committee_can_call);
    });

    it(revertedMessage.treasury_propose_to_exist_block, async function () {
      const block = (await targetBlock()) + 5n;
      await fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_REMOVE))
        .to.revertedWith(revertedMessage.treasury_propose_to_exist_block);
    });

    it(revertedMessage.treasury_propose_released_to_zero_address, async function () {
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_released_to_zero_address);
    });

    it(revertedMessage.treasury_propose_locked_to_non_zero_address, async function () {
      await expect(fixture.treasury.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_REMOVE))
        .to.revertedWith(revertedMessage.treasury_propose_locked_to_non_zero_address);
    });

    it(revertedMessage.treasury_proposal_not_exist, async function () {
      await expect(fixture.treasury.connect(fixture.proposer1)
        .getProposalSupplyInfoByProposalId(ZeroHash))
        .to.revertedWith(revertedMessage.treasury_proposal_not_exist);
    });

    it(revertedMessage.treasury_only_agent_can_call, async function () {
      await expect(fixture.treasury.connect(fixture.admin).cancel(
        ZeroHash))
        .to.revertedWith(revertedMessage.treasury_only_agent_can_call);
    });
  });
});