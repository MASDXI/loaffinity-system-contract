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

async function setup(voteDelay: number, votePeriod: number, threadshold: number, proposePeriod: number) {
    const proposalMock = await ethers.deployContract("ProposalMock",[voteDelay, votePeriod, threadshold, proposePeriod]);
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
        const threadshold = await proposalMock.threshold();
        expect(threadshold).to.equal(constants.VOTE_THREADSHOLD);
      });

      it("get proposePeriod", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.VOTE_PERIOD);
        const proposePeriod = await proposalMock.proposePeriod();
        expect(proposePeriod).to.equal(constants.VOTE_PERIOD);
      });

      it("get isProposalPass", async function () {
        const { proposalMock } = await setup(
            constants.VOTE_DELAY,
            constants.VOTE_PERIOD,
            constants.VOTE_THREADSHOLD,
            constants.VOTE_PERIOD);
        const proposePeriod = await proposalMock.isProposalPassed(ethers.ZeroHash);
        expect(proposePeriod).to.equal(false);
      });
    });

    describe("Unit test", function () {

    });

});
