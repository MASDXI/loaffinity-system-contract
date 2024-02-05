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
    });

    describe("Unit test", function () {

        it("1. state variable: all variables", async function () {
            const voteDelay = await proposalMock.votingDeley();
            const votePeriod = await proposalMock.votingPeriod();
            const threshold = await proposalMock.threshold();
            const proposePeriod = await proposalMock.proposePeriod();
            const proposalPassed = await proposalMock.isProposalPassed(ethers.ZeroHash);
            const latestProposal = await proposalMock.latestProposal(signers[0].address);
            expect(voteDelay).to.equal(constants.VOTE_DELAY);
            expect(votePeriod).to.equal(constants.VOTE_PERIOD);
            expect(threshold).to.equal(constants.VOTE_THREADSHOLD);
            expect(proposePeriod).to.equal(constants.PROPOSE_PERIOD);
            expect(proposalPassed).to.equal(false);
            expect(latestProposal).to.equal(0);
        });

        it("2. function: propose()", async function () {
            await expect(proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1))
                .to.emit(proposalMock,"LogCreateProposal")
                .withArgs(anyValue, anyValue, signers[0].getAddress);
        });

        it("3. function: vote()", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await expect(proposalMock.connect(signers[0]).vote(proposalId, true))
                .to.emit(proposalMock,"LogVote")
                .withArgs(anyValue, anyValue, true, anyValue);
        });

        it("4. function: execute() + if(vote true and false == threshold && true == false) => fail", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
                for (let index = 0; index < 10; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
                }
                for (let index = 10; index < 20; index++) {
                    await proposalMock.connect(signers[index]).vote(proposalId, false);
                }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("5. function: execute() + if(vote true and false < threshold && true == false) => fail", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
                for (let index = 0; index < 5; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
                }
                for (let index = 5; index < 10; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, false);
                }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("6. function: execute() + if(vote true and false < threshold && true > false) => fail", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
                for (let index = 0; index < 6; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
                }
                for (let index = 6; index < 11; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, false);
                }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("7. function: execute() + if(vote true and false < threshold && true < false) => fail", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
                for (let index = 0; index < 5; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
                }
                for (let index = 5; index < 11; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, false);
                }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("8. function: execute() + if(vote true || vote false > threshold && true > false) => success", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
                for (let index = 0; index < 12; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
                }
                for (let index = 12; index < 18; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, false);
                }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 1);
        });

        it("9. function: execute() + test event execute: if(vote true || vote false > threshold && true < false) => fail", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 10);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
                for (let index = 0; index < 6; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, true);
                }
                for (let index = 6; index < 18; index++) {
                await proposalMock.connect(signers[index]).vote(proposalId, false);
                }
            await mine(constants.VOTE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.emit(proposalMock,"LogProposal")
                .withArgs(anyValue, anyValue, 2);
        });

        it("10. revert: this vote period value already set", async function () {
            await expect(proposalMock.connect(signers[0])
                .setVotePeriod(constants.VOTE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_vote_period_exist);
        });

        it("11. revert: this vote delay value already set", async function () {
            await expect(proposalMock.connect(signers[0])
                .setVoteDelay(constants.VOTE_DELAY))
                .to.be.revertedWith(revertedMessage.proposal_vote_delay_exist);
        });

        it("12. revert: this vote threshold value already set", async function () {
            await expect(proposalMock.connect(signers[0])
                .setVoteThreshold(constants.VOTE_THREADSHOLD))
                .to.be.revertedWith(revertedMessage.proposal_vote_threshold_exist);
        });

        it("13. revert: this propose period value already set", async function () {
            await expect(proposalMock.connect(signers[0])
                .setProposePeriod(constants.PROPOSE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_propose_period_exist);
        });

        it("14. revert: less than min threshold", async function () {
            const deploy = setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.ZERO,
            constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.revertedWith(revertedMessage.proposal_vote_threshold_min);
        });

        it("15. revert: less than min threshold", async function () {
            const deploy = setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD_EXCEED,
            constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.revertedWith(revertedMessage.proposal_vote_threshold_max);
        });

        it("16. revert: proposalId already exists", async function () {
            await mine(constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            await expect(proposalMock.connect(signers[0])
                .propose(constants.PROPOSE_PERIOD, 1))
                .to.be.revertedWith(revertedMessage.proposal_already_exists);
        });

        it("17. revert: propose again later", async function () {
            await expect(proposalMock.connect(signers[0]).propose(1, 1))
            .to.be.emit(proposalMock,"LogCreateProposal")
            .withArgs(anyValue, anyValue, signers[0].getAddress);
            await expect(proposalMock.connect(signers[0]).propose(2, 1))
            .to.be.revertedWith(revertedMessage.proposal_propose_too_soon)
        });

        it("18. revert: proposalId not exist", async function () {
            await mine(constants.PROPOSE_PERIOD);
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const randomProposalId = ethers.randomBytes(32);
            await expect(proposalMock.connect(signers[0])
                .vote(randomProposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_vote_not_exist);
        });

        it("19. revert: not allow to vote twice", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_vote_twice);
        });

        it("20. revert: proposal not start", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_not_start);
        });

        it("21. revert: proposal expired", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);;
            await mine(constants.VOTE_DELAY + constants.VOTE_PERIOD)
            await expect(proposalMock.connect(signers[0])
                .vote(proposalId, true))
                .to.be.revertedWith(revertedMessage.proposal_expire);
        });

        it("22. revert: are in voting period", async function () {
            await proposalMock.connect(signers[0]).propose(constants.PROPOSE_PERIOD, 1);
            const proposalId = await proposalMock.blockProposal(constants.PROPOSE_PERIOD);
            await mine(constants.VOTE_DELAY);
            await proposalMock.connect(signers[0]).vote(proposalId, true);
            await expect(proposalMock.connect(signers[0])
                .execute(constants.PROPOSE_PERIOD))
                .to.be.revertedWith(revertedMessage.proposal_voting_period);
        });

        it("23. revert: proposal not pending", async function () {
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

        it("24. revert: propose max stack", async function () {
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