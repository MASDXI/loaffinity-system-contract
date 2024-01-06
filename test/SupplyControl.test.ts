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
import { constants } from "./utils/constants"
import { setSystemContractFixture } from "./utils/systemContractFixture"
import { ZeroAddress, ZeroHash } from "ethers";

describe("Supply Control System Contract", function () {
  describe("Unit test", function () {
    it("function: get", async function () {
      const { supplycontrol } = await loadFixture(setSystemContractFixture);
      expect(await supplycontrol.votingDeley()).to.equal(0);
      expect(await supplycontrol.votingPeriod()).to.equal(0);
    });

    it("function: propose", async function () {
      let timestamp = 10953791915;
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await time.setNextBlockTimestamp(timestamp);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await time.setNextBlockTimestamp(timestamp+5);
      await committee.connect(admin).grantProposer(proposer1.address);
      await time.setNextBlockTimestamp(timestamp+10);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await time.setNextBlockTimestamp(timestamp+15);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_TRILLION_TOKEN, committee1.address, 0))
        .to.emit(supplycontrol,"SupplyMintProposalProposed")
        .withArgs("0x7b191e0665c3a3cc1de00270233ba76d2dcbc880a33689d07061641767a567ba",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        0,
        constants.ONE_TRILLION_TOKEN,
        300,
        10953791930);
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(0, constants.ONE_TRILLION_TOKEN, committee1.address, 0)).to.be.revertedWith("supplycontrol: propose past block")
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(100, constants.ONE_TRILLION_TOKEN, committee1.address, 0)).to.be.revertedWith("supplycontrol: invalid blocknumber")
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ZERO_TOKEN, committee1.address, 0)).to.be.revertedWith("supplycontrol: invalid amount")
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, 0)
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN, committee1.address, 0)).to.be.revertedWith("supplycontrol: blocknumber has propose")
    });

    it("function: propose", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).propose(300, constants.ONE_MILLION_TOKEN,ZeroAddress, 0)).to.be.revertedWith("supplycontrol: propose zero address")
    });

    it("function: getProposalSupplyInfoByProposalId", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).getProposalSupplyInfoByProposalId(ZeroHash)).to.be.revertedWith("supplycontrol: proposal not exist")
    });

    it("function: getProposalSupplyInfoByProposalId", async function () {
      const { supplycontrol, committee, systemCallerSigner, committee1, admin, proposer1} = await loadFixture(setSystemContractFixture);
      await committee.connect(systemCallerSigner).initialize(0, 240, [committee1.address], admin.address);
      await committee.connect(admin).grantProposer(proposer1.address);
      await supplycontrol.connect(systemCallerSigner).initialize(0,240,constants.COMMITTEE_CONTRACT_ADDRESS);
      await expect(supplycontrol.connect(proposer1).getProposalSupplyInfoByBlockNumber(0)).to.be.revertedWith("supplycontrol: proposal not exist")
    });

    


    
  });
});