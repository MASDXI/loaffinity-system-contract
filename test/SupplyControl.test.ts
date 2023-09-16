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
import { constants } from "./utils/constanst"
import { setSystemContractFixture } from "./utils/systemContractFixture"

describe("Supply Control System Contract", function () {
  describe("Unit test", function () {
    it("function: ROOT_ADMIN_ROLE()", async function () {
      const { supplycontrol } = await loadFixture(setSystemContractFixture);
      console.log("🚀 ~ file: SupplyControl.test.ts:48 ~ supplycontrol:", supplycontrol)
      // initCommitee;
      expect(await supplycontrol.votingDeley()).to.equal(0);
      expect(await supplycontrol.votingPeriod()).to.equal(0);
    });

    // it("function: ROOT_ADMIN_ROLE()", async function () {
    //   const { suppylcontrol, initCommitee } = await loadFixture(deployContractFixture);
    //   initCommitee;
    //   // expect(await suppylcontrol.initialize()).to.equal(0);
    //   expect(await suppylcontrol.votingPeriod()).to.equal(0);
    // });

    
  });
});