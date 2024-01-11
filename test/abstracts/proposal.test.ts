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

async function setup(voteDelay: BigInt, votePeriod: BigInt, threshold: BigInt, proposePeriod: BigInt) {
    const proposalMock = await ethers.deployContract("ProposalMock",[voteDelay, votePeriod, threshold, proposePeriod]);
    const signers = await ethers.getSigners();
    return { proposalMock, signers };
}

describe("Abstract Proposal Contract", function () {

    describe("Unit test", function () {
      it("get voteDelay", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.VOTE_PERIOD);
        const voteDelay = await proposalMock.votingDeley();
        expect(voteDelay).to.equal(constants.VOTE_DELAY);
      });

      it("get votePeriod", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.VOTE_PERIOD);
        const votePeriod = await proposalMock.votingPeriod();
        expect(votePeriod).to.equal(constants.VOTE_PERIOD);
      });

      it("get threashold", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.VOTE_PERIOD);
        const threshold = await proposalMock.threshold();
        expect(threshold).to.equal(constants.VOTE_THREADSHOLD);
      });

      it("get proposePeriod", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.PROPOSE_PERIOD);
        const proposePeriod = await proposalMock.proposePeriod();
        expect(proposePeriod).to.equal(constants.PROPOSE_PERIOD);
      });

      it("get isProposalPass", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.PROPOSE_PERIOD);
        const proposePeriod = await proposalMock.isProposalPassed(ethers.ZeroHash);
        expect(proposePeriod).to.equal(false);
      });
    });

    describe("Invalid argument", function () {
        it("proposal: invalid argument vote delay exceed type uint256", async function () {
            const deploy = setup(
                constants.EXCEED_UINT256,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.rejected;
        });

        it("proposal: invalid argument vote period exceed type uint256", async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.EXCEED_UINT256,
                constants.VOTE_THREADSHOLD,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.rejected;
        });

        it("proposal: invalid argument propose period exceed type uint32", async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD,
                constants.EXCEED_UINT32);
            await expect(deploy).to.be.rejected;
        });

        it("proposal: invalid argument vote threshold exceed type uint8", async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.EXCEED_UINT8,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.rejected;
        });
    });

    describe("Revert", function () {
        it("proposal: less than min threshold", async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.ZERO,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.revertedWith("proposal: less than min threshold");
        });

        it("proposal: more than max threshold", async function () {
            const deploy = setup(
                constants.VOTE_DELAY,
                constants.VOTE_PERIOD,
                constants.VOTE_THREADSHOLD_EXCEED,
                constants.PROPOSE_PERIOD);
            await expect(deploy).to.be.revertedWith("proposal: greater than max threshold");
        });
    });
});
