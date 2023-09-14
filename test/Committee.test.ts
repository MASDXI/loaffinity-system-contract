import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as eth } from "ethers";

describe("Committee", function () {
  async function deployCommitteeFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Committee = await ethers.getContractFactory("Committee");
    const committee = await Committee.deploy();

    return { committee, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Init", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await expect(committee.initialize([otherAccount.address], owner.address, 0, 240)).to.emit(committee, "Initialized");
    });

    it("IsCommittee", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      expect(await committee.isCommittee(otherAccount.address)).to.equal(true);
    });

    it("IsProposer", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      expect(await committee.isProposer(otherAccount.address)).to.equal(false);
    });

    it("getCommitteeCount", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      expect(await committee.getCommitteeCount()).to.equal(1);
    });

    it("getProposerCount", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      expect(await committee.getProposerCount()).to.equal(0);
    });

    it("getProposalCommitteeInfoByBlockNumber", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      await expect(committee.getProposalCommitteeInfoByBlockNumber(0)).to.be.revertedWith('committee: proposal not exist');
    });

    it("getProposalCommitteeInfoByProposalId", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      await expect(committee.getProposalCommitteeInfoByProposalId(eth.ZeroHash)).to.be.revertedWith('committee: proposal not exist');
    });

    it("votingDeley", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      expect(await committee.votingDeley()).to.equal(0)
    });

    it("votingDeley", async function () {
      const { committee, owner, otherAccount} = await loadFixture(deployCommitteeFixture);
      await committee.initialize([otherAccount.address], owner.address, 0, 240);
      expect(await committee.votingPeriod()).to.equal(240)
    });
  });
});
