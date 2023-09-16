import {
  loadFixture,
  setBalance,
  time,
  mine
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { COMMITEE_ROLE, PROPOSER_ROLE, ROOT_ADMIN_ROLE, SYSTEM_CALLER, VOTE_AGREE , VOTE_DIAGREE, } from "./utils/constanst"

describe("Supply Control System Contract", function () {
  async function deployContractFixture() {
    // Contracts are deployed using the first signer/account by default
    const [admin, committee1, committee2, committee3, proposer1 , proposer2 , otherAccount] = await ethers.getSigners();
    
    const systemCallerSigner = await ethers.getImpersonatedSigner(SYSTEM_CALLER);
    await setBalance(SYSTEM_CALLER, 100n ** 18n);
    const Committee = await ethers.getContractFactory("Committee");
    const SupplyControl = await ethers.getContractFactory("SupplyControl");
    const committee = await Committee.deploy();
    const init = await committee.connect(systemCallerSigner).initialize([committee1.address, committee2.address], admin.address, 0, 240);
    const suppylcontrol = await SupplyControl.deploy();

    return {
      admin,
      committee,
      committee1,
      committee2,
      committee3,
      proposer1,
      proposer2,
      otherAccount,
      suppylcontrol,
      systemCallerSigner,
      init
    }
  }

  describe("Unit test", function () {
    it("function: ROOT_ADMIN_ROLE()", async function () {
      const { committee, init } = await loadFixture(deployContractFixture);
      init;
      expect(await committee.getCommitteeCount()).to.equal(2);
    });

    
  });
});