import {
  loadFixture,
  setBalance,
  time,
  mine
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as eth } from "ethers";

describe("Committee", function () {
  async function deployCommitteeFixture() {
    // Contracts are deployed using the first signer/account by default
    const [admin, committee1, committee2, committee3, proposer1 , proposer2 , otherAccount] = await ethers.getSigners();
    
    const systemAddress = await ethers.getImpersonatedSigner("0x0000000000000000000000000000000000000F69");
    await setBalance(systemAddress.address, 100n ** 18n);

    const Committee = await ethers.getContractFactory("Committee");
    const committee = await Committee.deploy();

    return { committee, admin , committee1, committee2, committee3, proposer1 , proposer2 , otherAccount, systemAddress };
  }

  describe("Deployment", function () {
    it("function: intialized()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await expect(committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240)).to.emit(committee, "Initialized");
    });

    it("function: IsCommittee()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      expect(await committee.isCommittee(committee1.address)).to.equal(true);
    });

    it("function: IsProposer()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      expect(await committee.isProposer(otherAccount.address)).to.equal(false);
    });

    it("function: getCommitteeCount()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      expect(await committee.getCommitteeCount()).to.equal(1);
    });

    it("function: getProposerCount()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      expect(await committee.getProposerCount()).to.equal(1);
    });

    it("function: blockProposal()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      const zeroByte = "0x2ef4c3419176f842a40b01462009a5b0b285c8b04c960a177b93a6d8935d4b79"
      expect(await committee.connect(systemAddress).blockProposal(0)).to.equal(eth.ZeroHash)
    });


    it("function: getProposalCommitteeInfoByBlockNumber()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.getProposalCommitteeInfoByBlockNumber(0)).to.be.revertedWith('committee: proposal not exist');
    });

    it("function: getProposalCommitteeInfoByProposalId()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.getProposalCommitteeInfoByProposalId(eth.ZeroHash)).to.be.revertedWith('committee: proposal not exist');
    });

    it("function: votingDeley()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      expect(await committee.votingDeley()).to.equal(0)
    });

    it("function: votingDeley()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      expect(await committee.votingPeriod()).to.equal(240)
    });

    it("function: grantProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address)
      expect(await committee.isProposer(proposer1.address)).to.equal(true);
    });

    it("function: revokeProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address)
      await committee.connect(admin).revokeProposer(proposer1.address)
      expect(await committee.isProposer(proposer1.address)).to.equal(false);
    });

    it("function: grantProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address)
      await expect(committee.connect(admin).grantProposer(proposer1.address)).to.be.revertedWith("committee: grant exist proposer address");
    });

    it("function: revokeProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.connect(admin).revokeProposer(proposer1.address)).to.be.revertedWith("committee: revoke non proposer address");
    });

    it("function: propose() grant", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      const proposalId = "0x05bff83ca32a69707094163eca3174eb2ae9a7a1394ce6c79b690e4c7256e1bb"
      await time.setNextBlockTimestamp(10953791915);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await time.setNextBlockTimestamp(10953791920);
      await committee.connect(admin).grantProposer(proposer1.address);
      await time.setNextBlockTimestamp(10953791925);
      await expect(committee.connect(proposer1).propose(300, committee2.address, 1))
        .to.emit(committee,"CommitteeProposalProposed")
        .withArgs(proposalId,proposer1.address,committee2.address,1,300,10953791925);
    });

    it("function: propose() revoke", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      const proposalId = "0x2ef4c3419176f842a40b01462009a5b0b285c8b04c960a177b93a6d8935d4b79"
      await time.setNextBlockTimestamp(10953791915);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await time.setNextBlockTimestamp(10953791920);
      await committee.connect(admin).grantProposer(proposer1.address);
      await time.setNextBlockTimestamp(10953791925);
      await expect(committee.connect(proposer1).propose(300, committee1.address, 0))
        .to.emit(committee,"CommitteeProposalProposed")
        .withArgs(proposalId,proposer1.address,committee1.address,0,300,10953791925);
    });

    it("function: propose()", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await committee.connect(proposer1).propose(300, committee2.address, 1);
      await expect(committee.connect(proposer1).propose(300, committee2.address, 1)).to.be.revertedWith('proposal: proposalId already exists')
    });

    it("function: propose()", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      const blockNumber = await time.latestBlock()
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await expect(committee.connect(proposer1).propose(blockNumber, committee2.address, 1)).to.be.revertedWith('committee: propose past block')
    });

    it("function: propose()", async function () {
      const { committee, committee1, otherAccount} = await loadFixture(deployCommitteeFixture);
      const blockNumber = await time.latestBlock()
      await expect(committee.connect(otherAccount).propose(blockNumber, committee1.address, 1)).to.be.revertedWith('committee: onlyProposer can call')
    });

    it("function: revokeProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.connect(committee1).vote(eth.ZeroHash,true)).to.be.revertedWith("proposal: proposalId not exist");
    });

  });
});
