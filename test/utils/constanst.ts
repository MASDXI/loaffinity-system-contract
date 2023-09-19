import { ethers } from "ethers"
import { deployedBytecode as SupplyControlBin } from "../../artifacts/contracts/SupplyContol.sol/SupplyControl.json"
import { deployedBytecode as CommitteeBin } from "../../artifacts/contracts/Committee.sol/Committee.json"

const constants = { 
    "SYSTEM_CALLER": "0x0000000000000000000000000000000000000F69",
    "COMMITTEE_CONTRACT_ADDRESS": "0x0000000000000000000000000000000000000069",
    "SUPPLY_CONTRACT_ADDRESS": "0x0000000000000000000000000000000000000070",
    "ONE_TRILLION_TOKEN": ethers.parseEther("1000000000000"),
    "ONE_MILLION_TOKEN": ethers.parseEther("1000000"),
    "ONE_HUNDRED_TOKEN": ethers.parseEther("100"),
    "ONE_TOKEN": ethers.parseEther("1"),
    "ZERO_TOKEN": ethers.parseEther("0"),
    "VOTE_TYPE_REMOVE": 0,
    "VOTE_TYPE_ADD": 1,
    "VOTE_AGREE": true,
    "VOTE_DIAGREE": false,
    "ROOT_ADMIN_ROLE": "0x77ccc78fff97648b6361d5a6f0bd0a9f7c43fd29c1369941d3474c71311418fc",
    "PROPOSER_ROLE": "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1",
    "COMMITEE_ROLE": "0x08da096d11689a7c6ed04f3885d9296d355e262ee0f570fe692a8d9ec7ebd3c4",
    "SUPPLY_CONTRACT_BIN": SupplyControlBin,
    "COMMITEE_CONTRACT_BIN": CommitteeBin,
}

export { constants };
