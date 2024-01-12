import {
    loadFixture,
    setBalance,
    time,
    mine,
    setCode
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as eth, zeroPadBytes } from "ethers";
import { constants } from "../utils/constants"
import { revertedMessage } from "../utils/reverted";

async function setup(voteDelay: BigInt, votePeriod: BigInt, threshold: BigInt, proposePeriod: BigInt) {
    const proposalMock = await ethers.deployContract("ProposalMock",[voteDelay, votePeriod, threshold, proposePeriod]);
    const signers = await ethers.getSigners();
    return { proposalMock, signers };
}

describe("Abstract Proposal Contract", function () {

    describe("Get function", function () {
      it("get ", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.PROPOSE_PERIOD);
        const voteDelay = await proposalMock.votingDeley();
        const votePeriod = await proposalMock.votingPeriod();
        const threshold = await proposalMock.threshold();
        const proposePeriod = await proposalMock.proposePeriod();
        const proposalPassed = await proposalMock.isProposalPassed(ethers.ZeroHash);
        expect(voteDelay).to.equal(constants.VOTE_DELAY);
        expect(votePeriod).to.equal(constants.VOTE_PERIOD);
        expect(threshold).to.equal(constants.VOTE_THREADSHOLD);
        expect(proposePeriod).to.equal(constants.PROPOSE_PERIOD);
        expect(proposalPassed).to.equal(false);
      });
    });

    describe("Revert", function () {
        it(revertedMessage.proposal_vote_delay_exist, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
            .setVoteDelay(constants.VOTE_DELAY))
            .to.be.revertedWith(revertedMessage.proposal_vote_delay_exist);
        });

        it(revertedMessage.proposal_propose_period_exist, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
            .setProposePeriod(constants.PROPOSE_PERIOD))
            .to.be.revertedWith(revertedMessage.proposal_propose_period_exist);
        });

        it(revertedMessage.proposal_vote_threshold_exist, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
            .setVoteThreshold(constants.VOTE_THREADSHOLD))
            .to.be.revertedWith(revertedMessage.proposal_vote_threshold_exist);
        });

        it(revertedMessage.proposal_propose_period_exist, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
            .setProposePeriod(constants.PROPOSE_PERIOD))
            .to.be.revertedWith(revertedMessage.proposal_propose_period_exist);
        });

        it(revertedMessage.proposal_vote_threshold_min, async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.ZERO,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.revertedWith(revertedMessage.proposal_vote_threshold_min);
        });

        it(revertedMessage.proposal_vote_threshold_max, async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD_EXCEED,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.revertedWith(revertedMessage.proposal_vote_threshold_max);
        });

        it(revertedMessage.proposal_already_exists, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await mine(constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            await expect(proposalMock.connect(signers[0])
            .propose(constants.PROPOSE_PERIOD, 1))
            .to.be.revertedWith(revertedMessage.proposal_already_exists);
        });

        it(revertedMessage.proposal_vote_twice, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_vote_twice);
        });

        it(revertedMessage.proposal_not_start, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);;
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_not_start);
        });

        it(revertedMessage.proposal_expire, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);;
            await mine(constants.VOTE_DELAY + constants.VOTE_PERIOD)
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_expire);
        });

        it(revertedMessage.proposal_voting_period, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY)
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_voting_period);
        });

        it(revertedMessage.proposal_not_pending, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await mine(constants.VOTE_PERIOD);
            await proposalMock.connect(signers[0]).execute(constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_not_pending);
        });

        it(revertedMessage.proposal_max_stack, async function () {
            const { proposalMock, signers } = await setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            let maxuint8 = 256
            for (let index = 1; index < 256; index++) {
                await proposalMock.connect(signers[0]).propose(index, 1);
                await mine(constants.PROPOSE_PERIOD);
            }
            await expect(proposalMock.connect(signers[0])
                .propose(maxuint8, 1))
                .to.be.revertedWith(revertedMessage.proposal_max_stack);
        });



    });
});
