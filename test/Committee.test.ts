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
    it("function: ROOT_ADMIN_ROLE()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      expect(await committee.ROOT_ADMIN_ROLE()).to.equal("0x77ccc78fff97648b6361d5a6f0bd0a9f7c43fd29c1369941d3474c71311418fc");
    });

    it("function: COMMITEE_ROLE()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      expect(await committee.COMMITEE_ROLE()).to.equal("0x08da096d11689a7c6ed04f3885d9296d355e262ee0f570fe692a8d9ec7ebd3c4");
    });

    it("function: PROPOSER_ROLE()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      expect(await committee.PROPOSER_ROLE()).to.equal("0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1");
    });

    it("function: intialized()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await expect(committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240)).to.emit(committee, "Initialized");
    });

    it("function: intialized()", async function () {
      const { committee, committee1, admin, otherAccount, systemAddress} = await loadFixture(deployCommitteeFixture);
      await expect(committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240)).to.emit(committee, "Initialized");
      await expect(committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240)).to.be.revertedWith("committee: already init")
    });

    it("function: intialized() fail", async function () {
      const { committee, committee1, admin} = await loadFixture(deployCommitteeFixture);
      await expect(committee.connect(admin).initialize([committee1.address], admin.address, 0, 240)).to.be.revertedWith("committee: onlySystemAddress can call")
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

    it("function: grantProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.connect(committee1).grantProposer(proposer1.address)).to.be.revertedWith("committee: onlyAdmin can call")
    });

    it("function: revokeProposer()", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address)
      await committee.connect(admin).revokeProposer(proposer1.address)
      expect(await committee.isProposer(proposer1.address)).to.equal(false);
    });

    it("function: revokeProposer() fail", async function () {
      const { committee, committee1, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address)
      await expect(committee.connect(committee1).revokeProposer(proposer1.address)).to.be.revertedWith("committee: onlyAdmin can call")
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
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.connect(proposer1).propose(300, committee2.address, 1)).to.be.revertedWith("committee: onlyProposer can call")
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
      const ret = await committee.getProposalCommitteeInfoByProposalId(proposalId);
      expect(ret.proposer).to.equal(proposer1.address);
      expect(ret.commitee).to.be.equal(committee1.address);
      expect(ret.blockNumber).to.be.equal(300);
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
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await expect(committee.connect(proposer1).propose(300, committee1.address, 1)).to.be.revertedWith('committee: propose add existing committee')
    });

    it("function: propose()", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await expect(committee.connect(proposer1).propose(300, committee2.address, 0)).to.be.revertedWith('committee: propose remove not exist commitee')
    });

    it("function: propose()", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await expect(committee.connect(proposer1).propose(300, eth.ZeroAddress, 1)).to.be.revertedWith('committee: propose zero address')
    });

    it("function: propose()", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await expect(committee.connect(proposer1).propose(230, committee2.address, 1)).to.be.revertedWith('committee: invalid blocknumber')
    });

    it("function: propose()", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      const blockNumber = await time.latestBlock()
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await committee.connect(admin).grantProposer(proposer1.address);
      await expect(committee.connect(proposer1).propose(blockNumber, committee2.address, 1)).to.be.revertedWith('committee: propose past block')
    });

    it("function: execute() fail", async function () {
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
      expect(await committee.connect(systemAddress).execute(300));
      expect(await committee.isCommittee(committee2.address)).to.equal(false);
    });

    it("function: execute() fail not exist", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress} = await loadFixture(deployCommitteeFixture);
      await committee.connect(systemAddress).initialize([committee1.address], admin.address, 0, 240);
      await expect(committee.connect(systemAddress).execute(300)).to.be.revertedWith("committee: proposal not exist");
    });

    it("function: execute() success", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress, otherAccount} = await loadFixture(deployCommitteeFixture);
      const proposalId = "0x6d6fa43b66cd017595511990ce9c1237df71e4aed1c912277664a5a492a0821a"
      await time.setNextBlockTimestamp(10953791915);
      await committee.connect(systemAddress).initialize([committee1.address, committee2.address], admin.address, 0, 240);
      await time.setNextBlockTimestamp(10953791920);
      await committee.connect(admin).grantProposer(proposer1.address);
      await time.setNextBlockTimestamp(10953791925);
      await expect(committee.connect(proposer1).propose(300, otherAccount.address, 1))
        .to.emit(committee,"CommitteeProposalProposed")
        .withArgs(proposalId,proposer1.address,otherAccount.address,1,300,10953791925);
      await committee.connect(committee1).vote(proposalId, true);
      await committee.connect(committee2).vote(proposalId, true);
      expect(await committee.connect(systemAddress).execute(300));
      expect(await committee.isCommittee(otherAccount.address)).to.equal(true);
    });

    it("function: execute() success", async function () {
      const { committee, committee1, committee2, admin, proposer1, systemAddress, otherAccount} = await loadFixture(deployCommitteeFixture);
      const proposalId = "0xa927f87d6cbb3c2ce8df3beee1a1ee4419bdf68af04626e0f126885c8e79a489"
      await time.setNextBlockTimestamp(10953791915);
      await committee.connect(systemAddress).initialize([committee1.address, committee2.address], admin.address, 0, 240);
      await time.setNextBlockTimestamp(10953791920);
      await committee.connect(admin).grantProposer(proposer1.address);
      await time.setNextBlockTimestamp(10953791925);
      await expect(committee.connect(proposer1).propose(300, committee2.address, 0))
        .to.emit(committee,"CommitteeProposalProposed")
        .withArgs(proposalId,proposer1.address,committee2.address,0,300,10953791925);
      await committee.connect(committee1).vote(proposalId, true);
      await committee.connect(committee2).vote(proposalId, true);
      expect(await committee.connect(systemAddress).execute(300));
      expect(await committee.isCommittee(committee2.address)).to.equal(false);
      expect(await committee.connect(systemAddress).blockProposal(300)).to.equal(proposalId)
    });

    //committee: propose remove not exist commitee
    //committee: propose add existing committee
  });
});
