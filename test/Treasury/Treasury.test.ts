import {
  loadFixture,
  setBalance,
  time,
  mine,
  setCode
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { constants } from "../utils/constants"
import { setSystemContractFixture } from "../utils/systemContractFixture"
import { ZeroAddress, ZeroHash } from "ethers";

describe("Supply Control System Contract", function () {
  describe("Unit test", function () {
    it("function: getAvailableBalance", async function () {
      const { supplycontrol } = await loadFixture(setSystemContractFixture);
      expect(await supplycontrol.getAvailableBalance()).to.equal(constants.ONE_TRILLION_TOKEN);
    });

    it("function: VotingDelay", async function () {
      const { supplycontrol } = await loadFixture(setSystemContractFixture);
      expect(await supplycontrol.votingDeley()).to.equal(0);
    });

    it("function: votingPeriod", async function () {
      const { supplycontrol } = await loadFixture(setSystemContractFixture);
      expect(await supplycontrol.votingPeriod()).to.equal(0);
    });

    it("function: catch propose event", async function () {
      let timestamp = 10953791915;
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await time.setNextBlockTimestamp(timestamp);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await time.setNextBlockTimestamp(timestamp+5);
      await committee.connect(admin).grantProposer(proposer1.address);
      await time.setNextBlockTimestamp(timestamp+10);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await time.setNextBlockTimestamp(timestamp+15);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_TRILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD))
        .to.emit(supplycontrol,"TreasuryProposalProposed")
        .withArgs("0x7b191e0665c3a3cc1de00270233ba76d2dcbc880a33689d07061641767a567ba",
        proposer1.address,
        committee1.address,
        constants.VOTE_TYPE_ADD,
        constants.ONE_TRILLION_TOKEN,
        300,
        10953791930);
    });

    it("function: propose past block", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(0, constants.ONE_TRILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD)).to.be.revertedWith("treasury: propose past block")
    });

    it("function: propose invalid blocknumber", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(100, constants.ONE_TRILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD)).to.be.revertedWith("treasury: invalid blocknumber")
    });

    it("function: propose invalid amount", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ZERO_TOKEN, committee1.address, constants.VOTE_TYPE_ADD)).to.be.revertedWith("treasury: invalid amount")
    });

    it("function: propose to already prospose block", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD)
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, constants.VOTE_TYPE_ADD)).to.be.revertedWith("treasury: blocknumber has propose")
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, ZeroAddress , constants.VOTE_TYPE_ADD)).to.be.revertedWith("treasury: propose released to zero address")
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address , constants.VOTE_TYPE_REMOVE)).to.be.revertedWith("treasury: propose locked to non-zero address")
    });

    it("function: getProposalSupplyInfoByProposalId", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).getProposalSupplyInfoByProposalId(ZeroHash)).to.be.revertedWith("treasury: proposal not exist")
    });

    it("function: getProposalSupplyInfoByProposalId", async function () {
      const { supplycontrol, committee, initializerCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(initializerCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(initializerCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).getProposalSupplyInfoByBlockNumber(0)).to.be.revertedWith("treasury: proposal not exist")
    });
  });
});