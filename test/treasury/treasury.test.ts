import { expect } from "chai";
import { ZeroAddress, ZeroHash } from "ethers";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, setBalance, time, mine} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { constants } from "../utils/constants"
import { revertedMessage } from "../utils/reverted";
import { setSystemContractFixture } from "../utils/systemContractFixture"

async function setup() {
  const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
  const accounts = await ethers.getSigners();
  await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
  return { accounts, initAccount };
}

async function targetBlock() {
  const currentBlock = await ethers.provider.getBlockNumber();
  const targetBlock = BigInt(currentBlock) + constants.VOTE_DELAY + constants.VOTE_PERIOD;
  return targetBlock;
}

describe("Treasury System Contract", function () {

  let fixture: any;
  let signers: any;
  let initializer: any;

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
    await fixture.supplycontrol.connect(initializer).initialize(
      constants.VOTE_DELAY, 
      constants.VOTE_PERIOD, 
      constants.PROPOSE_PERIOD, 
      constants.COMMITTEE_CONTRACT_ADDRESS);
  });

  describe("Unit test", function () {

    it("1. function: getAvailableBalance", async function () {
      expect(await fixture.supplycontrol.getAvailableBalance())
        .to.equal(constants.ONE_TRILLION_TOKEN);
    });

    it("2. function: getLockedBalance", async function () {
      expect(await fixture.supplycontrol.getLockedBalance())
        .to.equal(constants.ZERO_TOKEN);
    });

    it("3. function: propose", async function () {
      const Block = await targetBlock() + BigInt(100);    
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
          Block, 
          constants.ONE_TOKEN, 
          fixture.committee1.address, 
          constants.VOTE_TYPE_ADD))
        .to.emit(fixture.supplycontrol, "TreasuryProposalProposed")
        .withArgs(
          anyValue,
          fixture.proposer1.address,
          fixture.committee1.address,
          constants.VOTE_TYPE_ADD,
          constants.ONE_TOKEN,
          Block,
          anyValue);
      const [ proposer, target, amount, block, type] = 
        await fixture.supplycontrol.getProposalSupplyInfoByBlockNumber(Block)
      expect(proposer).to.equal(fixture.proposer1.address);
      expect(target).to.equal(fixture.committee1.address);
      expect(amount).to.equal(constants.ONE_TOKEN);
      expect(block).to.equal(Block);
      expect(type).to.equal(constants.VOTE_TYPE_ADD);
    });

    it("4. function: vote", async function () {
      const Block = await targetBlock() + BigInt(100);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
          Block, 
          constants.ONE_TOKEN, 
          fixture.committee1.address, 
          constants.VOTE_TYPE_ADD);
      const proposalId = await fixture.supplycontrol.connect(fixture.proposer1).blockProposal(Block);
      await mine(constants.VOTE_DELAY);
      await expect(fixture.supplycontrol.connect(fixture.committee1).vote(proposalId, true))
        .to.emit(fixture.supplycontrol,"TreasuryVoted")
        .withArgs(proposalId, fixture.committee1.address, true, anyValue);
    });

    it("5. function: execute() + accept + RELEASED", async function () {
      const Block = await targetBlock() + BigInt(100);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
          Block, 
          constants.ONE_TOKEN, 
          constants.EXAMPLE_ADDRESS, 
          constants.VOTE_TYPE_ADD);
      const proposalId = await fixture.supplycontrol.connect(fixture.proposer1).blockProposal(Block);
      await mine(constants.VOTE_DELAY);
      await fixture.supplycontrol.connect(fixture.committee1).vote(proposalId, true);
      await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
      await mine(constants.VOTE_PERIOD);
      await expect(fixture.supplycontrol.connect(fixture.proposer2).execute(Block))
        .to.emit(fixture.supplycontrol,"TreasuryProposalExecuted")
        .withArgs( proposalId, constants.VOTE_TYPE_ADD, constants.EXAMPLE_ADDRESS, constants.ONE_TOKEN, anyValue);
      expect(await ethers.provider.getBalance(constants.EXAMPLE_ADDRESS)).to.equal(constants.ONE_TOKEN);
    });

    it("6. function: execute() + accept + REMOVED", async function () {
      const Block = await targetBlock() + BigInt(100);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        Block, 
          constants.ONE_TOKEN, 
          constants.ZERO_ADDRESS, 
          constants.VOTE_TYPE_REMOVE);
      const proposalId = await fixture.supplycontrol.connect(fixture.proposer1).blockProposal(Block);
      await mine(constants.VOTE_DELAY);
      await fixture.supplycontrol.connect(fixture.committee1).vote(proposalId, true);
      await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
      await mine(constants.VOTE_PERIOD);
      await expect(fixture.supplycontrol.connect(fixture.proposer2).execute(Block))
        .to.emit(fixture.supplycontrol,"TreasuryProposalExecuted")
        .withArgs( proposalId, constants.VOTE_TYPE_REMOVE, constants.ZERO_ADDRESS, constants.ONE_TOKEN, anyValue);
      expect(await ethers.provider.getBalance(constants.ZERO_ADDRESS)).to.equal(constants.ONE_TOKEN);
    });

    it("7. function: execute() + reject", async function () {
      const Block = await targetBlock() + BigInt(100);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
          Block, 
          constants.ONE_TOKEN, 
          constants.EXAMPLE_ADDRESS, 
          constants.VOTE_TYPE_ADD);
      const proposalId = await fixture.supplycontrol.connect(fixture.proposer1).blockProposal(Block);
      await mine(constants.VOTE_DELAY);
      await fixture.supplycontrol.connect(fixture.committee1).vote(proposalId, false);
      await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address);
      await mine(constants.VOTE_PERIOD);
      await fixture.supplycontrol.connect(fixture.proposer2).execute(Block);
      expect(await ethers.provider.getBalance(constants.EXAMPLE_ADDRESS)).to.equal(constants.ZERO_TOKEN);
    });

    it("8. revert: propose() + propose past block", async function () {
      const currentBlock = await ethers.provider.getBlockNumber();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        currentBlock,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_past_block)
    });

    it("9. revert: propose() + invalid block", async function () {
      const block = await targetBlock() - 1n;  
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address,
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_invalid_block)
    });

    it("10. revert: propose() + invalid amount", async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ZERO_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_invalid_amount);
    });

    it("11. revert: propose() + exceeded amount", async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TRILLION_TOKEN + 200n, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_amount_exceed);
    });

    it("12. revert: propose() + block too future", async function () {
      const Block = BigInt(await ethers.provider.getBlockNumber()) + constants.EXCEED_UINT16 + 20n;
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        Block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_too_future);
    });

    it("13. revert: propose() + onlyProposer can call", async function () {
      const Block = await targetBlock() + BigInt(100);
      await expect(fixture.supplycontrol.connect(fixture.committee1).propose(
        Block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_only_proposer_can_call);
    });

    it("14. revert: vote() + onlyCommittee can call", async function () {
      const currentBlock = await targetBlock() + BigInt(100);
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        currentBlock, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      const proposalId = await fixture.supplycontrol.connect(fixture.proposer1).blockProposal(currentBlock);
      await expect(fixture.supplycontrol.connect(fixture.proposer2).vote(proposalId, true))
      .to.revertedWith(revertedMessage.treasury_only_committee_can_call);
    });

    it("15. revert: propose() + blocknumber has propose", async function () {
      const block = (await targetBlock()) + 5n;
      await fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD);
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_to_exist_block);
    });

    it("16. revert: propose() + released to zero address", async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_released_to_zero_address)
    });

    it("17. revert: propose() + released to zero address", async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_released_to_zero_address)
    });

    it("18. revert: propose() + locked to non-zero address", async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_REMOVE))
        .to.revertedWith(revertedMessage.treasury_propose_locked_to_non_zero_address)
    });

    it("19. revert: intialized() + onlyInitializer can call", async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        constants.COMMITTEE_CONTRACT_ADDRESS)).to.revertedWith(revertedMessage.initializer_only_can_call);
    });

    it("20. revert: execute() + onlyAgent can call", async function () {
      const Block = await targetBlock() + BigInt(100);
      await expect(fixture.supplycontrol.connect(fixture.proposer2).execute(Block)).to.revertedWith(revertedMessage.treasury_only_agent_can_call);
    });

    it("21. revert: getProposalSupplyInfoByProposalId() + proposal not exist", async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).getProposalSupplyInfoByProposalId(ZeroHash))
        .to.revertedWith(revertedMessage.treasury_proposal_not_exist);
    });

  });
});