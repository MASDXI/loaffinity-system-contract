// import {
//   loadFixture,
//   setBalance,
//   time,
//   mine
// } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { ethers as eth } from "ethers";
// import { constants } from "../utils/constants"
// import { setSystemContractFixture } from "../utils/systemContractFixture"

// describe("Committee System Contract", function () {
//   describe("Unit test", function () {
//     // ROLE
//     it("function: ROOT_ADMIN_ROLE()", async function () {
//       const { committee } = await loadFixture(setSystemContractFixture);
//       expect(await committee.ROOT_ADMIN_ROLE()).to.equal(constants.ROOT_ADMIN_ROLE);
//     });

//     it("function: CONSORTIUM_COMMITEE_ROLE()", async function () {
//       const { committee } = await loadFixture(setSystemContractFixture);
//       expect(await committee.CONSORTIUM_COMMITEE_ROLE()).to.equal(constants.CONSORTIUM_COMMITEE_ROLE);
//     });

//     it("function: PROPOSER_ROLE()", async function () {
//       const { committee } = await loadFixture(setSystemContractFixture);
//       expect(await committee.PROPOSER_ROLE()).to.equal(constants.PROPOSER_ROLE);
//     });

//     it("function: EXECUTOR_AGENT_ROLE()", async function () {
//       const { committee } = await loadFixture(setSystemContractFixture);
//       expect(await committee.EXECUTOR_AGENT_ROLE()).to.equal(constants.EXECUTOR_AGENT_ROLE);
//     });

//     it("function: intialized()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await expect(committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address)).to.emit(committee, "Initialized");
//     });

//     it("function: intialized()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await expect(committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address)).to.emit(committee, "Initialized");
//       await expect(committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address)).to.be.revertedWith("initializer: already init")
//     });

//     it("function: intialized() fail", async function () {
//       const { committee, committee1, admin} = await loadFixture(setSystemContractFixture);
//       await expect(committee.connect(admin).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address)).to.be.revertedWith("initializer: onlyInitializer can call")
//     });

//     it("function: IsCommittee()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       expect(await committee.isCommittee(committee1.address)).to.equal(true);
//     });

//     it("function: IsProposer()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       expect(await committee.isProposer(otherAccount.address)).to.equal(false);
//     });

//     it("function: getCommitteeCount()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       expect(await committee.getCommitteeCount()).to.equal(1);
//     });

//     it("function: getProposerCount()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       expect(await committee.getProposerCount()).to.equal(1);
//     });

//     it("function: blockProposal()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       const zeroByte = "0x2ef4c3419176f842a40b01462009a5b0b285c8b04c960a177b93a6d8935d4b79"
//       expect(await committee.connect(initializerCallerSigner).blockProposal(0)).to.equal(eth.ZeroHash)
//     });


//     it("function: getProposalCommitteeInfoByBlockNumber()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.getProposalCommitteeInfoByBlockNumber(0)).to.be.revertedWith('committee: proposal not exist');
//     });

//     it("function: getProposalCommitteeInfoByProposalId()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.getProposalCommitteeInfoByProposalId(eth.ZeroHash)).to.be.revertedWith('committee: proposal not exist');
//     });

//     it("function: votingDeley()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       expect(await committee.votingDeley()).to.equal(0)
//     });

//     it("function: votingDeley()", async function () {
//       const { committee, committee1, admin, otherAccount, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       expect(await committee.votingPeriod()).to.equal(constants.VOTE_PERIOD)
//     });

//     it("function: grantProposer()", async function () {
//       const { committee, committee1, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address)
//       expect(await committee.isProposer(proposer1.address)).to.equal(true);
//     });

//     it("function: grantProposer()", async function () {
//       const { committee, committee1, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.connect(committee1).grantProposer(proposer1.address)).to.be.revertedWith("committee: onlyAdmin can call")
//     });

//     it("function: revokeProposer()", async function () {
//       const { committee, committee1, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address)
//       await committee.connect(admin).revokeProposer(proposer1.address)
//       expect(await committee.isProposer(proposer1.address)).to.equal(false);
//     });

//     it("function: revokeProposer() fail", async function () {
//       const { committee, committee1, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address)
//       await expect(committee.connect(committee1).revokeProposer(proposer1.address)).to.be.revertedWith("committee: onlyAdmin can call")
//     });


//     it("function: grantProposer()", async function () {
//       const { committee, committee1, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address)
//       await expect(committee.connect(admin).grantProposer(proposer1.address)).to.be.revertedWith("committee: grant exist proposer address");
//     });

//     it("function: revokeProposer()", async function () {
//       const { committee, committee1, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.connect(admin).revokeProposer(proposer1.address)).to.be.revertedWith("committee: revoke non proposer address");
//     });

//     it("function: propose() grant", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.connect(proposer1).propose(300, committee2.address, 1)).to.be.revertedWith("committee: onlyProposer can call")
//     });

//     it("function: propose() grant", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       const proposalId = "0x05bff83ca32a69707094163eca3174eb2ae9a7a1394ce6c79b690e4c7256e1bb"
//       await time.setNextBlockTimestamp(10953791915);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       const period = await committee.proposePeriod();
//       await time.setNextBlockTimestamp(10953791920);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await time.setNextBlockTimestamp(10953791925);
//       await mine(period);
//       await expect(committee.connect(proposer1).propose(300, committee2.address, 1))
//         .to.emit(committee,"CommitteeProposalProposed")
//         .withArgs(proposalId,proposer1.address,committee2.address,1,300,10953791975);
//     });

