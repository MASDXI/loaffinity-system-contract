import {
  loadFixture,
  setBalance,
  mine
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ethers as eth } from "ethers";
import { constants } from "../utils/constants"
import { setSystemContractFixture } from "../utils/systemContractFixture"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { revertedMessage } from "../utils/reverted";

async function setup() {
  const initAccount = await ethers.getImpersonatedSigner(constants.INITIALIZER_ADDRESS);
  await setBalance(await initAccount.getAddress(), constants.ONE_TOKEN);
  return { initAccount };
}

async function targetBlock() {
  const currentBlock = await ethers.provider.getBlockNumber();
  const targetBlock = BigInt(currentBlock) + constants.VOTE_PERIOD;
  return targetBlock;
}

describe("Committee System Contract", function () {

    let fixture: any;
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

      it("1. state variable: all roles", async function () {
          expect(await fixture.committee.ROOT_ADMIN_ROLE()).to.equal(constants.ROOT_ADMIN_ROLE);
          expect(await fixture.committee.CONSORTIUM_COMMITEE_ROLE()).to.equal(constants.CONSORTIUM_COMMITEE_ROLE);
          expect(await fixture.committee.PROPOSER_ROLE()).to.equal(constants.PROPOSER_ROLE);
          expect(await fixture.committee.EXECUTOR_AGENT_ROLE()).to.equal(constants.EXECUTOR_AGENT_ROLE);
      });  

      it("2. state variable: blockProposal", async function () {
        expect(await fixture.committee.connect(initializer).blockProposal(0)).to.equal(eth.ZeroHash);
      });

      it("3. function: grantProposer()", async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        expect(await fixture.committee.isProposer(fixture.proposer1.address)).to.equal(true);
        expect(await fixture.committee.getProposerCount()).to.equal(2);
      });

      it("4. function: revokeProposer()", async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address);
        await fixture.committee.connect(fixture.admin).revokeProposer(fixture.proposer1.address);
        expect(await fixture.committee.isProposer(fixture.proposer1.address)).to.equal(false);
        expect(await fixture.committee.getProposerCount()).to.equal(1);
      });

      it("5. function: grantAgent()", async function () {
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer1.address);
        expect(await fixture.committee.isAgent(fixture.proposer1.address)).to.equal(true);
      });

      it("6. function: revokeAgent()", async function () {
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).revokeAgent(fixture.proposer1.address)
        expect(await fixture.committee.isAgent(fixture.proposer1.address)).to.equal(false);
      });

      it("7. function and event: propose()", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD))
              .to.emit(fixture.committee,"CommitteeProposalProposed")
              .withArgs(anyValue, fixture.proposer1.address, fixture.committee2.address, 1, currentBlock, anyValue);
      });

      it("8. function and event: vote()", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD);
        const proposalId = await fixture.committee.connect(fixture.proposer1).blockProposal(currentBlock);
        await mine(constants.VOTE_DELAY);
        await expect(fixture.committee.connect(fixture.committee1).vote(proposalId, true))
              .to.emit(fixture.committee,"CommitteeVoted")
              .withArgs(proposalId, fixture.committee1.address, true, anyValue);
      });

      it("9. function and event: execute() + accept", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD);
        const proposalId = await fixture.committee.connect(fixture.proposer1).blockProposal(currentBlock);
        await mine(constants.VOTE_DELAY);
        await fixture.committee.connect(fixture.committee1).vote(proposalId, true);
        await mine(constants.VOTE_PERIOD);
        await expect(fixture.committee.connect(fixture.proposer2).execute(currentBlock))
                  .to.emit(fixture.committee,"CommitteeProposalExecuted")
                  .withArgs( proposalId, constants.VOTE_TYPE_ADD, anyValue, anyValue);
      });

      it("10. function: execute() vote accept + add committee", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD);
        const proposalId = await fixture.committee.connect(fixture.proposer1).blockProposal(currentBlock);
        await mine(constants.VOTE_DELAY);
        await fixture.committee.connect(fixture.committee1).vote(proposalId, true);
        await mine(constants.VOTE_PERIOD);
        await fixture.committee.connect(fixture.proposer2).execute(currentBlock);
        expect(await fixture.committee.getCommitteeCount()).to.equal(2);  
        expect(await fixture.committee.isCommittee(fixture.committee2.address)).to.equal(true);  
      });

      it("11. function: execute() vote accept + remove committee", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee1.address, constants.VOTE_TYPE_REMOVE);
        const proposalId = await fixture.committee.connect(fixture.proposer1).blockProposal(currentBlock);
        await mine(constants.VOTE_DELAY);
        await fixture.committee.connect(fixture.committee1).vote(proposalId, true);
        await mine(constants.VOTE_PERIOD);
        await fixture.committee.connect(fixture.proposer2).execute(currentBlock);
        expect(await fixture.committee.getCommitteeCount()).to.equal(0);                    
      });

      it("12. function: execute() vote reject + add committee", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD);
        const proposalId = await fixture.committee.connect(fixture.proposer1).blockProposal(currentBlock);
        await mine(constants.VOTE_DELAY);
        await fixture.committee.connect(fixture.committee1).vote(proposalId, false);
        await mine(constants.VOTE_PERIOD);
        await fixture.committee.connect(fixture.proposer2).execute(currentBlock);
        expect(await fixture.committee.getCommitteeCount()).to.equal(1);                    
      });

      it("13. function and event: execute() + reject", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.admin).grantAgent(fixture.proposer2.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD);
        const proposalId = await fixture.committee.connect(fixture.proposer1).blockProposal(currentBlock);
        await mine(constants.VOTE_DELAY);
        await fixture.committee.connect(fixture.committee1).vote(proposalId, false);
        await mine(constants.VOTE_PERIOD);
        await expect(fixture.committee.connect(fixture.proposer2).execute(currentBlock))
                  .to.emit(fixture.committee,"CommitteeProposalRejected")
                  .withArgs( proposalId, constants.VOTE_TYPE_ADD, anyValue, anyValue);
      });

      it("14. revert intialized: onlyInitializer can call", async function () {
        await expect(fixture.committee.connect(fixture.admin).initialize(
          constants.VOTE_DELAY,
          constants.VOTE_PERIOD,
          constants.PROPOSE_PERIOD,
          [fixture.committee1.address], 
          fixture.admin.address)).to.revertedWith(revertedMessage.initializer_only_can_call)
      });

      it("15. revert: grantProposer() + grant exist proposer address", async function () {
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address))
        .to.revertedWith("committee: grant exist proposer address");
      })

      it("16. revert: grantProposer() + onlyAdmin can call", async function () {
        await expect(fixture.committee.connect(fixture.committee1).grantProposer(fixture.proposer1.address))
        .to.revertedWith(revertedMessage.committee_only_admin_can_call);
      })

      it("17. revert: revokeProposer() + onlyAdmin can call", async function () {
        await expect(fixture.committee.connect(fixture.committee1).revokeProposer(fixture.proposer1.address))
          .to.revertedWith(revertedMessage.committee_only_admin_can_call);
      })

      it("18. revert: revokeProposer() + revoke non proposer address", async function () {
        await expect(fixture.committee.connect(fixture.admin).revokeProposer(fixture.committee2.address))
          .to.revertedWith("committee: revoke non proposer address");
      })

      it("19. revert: propose() + onlyProposer can call", async function () {
        await expect(fixture.committee.connect(fixture.proposer1).propose(1, fixture.committee2.address, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_only_proposer_can_call);
      })

      it("20. revert: propose() + propose past block", async function () {
        const currentBlock = await ethers.provider.getBlockNumber();
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_past_block);
      })

      it("21. revert: propose() + propose zero address", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, constants.ZERO_ADDRESS, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_zero_address);
      })

      it("22. revert: propose() + invalid blocknumber", async function () {
        const currentBlock = await targetBlock();
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock - BigInt(10), fixture.committee2.address, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_invalid_block);
      })

      it("23. revert: propose() + propose add existing committee", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee1.address, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_add_exist_address);
      })

      it("24. revert: propose() + propose remove not exist committee", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_REMOVE))
          .to.revertedWith(revertedMessage.committee_propose_remove_non_exist_address);
      })

      it("25. revert: propose() + propose blocknumber has propose", async function () {
        const currentBlock = await targetBlock() + BigInt(100);
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD);
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_to_exist_block);
      })

      it("26. revert: propose() + propose block too future", async function () {
        const currentBlock = await targetBlock() + constants.EXCEED_UINT16;
        await fixture.committee.connect(fixture.admin).grantProposer(fixture.proposer1.address)
        await expect(fixture.committee.connect(fixture.proposer1).propose(currentBlock, fixture.committee2.address, constants.VOTE_TYPE_ADD))
          .to.revertedWith(revertedMessage.committee_propose_too_future);
      })

      it("27. revert: getProposal + proposal not exist", async function () {
        await expect(fixture.committee.getProposalCommitteeInfoByBlockNumber(0))
          .to.revertedWith(revertedMessage.committee_proposal_not_exist);
        await expect(fixture.committee.getProposalCommitteeInfoByProposalId(eth.ZeroHash))
          .to.revertedWith(revertedMessage.committee_proposal_not_exist);
      }); 
  });
});
