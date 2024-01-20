import {
  loadFixture,
  setBalance,
  time,
  mine
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as eth } from "ethers";
import { constants } from "../utils/constants"
import { setSystemContractFixture } from "../utils/systemContractFixture"
import { revertedMessage } from "../utils/reverted";

async function setup() {
  const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
  await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
  return { initAccount };
}

describe("Committee System Contract", function () {

    let fixture: any;
    let signers: any;
    let initializer: any;

    beforeEach(async function () {
      fixture = await loadFixture(setSystemContractFixture);
      const { initAccount } = await setup();
      initializer = initAccount;
      await fixture.committee.connect(initializer).initialize(
        constants.VOTE_DELAY, 
        constants.VOTE_PERIOD, 
        constants.PROPOSE_PERIOD, 
        [fixture.committee1.address], 
        fixture.admin.address)
    });

    describe("Unit test", function () {
      it("function: all role", async function () {
        expect(await fixture.committee.ROOT_ADMIN_ROLE()).to.equal(constants.ROOT_ADMIN_ROLE);
        expect(await fixture.committee.CONSORTIUM_COMMITEE_ROLE()).to.equal(constants.CONSORTIUM_COMMITEE_ROLE);
        expect(await fixture.committee.PROPOSER_ROLE()).to.equal(constants.PROPOSER_ROLE);
        expect(await fixture.committee.EXECUTOR_AGENT_ROLE()).to.equal(constants.EXECUTOR_AGENT_ROLE);

        expect(await fixture.committee.isCommittee(fixture.committee1.address)).to.equal(true);
        expect(await fixture.committee.isProposer(fixture.proposer1.address)).to.equal(false);
        expect(await fixture.committee.isAgent(fixture.committee1.address)).to.equal(false);
      });

      it("function: intialized() fail", async function () {
        await expect(fixture.committee.connect(fixture.admin).initialize(
          constants.VOTE_DELAY,
          constants.VOTE_PERIOD,
          constants.PROPOSE_PERIOD,
          [fixture.committee1.address], 
          fixture.admin.address)).to.revertedWith(revertedMessage.initializer_only_can_call)
      });

      it("function: getCommitteeCount(), getProposerCount()", async function () {
        expect(await fixture.committee.getCommitteeCount()).to.equal(1);
        expect(await fixture.committee.getProposerCount()).to.equal(1);
      });

      it("function: blockProposal()", async function () {
        expect(await fixture.committee.connect(initializer).blockProposal(0)).to.equal(eth.ZeroHash)
      });

      it("function: proposal not exist", async function () {
        await expect(fixture.committee.getProposalCommitteeInfoByBlockNumber(0))
          .to.revertedWith('committee: proposal not exist');
        await expect(fixture.committee.getProposalCommitteeInfoByProposalId(eth.ZeroHash))
          .to.revertedWith('committee: proposal not exist');
      });

      it("function: grantProposer()", async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        expect(await fixture.committee.isProposer(fixture.proposer1.address)).to.equal(true);

        await expect(fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address))
          .to.revertedWith("committee: grant exist proposer address");

        await expect(fixture.committee.connect(fixture.committee1).grantProposer(fixture.proposer1.address))
          .to.revertedWith("committee: onlyAdmin can call");
        
        expect(await fixture.committee.getProposerCount()).to.equal(2);
      });

      it("function: revokeProposer()", async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.committee1).revokeProposer(fixture.proposer1.address))
          .to.revertedWith("committee: onlyAdmin can call");
        
        await expect(fixture.committee.connect(fixture.admin).revokeProposer(fixture.committee2.address))
          .to.revertedWith("committee: revoke non proposer address");
        
        await fixture.committee.connect(fixture.admin).revokeProposer(fixture.proposer1.address)
        expect(await fixture.committee.isProposer(fixture.proposer1.address)).to.equal(false);
        expect(await fixture.committee.getProposerCount()).to.equal(1);
      });


      it("function: propose() grant", async function () {
        await expect(fixture.committee.connect(fixture.proposer1).propose(300, committee2.address, 1))
          .to.revertedWith("committee: onlyProposer can call")
      });
  });
});
