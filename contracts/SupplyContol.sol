// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./abstracts/SystemAddress.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract SupplyControl is Proposal, SystemCaller {

    enum ProposalType { SUB, ADD }

    struct ProposalSupplyInfo {
        address proposer;
        address recipient;
        uint256 amount;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    event SupplyMintProposalProposed(
        bytes32 indexed proposalId, 
        address indexed proposer, 
        address indexed recipient, 
        ProposalType proposalType,
        uint256 amount, 
        uint256 targetBlock, 
        uint256 time);

    event SupplyMintVoted(bytes32 indexed proposalId, address indexed voter, bool auth, uint256 time);
    event SupplyMintProposalExecuted(bytes32 proposalId, ProposalType proposalType, address indexed account, uint256 amount, uint256 time);
    event SupplyMintProposalRejected(bytes32 proposalId, ProposalType proposalType, address indexed account, uint256 amount, uint256 time);

    bool private _init;
    ICommittee private _commiteeContract;
    mapping(bytes32 => ProposalSupplyInfo) private _supplyProposals; 
    mapping(uint256 => bytes32) public blockProposal;

    modifier onlyProposer() {
        require(_commiteeContract.isProposer(msg.sender));
        _;
    }

    modifier onlyCommittee() {
        require(_commiteeContract.isCommittee(msg.sender));
        _;
    }

    function initialize (
        uint256 voteDelay_,
        uint256 votePeriod_,
        ICommittee commiteeContractAddress_
    ) external onlySystemAddress {
        require(!_init,"supplycontrol: already init");
        _commiteeContract = commiteeContractAddress_;
        _setDelay(voteDelay_);
        _setPeriod(votePeriod_);
        _setThreshold(75);
        _init = true;
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalSupplyInfo memory) {
        ProposalSupplyInfo memory data = _supplyProposals[proposalId];
        require(data.blockNumber != 0,"supplycontrol: proposal not exist");
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
        require(amount > 0, "supplycontrol: invalid amount");
        require(current < blockNumber, "supplycontrol: propose past block");
        require(account != address(0), "supplycontrol: propose zero address");
        require((current + votingPeriod()) < blockNumber,"supplycontrol: invalid blocknumber");
        require(blockProposal[blockNumber] == bytes32(0),"supplycontrol: blocknumber has propose");

        bytes32 proposalId = keccak256(abi.encode(msg.sender, account, amount, blockNumber));

        blockProposal[blockNumber] = proposalId;
        _supplyProposals[proposalId].proposer = msg.sender;
        _supplyProposals[proposalId].recipient = account;
        _supplyProposals[proposalId].amount = amount;
        _supplyProposals[proposalId].blockNumber = blockNumber;
        _supplyProposals[proposalId].proposeType = proposeType;

        _proposal(proposalId, uint16(_commiteeContract.getCommitteeCount()));
        emit SupplyMintProposalProposed(proposalId, msg.sender, account, proposeType, amount, blockNumber, block.timestamp);

        return blockNumber;
    }

    function execute(uint256 blockNumber) public override onlySystemAddress returns (uint256) {
        ProposalSupplyInfo memory data = getProposalSupplyInfoByBlockNumber(blockNumber);
        uint256 timeCache = block.timestamp;
        (bool callback) = _execute(blockProposal[blockNumber]);
        if (callback) {
            if (data.proposeType == ProposalType.ADD) {
                emit SupplyMintProposalExecuted(blockProposal[blockNumber], ProposalType.ADD, data.recipient, data.amount, timeCache);
            } else {
                emit SupplyMintProposalExecuted(blockProposal[blockNumber], ProposalType.SUB, data.recipient, data.amount, timeCache);
            }
        } else {
            emit SupplyMintProposalRejected(blockProposal[blockNumber], data.proposeType, data.recipient, data.amount, timeCache);
        }
        return blockNumber;
    }

    function vote(bytes32 proposalId, bool auth) external override onlyCommittee {
        _vote(proposalId, auth);
    }
}