// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract SupplyControl is Proposal {

    enum ProposalType { SUB, ADD }

    struct ProposalSupplyInfo {
        address proposer;
        address recipient;
        uint256 amount;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    bool private _init;
    address private _systemContract;
    ICommittee private _commiteeContract;

    event SupplyMintProposalProposed(
        bytes32 indexed proposalId, 
        address indexed proposer, 
        address indexed recipient, 
        uint256 amount, 
        uint256 targetBlock, 
        uint256 time);

    event SupplyMintVoted(bytes32 indexed proposalId, address indexed voter, bool auth, uint256 time);
    event SupplyMintProposalExecuted(bytes32 proposalId, address indexed account, uint256 amount, uint256 time);
    event SupplyMintProposalRejected(bytes32 proposalId, address indexed account, uint256 amount, uint256 time);

    mapping(bytes32 => ProposalSupplyInfo) private _supplyProposals; 
    mapping(uint256 => bytes32) public blockProposal;

    modifier onlySystemAddress() {
        require(msg.sender == _systemContract);
        _;
    }

    modifier onlyProposer() {
        require(_commiteeContract.isProposer(msg.sender));
        _;
    }

    function initialize (
        uint256 voteDelay_,
        uint256 votePeriod_,
        address systemContract_,
        ICommittee commiteeContractAddress_
    ) external  {
        require(!_init,"");
        _systemContract = systemContract_;
        _commiteeContract = commiteeContractAddress_;
        _setDelay(voteDelay_);
        _setPeriod(votePeriod_);
        _init = true;
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalSupplyInfo memory) {
        ProposalSupplyInfo memory data = _supplyProposals[proposalId];
        require(data.blockNumber != 0,"supplycontrol:");
        return data;
    }

    function getProposalSupplyInfoByProposalId(bytes32 proposalId) public view returns (ProposalSupplyInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalSupplyInfoByBlockNumber(uint256 blockNumber) public view returns (ProposalSupplyInfo memory) {
        return _getProposal(blockProposal[blockNumber]);
    }

    function propose(
        uint256 blockNumber,
        uint256 amount,
        address account,
        ProposalType proposeType
    ) public onlyProposer returns(uint256) {
        uint256 current = block.number;
        require(amount > 0, "supplycontrol:");
        require(current < blockNumber, "supplycontrol:");
        require(account != address(0), "supplycontrol:");
        require((current + votingPeriod()) < blockNumber,"supplycontrol:");
        require(blockProposal[blockNumber] != 0,"supplycontrol:");

        bytes32 proposalId = keccak256(abi.encode(msg.sender, account, amount, blockNumber));

        blockProposal[blockNumber] = proposalId;
        _supplyProposals[proposalId].proposer = msg.sender;
        _supplyProposals[proposalId].recipient = account;
        _supplyProposals[proposalId].amount = amount;
        _supplyProposals[proposalId].blockNumber = blockNumber;
        _supplyProposals[proposalId].proposeType = proposeType;

        _proposal(proposalId, uint16(_commiteeContract.getCommitteeCount()));
        emit SupplyMintProposalProposed(proposalId, msg.sender, account, amount, blockNumber, block.timestamp);

        return blockNumber;
    }

    function execute(uint256 blockNumber) public override returns (uint256) {
        _execute(blockProposal[blockNumber]);
        return blockNumber;
    }
}