//     it("function: propose() revoke", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       const proposalId = "0x2ef4c3419176f842a40b01462009a5b0b285c8b04c960a177b93a6d8935d4b79"
//       await time.setNextBlockTimestamp(10953791915);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await time.setNextBlockTimestamp(10953791920);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await time.setNextBlockTimestamp(10953791925);
//       await expect(committee.connect(proposer1).propose(300, committee1.address, 0))
//         .to.emit(committee,"CommitteeProposalProposed")
//         .withArgs(proposalId,proposer1.address,committee1.address,0,300,10953791925);
//       const object = await committee.getProposalCommitteeInfoByBlockNumber(300);
//       // console.log("🚀 ~ file: Committee.test.ts:175 ~ object:", object)
//       const ret = await committee.getProposalCommitteeInfoByProposalId(proposalId);
//       expect(ret.proposer).to.equal(proposer1.address);
//       expect(ret.commitee).to.be.equal(committee1.address);
//       expect(ret.blockNumber).to.be.equal(300);
//     });

//     it("function: propose()", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await committee.connect(proposer1).propose(300, committee2.address, 1);
//       await expect(committee.connect(proposer1).propose(300, committee2.address, 1)).to.be.revertedWith('proposal: proposalId already exists')
//     });

    
//     it("function: propose()", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await expect(committee.connect(proposer1).propose(300, committee1.address, 1)).to.be.revertedWith('committee: propose add existing committee')
//     });

//     it("function: propose()", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await expect(committee.connect(proposer1).propose(300, committee2.address, 0)).to.be.revertedWith('committee: propose remove not exist commitee')
//     });

//     it("function: propose()", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await expect(committee.connect(proposer1).propose(300, eth.ZeroAddress, 1)).to.be.revertedWith('committee: propose zero address')
//     });

//     it("function: propose()", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await expect(committee.connect(proposer1).propose(230, committee2.address, 1)).to.be.revertedWith('committee: invalid blocknumber')
//     });

//     it("function: propose()", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       const blockNumber = await time.latestBlock()
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await expect(committee.connect(proposer1).propose(blockNumber, committee2.address, 1)).to.be.revertedWith('committee: propose past block')
//     });

//     it("function: execute() fail", async function () {
//       const { committee, committee1, committee2, committee3, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       const proposalId = "0x26df81e4aebbec78c7825df3fac06a912b2f56b1fa39d84a6ddbed3b06069088"
//       await time.setNextBlockTimestamp(10953791915);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address, committee2.address], admin.address);
//       await time.setNextBlockTimestamp(10953791920);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await time.setNextBlockTimestamp(10953791925);
//       await expect(committee.connect(proposer1).propose(300, committee3.address, 1))
//         .to.emit(committee,"CommitteeProposalProposed")
//         .withArgs(proposalId,proposer1.address,committee3.address,1,300,10953791925);
//       expect(await committee.connect(initializerCallerSigner).execute(300));
//       expect(await committee.isCommittee(committee3.address)).to.equal(false);
//     });

//     it("function: execute() fail not exist", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.connect(initializerCallerSigner).execute(300)).to.be.revertedWith("committee: proposal not exist");
//     });

//     it("function: execute() fail not system address", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner} = await loadFixture(setSystemContractFixture);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address], admin.address);
//       await expect(committee.connect(admin).execute(300)).to.be.revertedWith("initializer: onlyInitializer can call");
//     });

//     it("function: execute() success", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner, otherAccount} = await loadFixture(setSystemContractFixture);
//       const proposalId = "0x6d6fa43b66cd017595511990ce9c1237df71e4aed1c912277664a5a492a0821a"
//       await time.setNextBlockTimestamp(10953791915);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address, committee2.address], admin.address);
//       await time.setNextBlockTimestamp(10953791920);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await time.setNextBlockTimestamp(10953791925);
//       await expect(committee.connect(proposer1).propose(300, otherAccount.address, 1))
//         .to.emit(committee,"CommitteeProposalProposed")
//         .withArgs(proposalId,proposer1.address,otherAccount.address,1,300,10953791925);
//       await committee.connect(committee1).vote(proposalID, constants.PROPOSE_PERIOD, true);
//       await committee.connect(committee2).vote(proposalID, constants.PROPOSE_PERIOD, true);
//       expect(await committee.connect(initializerCallerSigner).execute(300));
//       expect(await committee.isCommittee(otherAccount.address)).to.equal(true);
//     });

//     it("function: execute() success", async function () {
//       const { committee, committee1, committee2, admin, proposer1, initializerCallerSigner, otherAccount} = await loadFixture(setSystemContractFixture);
//       const proposalId = "0xa927f87d6cbb3c2ce8df3beee1a1ee4419bdf68af04626e0f126885c8e79a489"
//       await time.setNextBlockTimestamp(10953791915);
//       await committee.connect(initializerCallerSigner).initialize(constants.ZERO, constants.VOTE_PERIOD, constants.PROPOSE_PERIOD, [committee1.address, committee2.address], admin.address);
//       await time.setNextBlockTimestamp(10953791920);
//       await committee.connect(admin).grantProposer(proposer1.address);
//       await time.setNextBlockTimestamp(10953791925);
//       await expect(committee.connect(proposer1).propose(300, committee2.address, 0))
//         .to.emit(committee,"CommitteeProposalProposed")
//         .withArgs(proposalId,proposer1.address,committee2.address,0,300,10953791925);
//       await committee.connect(committee1).vote(proposalID, constants.PROPOSE_PERIOD, true);
//       await committee.connect(committee2).vote(proposalID, constants.PROPOSE_PERIOD, true);
//       expect(await committee.connect(initializerCallerSigner).execute(300));
//       expect(await committee.isCommittee(committee2.address)).to.equal(false);
//       expect(await committee.connect(initializerCallerSigner).blockProposal(300)).to.equal(proposalId)
//     });
//   });
// });
