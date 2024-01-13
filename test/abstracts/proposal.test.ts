import { expect } from "chai";
import { ethers } from "hardhat";
import { mine } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { constants } from "../utils/constants"
import { revertedMessage } from "../utils/reverted";

async function setup(voteDelay: BigInt, votePeriod: BigInt, threshold: BigInt, proposePeriod: BigInt) {
    const contract = await ethers.deployContract("ProposalMock",[voteDelay, votePeriod, threshold, proposePeriod]);
    const accounts = await ethers.getSigners();
    return { contract, accounts };
}

describe("Abstract Proposal Contract", function () {

    let proposalMock: any;
    let signers: any;

    beforeEach(async function () {
        const { contract, accounts } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.PROPOSE_PERIOD);
        proposalMock = contract;
        signers = accounts;
        // skip 100 blocks
        await mine(100);
    })

    describe("Get function", function () {
        it("get ", async function () {
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

        //LogCreateProposal
        it("test event create", async function () {
            await expect(proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1))
                .to.be.emit(proposalMock,"LogCreateProposal")
                .withArgs(anyValue, anyValue, signers[0].getAddress);
        });

        it("test event vote", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await expect(proposalMock.connect(signers[0]).vote(proposalId, true))
                .to.be.emit(proposalMock,"LogVote")
                .withArgs(anyValue, anyValue, true, anyValue);
        });

        it("test event", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await proposalMock.connect(signers[1]).vote(proposalId, true);
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 1);
        });

        it("test event", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await proposalMock.connect(signers[1]).vote(proposalId, false);
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("test event", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            for (let index = 0; index < 5; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
            }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("test event", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, false);
            await proposalMock.connect(signers[1]).vote(proposalId, false);
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });


    });

    describe("Revert", function () {
        it(revertedMessage.proposal_vote_delay_exist, async function () {
            await expect(proposalMock.connect(signers[0])
            .setVoteDelay(constants.VOTE_DELAY))
            .to.be.revertedWith(revertedMessage.proposal_vote_delay_exist);
        });

        it(revertedMessage.proposal_propose_period_exist, async function () {
            await expect(proposalMock.connect(signers[0])
            .setProposePeriod(constants.PROPOSE_PERIOD))
            .to.be.revertedWith(revertedMessage.proposal_propose_period_exist);
        });

        it(revertedMessage.proposal_vote_threshold_exist, async function () {
            await expect(proposalMock.connect(signers[0])
            .setVoteThreshold(constants.VOTE_THREADSHOLD))
            .to.be.revertedWith(revertedMessage.proposal_vote_threshold_exist);
        });

        it(revertedMessage.proposal_propose_period_exist, async function () {
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
            await mine(constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            await expect(proposalMock.connect(signers[0])
            .propose(constants.PROPOSE_PERIOD, 1))
            .to.be.revertedWith(revertedMessage.proposal_already_exists);
        });

        it(revertedMessage.proposal_vote_twice, async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);;
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_vote_twice);
        });

        it(revertedMessage.proposal_not_start, async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);;
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_not_start);
        });

        it(revertedMessage.proposal_expire, async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);;
            await mine(constants.VOTE_DELAY + constants.VOTE_PERIOD)
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_expire);
        });

        it(revertedMessage.proposal_voting_period, async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_voting_period);
        });

        it(revertedMessage.proposal_not_pending, async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);;
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await mine(constants.VOTE_PERIOD);;
            await proposalMock.connect(signers[0]).execute(constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_not_pending);
        });

        it(revertedMessage.proposal_max_stack, async function () {
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
