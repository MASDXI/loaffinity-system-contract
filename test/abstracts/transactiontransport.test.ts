import { expect } from "chai";
import { ethers } from "hardhat";
import { setUp } from "../utils/systemContractFixture";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";


describe("Abstract TransactionTransport Contract", function () {
    // TODO change type any to specific type
    let fixture: any;
    let initializer: HardhatEthersSigner;

    beforeEach(async function () {
        // fixture = await setUp("TransactionTransportMock", txDistributorAddree);
    });

    describe("TransactionTransportMock Contract", function () {
        it("TransactionTransportMock: ", async function () {
          
        });
    });
});