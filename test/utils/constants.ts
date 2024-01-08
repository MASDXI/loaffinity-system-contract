import { ethers } from "ethers"
import { deployedBytecode as SupplyControlBin } from "../../artifacts/contracts/TreasuryContract.sol/TreasuryContract.json"
import { deployedBytecode as CommitteeBin } from "../../artifacts/contracts/Committee.sol/Committee.json"

const constants = { 
    "INITIALIZER_ADDRESS": "0x0000000000000000000000000000000000000080",
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
    "AGENT_ROLE": "",
    "ROOT_ADMIN_ROLE": "0x77ccc78fff97648b6361d5a6f0bd0a9f7c43fd29c1369941d3474c71311418fc",
    "PROPOSER_ROLE": "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1",
    "CONSORTIUM_COMMITEE_ROLE": "0x25a12cb23baa24013defe8906042396d313a59c84c79d8f5342b90fd1189a0c4",
    "EXECUTOR_AGENT_ROLE": "0xc134067449ddffbed769e2d3e5df17c9e61b02187dc779624a59c82dd6325496",
    "SUPPLY_CONTRACT_BIN": SupplyControlBin,
    "COMMITEE_CONTRACT_BIN": CommitteeBin,
}

export { constants };