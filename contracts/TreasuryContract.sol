// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Proposal.sol";
import "./abstracts/Initializer.sol";
import "./interfaces/ICommittee.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract TreasuryContract is Proposal, Initializer {

    enum ProposalType { LOCKED, RELEASED }

    struct ProposalSupplyInfo {
        address proposer;
        address recipient;
        uint256 amount;
        uint256 blockNumber;
        ProposalType proposeType;
    }

    event TreasuryProposalProposed(
        bytes32 indexed proposalId, 
        address indexed proposer, 
        address indexed recipient, 
        ProposalType proposalType,
        uint256 amount, 
        uint256 targetBlock, 
        uint256 time);

    event TreasuryVoted(bytes32 indexed proposalId, address indexed voter, bool auth, uint256 time);
    event TreasuryProposalExecuted(bytes32 proposalId, ProposalType proposalType, address indexed account, uint256 amount, uint256 time);
    event TreasuryProposalRejected(bytes32 proposalId, ProposalType proposalType, address indexed account, uint256 amount, uint256 time);

    bool private _init;
    uint256 private _lockedBalance;
    ICommittee private _commiteeContract;
    mapping(bytes32 => ProposalSupplyInfo) private _supplyProposals; 
    mapping(uint256 => bytes32) public blockProposal;

    // handle receive Ether
    receive() external payable {}

    modifier onlyProposer() {
        require(_commiteeContract.isProposer(msg.sender));
        _;
    }

    modifier onlyCommittee() {
        require(_commiteeContract.isCommittee(msg.sender));
        _;
    }

    modifier onlyAgent() {
        require(_commiteeContract.isAgent(msg.sender));
        _;
    }

    function initialize (
        uint256 voteDelay_,
        uint256 votePeriod_,
        ICommittee commiteeContractAddress_
    ) external onlyInitializer {
        require(!_init,"treasury: already init");
        _commiteeContract = commiteeContractAddress_;
        _setDelay(voteDelay_);
        _setPeriod(votePeriod_);
        _setThreshold(75);
        _init = true;
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalSupplyInfo memory) {
        ProposalSupplyInfo memory data = _supplyProposals[proposalId];
        require(data.blockNumber != 0,"treasury: proposal not exist");
        return data;
    }

    function getProposalSupplyInfoByProposalId(bytes32 proposalId) public view returns (ProposalSupplyInfo memory) {
        return _getProposal(proposalId);
    }

    function getProposalSupplyInfoByBlockNumber(uint256 blockNumber) public view returns (ProposalSupplyInfo memory) {
        return _getProposal(blockProposal[blockNumber]);
    }

    function getAvailableBalance() public view returns (uint256){
        return address(this).balance - _lockedBalance;
    }

    function getLockBalance() public view returns (uint256){
        return _lockedBalance;
    }

    function propose(
        uint256 blockNumber,
        uint256 amount,
        address account,
        ProposalType proposeType
    ) public onlyProposer returns(uint256) {
        uint256 current = block.number;
        require(amount > 0, "treasury: invalid amount");
        require(amount <= getAvailableBalance(),"treasury: amount exceed");
        require(current < blockNumber, "treasury: propose past block");
        if (proposeType == ProposalType.RELEASED) {
            require(account != address(0), "treasury: propose released to zero address");
        } else {
            require(account == address(0), "treasury: propose locked to non-zero address");
        }
        require((current + votingPeriod()) < blockNumber,"treasury: invalid blocknumber");
        require(blockProposal[blockNumber] == bytes32(0),"treasury: blocknumber has propose");

        _lockedBalance += amount;

        bytes32 proposalId = keccak256(abi.encode(msg.sender, account, amount, blockNumber));

        blockProposal[blockNumber] = proposalId;
        _supplyProposals[proposalId].proposer = msg.sender;
        _supplyProposals[proposalId].recipient = account;
        _supplyProposals[proposalId].amount = amount;
        _supplyProposals[proposalId].blockNumber = blockNumber;
        _supplyProposals[proposalId].proposeType = proposeType;

        _proposal(proposalId, uint16(_commiteeContract.getCommitteeCount()));
        emit TreasuryProposalProposed(proposalId, msg.sender, account, proposeType, amount, blockNumber, block.timestamp);

        return blockNumber;
    }

    function execute(uint256 blockNumber) public override payable onlyAgent returns (uint256) {
        ProposalSupplyInfo memory data = getProposalSupplyInfoByBlockNumber(blockNumber);
        uint256 timeCache = block.timestamp;
        (bool callback) = _execute(blockProposal[blockNumber]);
        if (callback) {
            if (data.proposeType == ProposalType.RELEASED) {
                payable(data.recipient).transfer(data.amount);
                emit TreasuryProposalExecuted(blockProposal[blockNumber], ProposalType.RELEASED, data.recipient, data.amount, timeCache);
            } else {
                payable(address(0)).transfer(data.amount);
                emit TreasuryProposalExecuted(blockProposal[blockNumber], ProposalType.LOCKED, data.recipient, data.amount, timeCache);
            }
        } else {
            emit TreasuryProposalRejected(blockProposal[blockNumber], data.proposeType, data.recipient, data.amount, timeCache);
        }
        _lockedBalance -= data.amount;
        return blockNumber;
    }

    function vote(bytes32 proposalId, bool auth) external override onlyCommittee {
        _vote(proposalId, auth);
    }
}