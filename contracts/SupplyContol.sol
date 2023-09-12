// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
// TODO implement vote logic

contract SupplyControl is Initializable {
    
    error ProposalNotFound();

    struct ProposalInfo {
        address proposer;
        address recepient;
        uint256 amount;
        uint256 blockNumber;
    }

    bool private _init;
    uint256 private _votePeriod;
    address private _systemContract;

    event SupplyMintProposalProposed(
        bytes32 indexed proposalId, 
        address indexed proposer, 
        address indexed recepient, 
        uint256 amount, 
        uint256 targetBlock, 
        uint256 time);

    event SupplyMintVoted(bytes32 indexed proposalId, address indexed voter, bool auth, uint256 time);
    event SupplyMintProposalExecuted(bytes32 proposalId, address indexed account, uint256 amount, uint256 time);
    event SupplyMintProposalRejected(bytes32 proposalId, address indexed account, uint256 amount, uint256 time);

    // function getProposalInfoByProposalId(bytes32 proposalId) external returns (ProposalInfo memory);
    // function getProposalInfoByBlockNumber(uint256 block) external returns (ProposalInfo memory);

    mapping(bytes32 => ProposalInfo) public proposals; 
    mapping(uint256 => bytes32) public blockProposals;

    modifier onlySystemAddress() {
        require(msg.sender == systemContract_);
        _;
    }

    function initialized (
        uint256 votePeriod_,
        address systemContract_
    ) public initializer  {
        require(!_init,"");
        _init = true;
        _systemContract = systemContract_;
        _votePeriod = votePeriod_;
    }

    function createProposal(address recepient, uint256 amount, uint256 blockNumber) external returns (bool) {
        require(_init,"require init");
        require(amount > 0, "");
        require(block.number < blockNumber, "");
        require(recepient != address(0), "");
        require(blockNumber > (block.number + votePeriod),"");

        bytes32 proposalId = keccak256(abi.encode(msg.sender, recepient, amount, blockNumber));
        blockProposals[blockNumber] = proposalId;
        proposals[proposalId] = ProposalInfo({proposer: msg.sender, recepient: recepient, amount: amount, blockNumber: blockNumber});

        emit SupplyMintProposalProposed(proposalId, msg.sender, recepient, amount, blockNumber, block.timestamp);
        
        return true;
    }

    function vote() {
        // TODO require all admin to change vote status to pass.
    }

    function execute() {
        // TODO require only system address.
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalInfo memory) {
        ProposalInfo memory data = proposals[proposalId];
        if (data.proposer != address(0)) {
            return data;
        } else {
            revert ProposalNotFound();
        }
    }

    function getProposalInfoByProposalId(bytes32 proposalId) public view returns (ProposalInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalInfoByBlockNumber(uint256 blockNumber) public view returns (ProposalInfo memory) {
        return _getProposal(blockProposals[blockNumber]);
    }

}