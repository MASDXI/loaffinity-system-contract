import { ZeroAddress, ethers } from "ethers"


const constants = { 
    // Initializer address
    "INITIALIZER_ADDRESS": process.env.INITIALIZER_ADDRESS ? 
    ethers.getAddress(process.env.INITIALIZER_ADDRESS) : ZeroAddress,
    // Pre-load Contract addresses
    "COMMITTEE_CONTRACT_ADDRESS":  "0x0000000000000000000000000000000000000776",
    "TREASURY_CONTRACT_ADDRESS": "0x0000000000000000000000000000000000000777",
    "GASPRICE_ORACLE_PROXY_CONTRACT_ADDRESS": "0x0000000000000000000000000000000000000778",
    "SERVICE_PROVIER_PROXY_CONTRACT_ADDRESS": "0x0000000000000000000000000000000000000779",
    "DISTRIBUTOR_CONTRACT_ADDRESS": "0x0000000000000000000000000000000000000780",
    "RELEASE_TARGET_ADDESS": "0x000000000000000000000000000000000000DEAD",
    // Ether amounts
    "ONE_TRILLION_TOKEN": ethers.parseEther("1000000000000"),
    "ONE_MILLION_TOKEN": ethers.parseEther("1000000"),
    "ONE_HUNDRED_TOKEN": ethers.parseEther("100"),
    "ONE_TOKEN": ethers.parseEther("1"),
    "ZERO_TOKEN": ethers.parseEther("0"),
    // Types
    "EXCEED_UINT8": 256n,
    "EXCEED_UINT16": 65536n,
    "EXCEED_UINT32": 4294967296n,
    "EXCEED_UINT256": 115792089237316195423570985008687907853269984665640564039457584007913129639936n,
    // Enum Status
    "PROPOSAL_STATUS_DEFAULT": 0,
    "PROPOSAL_STATUS_PENDING": 1,
    "PROPOSAL_STATUS_EXECUTE": 2,
    "PROPOSAL_STATUS_REJECT": 3,
    "PROPOSAL_STATUS_CANCEL": 4,
    // General Constant Value
    "ZERO": 0n,
    // Parameters
    "VOTE_DELAY": 10n,
    "VOTE_PERIOD": 240n,
    "VOTE_THREADSHOLD_EXCEED": 101n,
    "VOTE_THREADSHOLD": 75n,
    "PROPOSE_PERIOD_EXCEED": 4294967296n,
    "PROPOSE_PERIOD": 50n,
    "EXECUTE_RETENTION_PERIOD": 25n,
    "VOTE_TYPE_REMOVE": 0,
    "VOTE_TYPE_ADD": 1,
    "VOTE_AGREE": true,
    "VOTE_DIAGREE": false,
    // Role Based Access Control
    "ROOT_ADMIN_ROLE": "0x77ccc78fff97648b6361d5a6f0bd0a9f7c43fd29c1369941d3474c71311418fc",
    "PROPOSER_ROLE": "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1",
    "CONSORTIUM_COMMITTEE_ROLE": "0xd8725ad0546b527f07ff9abf58639cd7f503a88de7b6b734a0035c5b0cb513cd",
    "EXECUTOR_AGENT_ROLE": "0xc134067449ddffbed769e2d3e5df17c9e61b02187dc779624a59c82dd6325496",
    "GASPRICE_CONFIG": {
        "V1": {
            "CARBON_EMISSION_COEFFICIENT": process.env.CARBON_EMISSION_COEFFICIENT ? 
                process.env.CARBON_EMISSION_COEFFICIENT : 1n,
            "CARBON_CAPTURE_COST": process.env.CARBON_CAPTURE_COST ?
                process.env.CARBON_CAPTURE_COST : 344000000n,
            "SUSTAINABILITIT_CHARGE_RATE": process.env.SUSTAINABILITIT_CHARGE_RATE ?
                process.env.SUSTAINABILITIT_CHARGE_RATE : 1n,
            "IDLE_POWER_CONSUMPTION": process.env.IDLE_POWER_CONSUMPTION ?
                process.env.IDLE_POWER_CONSUMPTION : 15748000000n,
            "NUMBER_OF_VALIDATOR": process.env.NUMBER_OF_VALIDATOR ?
                process.env.NUMBER_OF_VALIDATOR : 4n,
            "POWER_CONSUMPTION_PER_GAS": process.env.POWER_CONSUMPTION_PER_GAS ?
                process.env.POWER_CONSUMPTION_PER_GAS : 300n,
            "BLOCK_PERIOD": process.env.BLOCK_PERIOD ?
                process.env.BLOCK_PERIOD : 15n,
            "CONSTANT": process.env.CONSTANT ?
                process.env.CONSTANT : 278n,
            "THRESHOLD": {
                "CONSORTIUM": process.env.BLOCK_PERIOD ?
                    process.env.BLOCK_PERIOD: 50n,
                "NODE_VALIDATOR": process.env.BLOCK_PERIOD ?
                    process.env.BLOCK_PERIOD: 25n,
                "MERCHANT": process.env.BLOCK_PERIOD ?
                    process.env.BLOCK_PERIOD: 25n,
                "MOBILE_VALIDATOR": process.env.BLOCK_PERIOD ? 
                    process.env.BLOCK_PERIOD: 0n
            }
        }
    }
}

export { constants };