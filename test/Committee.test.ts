import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

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
      await committee.initialize([otherAccount.address], owner.address);

      // expect(await committee.unlockTime()).to.equal(unlockTime);
    });
  });
});
