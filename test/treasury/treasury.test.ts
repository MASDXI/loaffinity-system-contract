import { expect } from "chai";
import { ZeroAddress, ZeroHash } from "ethers";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture, setBalance, time, mine} from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
    it("treasury: getAvailableBalance", async function () {
      expect(await fixture.supplycontrol.getAvailableBalance())
        .to.equal(constants.ONE_TRILLION_TOKEN);
    });

    it("treasury: getLockedBalance", async function () {
      expect(await fixture.supplycontrol.getLockedBalance())
        .to.equal(constants.ZERO_TOKEN);
    });

    it("treasury: catch propose event", async function () {
      const currentBlock = await ethers.provider.getBlockNumber();
      const targetBlock = currentBlock + 300;      
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
          targetBlock, 
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
          targetBlock,
          anyValue);
      const [ proposer, target, amount, block, type] = 
        await fixture.supplycontrol.getProposalSupplyInfoByBlockNumber(targetBlock)
      expect(proposer).to.equal(fixture.proposer1.address);
      expect(target).to.equal(fixture.committee1.address);
      expect(amount).to.equal(constants.ONE_TOKEN);
      expect(block).to.equal(targetBlock);
      expect(type).to.equal(constants.VOTE_TYPE_ADD);
    });

    it(revertedMessage.treasury_propose_past_block, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        100,
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_past_block)
    });

    it(revertedMessage.treasury_propose_invalid_block, async function () {
      const block = await targetBlock() - 1n;  
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address,
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_invalid_block)
    });

    it(revertedMessage.treasury_propose_invalid_amount, async function () {
      const block = await targetBlock();
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
        fixture.committee1.address, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_to_exist_block);
    });

    it(revertedMessage.treasury_propose_released_to_zero_address, async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        ZeroAddress, 
        constants.VOTE_TYPE_ADD))
        .to.revertedWith(revertedMessage.treasury_propose_released_to_zero_address)
    });

    it(revertedMessage.treasury_propose_locked_to_non_zero_address, async function () {
      const block = await targetBlock();
      await expect(fixture.supplycontrol.connect(fixture.proposer1).propose(
        block, 
        constants.ONE_TOKEN, 
        fixture.committee1.address, 
        constants.VOTE_TYPE_REMOVE))
        .to.revertedWith(revertedMessage.treasury_propose_locked_to_non_zero_address)
    });

    it(revertedMessage.treasury_proposal_not_exist, async function () {
      await expect(fixture.supplycontrol.connect(fixture.proposer1).getProposalSupplyInfoByProposalId(ZeroHash))
        .to.revertedWith(revertedMessage.treasury_proposal_not_exist);
    });

  });
});