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
  await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
  return { initAccount };
}

describe("Committee System Contract", function () {

    let fixture: any;
    let signers: any;
    let initializer: any;
    let block: bigint;

    beforeEach(async function () {
      fixture = await loadFixture(setSystemContractFixture);
      const { initAccount } = await setup();
      initializer = initAccount;
      await fixture.committee.connect(initializer).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        [fixture.committee1.address], 
        fixture.admin.address)
      await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1);
      block = await targetBlock();
    });

    describe("Unit test", function () {
      it("committee: all role", async function () {
        expect(await fixture.committee.ROOT_ADMIN_ROLE()).to.equal(constants.ROOT_ADMIN_ROLE);
        expect(await fixture.committee.CONSORTIUM_COMMITTEE_ROLE()).to.equal(constants.CONSORTIUM_COMMITTEE_ROLE);
        expect(await fixture.committee.PROPOSER_ROLE()).to.equal(constants.PROPOSER_ROLE);
        expect(await fixture.committee.EXECUTOR_AGENT_ROLE()).to.equal(constants.EXECUTOR_AGENT_ROLE);
      });

      it("committee: intialized fail", async function () {
        await expect(fixture.committee.connect(fixture.admin).initialize(
          constants.VOTE_DELAY,
          constants.VOTE_PERIOD,
          constants.PROPOSE_PERIOD,
          [fixture.committee1.address], 
          fixture.admin.address)).to.revertedWith(revertedMessage.initializer_only_can_call)
      });

      it("committee: catch propose event", async function () {
        await expect(fixture.committee.connect(fixture.proposer1).propose(
          block,  
          fixture.committee2.address, 
          constants.VOTE_TYPE_ADD))
        .to.emit(fixture.committee, "CommitteeProposalProposed")
        .withArgs(
          anyValue,
          fixture.proposer1.address,
          fixture.committee2.address,
          constants.VOTE_TYPE_ADD,
          block,
          anyValue);
        const [ proposer, target, blockNumber, type] = 
          await fixture.committee.getProposalCommitteeInfoByBlockNumber(block)
        expect(proposer).to.equal(fixture.proposer1.address);
        expect(target).to.equal(fixture.committee2.address);
        expect(blockNumber).to.equal(block);
        expect(type).to.equal(constants.VOTE_TYPE_ADD);
      });

      it("committee: grantProposer", async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer2.address)
        expect(await fixture.committee.isProposer(fixture.proposer2.address)).to.equal(true);        
        expect(await fixture.committee.getProposerCount()).to.equal(3);
      });

      it("committee: revokeProposer", async function () {
        await fixture.committee.connect(fixture.admin).revokeProposer(fixture.proposer1.address)
        expect(await fixture.committee.isProposer(fixture.proposer1.address)).to.equal(false);
        expect(await fixture.committee.getProposerCount()).to.equal(1);
      });

      it("committee: grantAgent", async function () {
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer1.address);
        expect(await fixture.committee.isAgent(fixture.proposer1.address)).to.equal(true);
      });

      it("committee: revokeAgent", async function () {
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).revokeAgent(fixture.proposer1.address)
        expect(await fixture.committee.isAgent(fixture.proposer1.address)).to.equal(false);
      });

      it("committee: vote", async function () {
        await fixture.committee.connect(fixture.proposer1).propose(
          block,  
          fixture.committee2.address, 
          constants.VOTE_TYPE_ADD);
        await mine(constants.VOTE_DELAY);
        const proposalId = await fixture.committee.blockProposal(block);
        await expect(fixture.committee.connect(fixture.committee1).vote(
          proposalId,
          constants.VOTE_AGREE
        )).to.emit(fixture.committee,"CommitteeVoted")
          .withArgs(proposalId, fixture.committee1.address, constants.VOTE_AGREE, anyValue);
      });

      it("committee: execute add", async function () {
        await fixture.committee.connect(fixture.proposer1).propose(
          block,
          fixture.committee2.address, 
          constants.VOTE_TYPE_ADD);
        await mine(constants.VOTE_DELAY);
        const proposalId = await fixture.committee.blockProposal(block);
        await fixture.committee.connect(fixture.committee1)
          .vote(proposalId,constants.VOTE_AGREE);
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.otherAccount.address);
        await mine(constants.VOTE_PERIOD);
        await expect(fixture.committee.connect(fixture.otherAccount).execute(block))
          .to.emit(fixture.committee, "CommitteeProposalExecuted")
          .withArgs(
            proposalId,
            constants.VOTE_TYPE_ADD,
            fixture.committee2.address,
            anyValue
          );
        expect(await fixture.committee.isCommittee(fixture.committee2.address)).to.equal(true);
      });

      it("committee: execute remove", async function () {
        await fixture.committee.connect(fixture.proposer1).propose(
          block,
          fixture.committee1.address, 
          constants.VOTE_TYPE_REMOVE);
        await mine(constants.VOTE_DELAY);
        const proposalId = await fixture.committee.blockProposal(block);
        await fixture.committee.connect(fixture.committee1)
          .vote(proposalId,constants.VOTE_AGREE);
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.otherAccount.address);
        await mine(constants.VOTE_PERIOD);
        await expect(fixture.committee.connect(fixture.otherAccount).execute(block))
          .to.emit(fixture.committee, "CommitteeProposalExecuted")
          .withArgs(
            proposalId,
            constants.VOTE_TYPE_REMOVE,
            fixture.committee1.address,
            anyValue
          );
        expect(await fixture.committee.isCommittee(fixture.committee1.address)).to.equal(false);
      });

      it("committee: execute reject", async function () {
        // TODO
      });

      it(revertedMessage.committee_only_agent_can_call, async function () {
        await expect(fixture.committee.connect(fixture.admin).execute(
          ZeroHash))
          .to.revertedWith(revertedMessage.committee_only_agent_can_call);
      });

      it(revertedMessage.committee_only_committee_can_call, async function () {
        await fixture.committee.connect(fixture.proposer1).propose(
          block,  
          fixture.committee2.address, 
          constants.VOTE_TYPE_ADD);
        await mine(constants.VOTE_DELAY);
        const proposalId = await fixture.committee.blockProposal(block);
        await expect(fixture.committee.connect(fixture.admin).vote(
          proposalId,
          constants.VOTE_AGREE))
          .to.revertedWith(revertedMessage.committee_only_committee_can_call);
      });

      it(revertedMessage.committee_only_admin_can_call, async function () {
        await expect(fixture.committee.connect(fixture.committee1)
          .grantProposer(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_only_admin_can_call);
        await expect(fixture.committee.connect(fixture.committee1)
          .revokeProposer(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_only_admin_can_call);
        await expect(fixture.committee.connect(fixture.committee1)
          .grantAgent(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_only_admin_can_call);
        await expect(fixture.committee.connect(fixture.committee1)
          .revokeAgent(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_only_admin_can_call);
      });

      it(revertedMessage.committee_only_proposer_can_call, async function () {
        await expect(fixture.committee.connect(fixture.committee1).propose(
          block,
          fixture.committee2.address,
          constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_only_proposer_can_call)
      });

      it(revertedMessage.committee_propose_past_block, async function () {
        await expect(fixture.committee.connect(fixture.admin).propose(
          constants.ZERO,
          fixture.proposer1.address,
          constants.VOTE_TYPE_ADD)).to.revertedWith(revertedMessage.committee_propose_past_block);
      });

      it(revertedMessage.committee_propose_zero_address, async function () {
        await expect(fixture.committee.connect(fixture.admin).propose(
          block,
          ZeroAddress,
          constants.VOTE_TYPE_ADD)).to.revertedWith(revertedMessage.committee_propose_zero_address);
      });

      it(revertedMessage.committee_propose_invalid_block, async function () {
        await expect(fixture.committee.connect(fixture.admin).propose(
          block - 1n,
          fixture.committee2.address,
          constants.VOTE_TYPE_ADD)).to.revertedWith(revertedMessage.committee_propose_invalid_block);
      });

      it(revertedMessage.committee_propose_too_future, async function () {
        await expect(fixture.committee.connect(fixture.admin).propose(
          block + constants.EXCEED_UINT16,
          fixture.committee2.address,
          constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_too_future);
      });

      it(revertedMessage.committee_propose_add_exist_address, async function () {
        await expect(fixture.committee.connect(fixture.admin).propose(
          block,
          fixture.committee1.address,
          constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_add_exist_address);
      });

      it(revertedMessage.committee_propose_remove_non_exist_address, async function () {
        await expect(fixture.committee.connect(fixture.admin).propose(
          block,
          fixture.committee2.address,
          constants.VOTE_TYPE_REMOVE))
          .to.revertedWith(revertedMessage.committee_propose_remove_non_exist_address);
      });

      it(revertedMessage.committee_propose_to_exist_block, async function () {
        const block = (await targetBlock()) + 5n;
        await fixture.committee.connect(fixture.admin).propose(
          block,
          fixture.committee2.address,
          constants.VOTE_TYPE_ADD);
        await expect(fixture.committee.connect(fixture.admin).propose(
          block,
          fixture.committee1.address,
          constants.VOTE_TYPE_REMOVE))
          .to.revertedWith(revertedMessage.committee_propose_to_exist_block);
      });

      it(revertedMessage.committee_proposal_not_exist, async function () {
        await expect(fixture.committee.getProposalCommitteeInfoByBlockNumber(0))
          .to.revertedWith(revertedMessage.committee_proposal_not_exist);
        await expect(fixture.committee.getProposalCommitteeInfoByProposalId(eth.ZeroHash))
          .to.revertedWith(revertedMessage.committee_proposal_not_exist);
      });

      it(revertedMessage.committee_grant_exist_proposer, async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer2.address);
        await expect(fixture.committee.connect(fixture.admin)
          .grantProposer(fixture.proposer2.address))
          .to.revertedWith(revertedMessage.committee_grant_exist_proposer);
      });

      it(revertedMessage.committee_grant_exist_agent, async function () {
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.otherAccount.address);
        await expect(fixture.committee.connect(fixture.admin)
          .grantAgent(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_grant_exist_agent);
      });

      it(revertedMessage.committee_revoke_non_exist_proposer, async function () {
        await expect(fixture.committee.connect(fixture.admin)
          .revokeProposer(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_revoke_non_exist_proposer);
      });

      it(revertedMessage.committee_revoke_non_exist_agent, async function () {
        await expect(fixture.committee.connect(fixture.admin)
          .revokeAgent(fixture.otherAccount.address))
          .to.revertedWith(revertedMessage.committee_revoke_non_exist_agent);
      });

  });
});
