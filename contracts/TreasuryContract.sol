// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/NativeTransfer.sol";
import "./abstracts/Proposal.sol";
import "./abstracts/Initializer.sol";
import "./interfaces/ICommittee.sol";
import "./interfaces/ITreasury.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract TreasuryContract is ITreasury ,Proposal, Initializer, NativeTransfer {

    uint256 private _lockedBalance;
    uint16 private constant MAX_FUTURE_BLOCK = type(uint16).max;
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

    /**
     * @notice initialize the contract instead of constructor.
     * @param voteDelay_ waiting period before proposal active
     * @param votePeriod_ active period of proposal
     * @param proposePeriod_ waiting period between propose
     * @param commiteeContractAddress_ committee contract address
     */
    function initialize (
        uint256 voteDelay_,
        uint256 votePeriod_,
        uint32 proposePeriod_,
        ICommittee commiteeContractAddress_
    ) external onlyInitializer {
        _initialized();
        _commiteeContract = commiteeContractAddress_;
        _setVoteDelay(voteDelay_);
        _setVotePeriod(votePeriod_);
        _setVoteThreshold(75);
        _setProposePeriod(proposePeriod_);
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

    function getLockedBalance() public view returns (uint256){
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
        require(blockNumber - current <= MAX_FUTURE_BLOCK,"treasury: block too future");
        require(blockProposal[blockNumber] == bytes32(0),"treasury: blocknumber has propose");
        require(current < blockNumber, "treasury: propose past block");
        require((current + votingPeriod()) < blockNumber,"treasury: invalid blocknumber");
        if (proposeType == ProposalType.RELEASED) {
            require(account != address(0), "treasury: propose released to zero address");
        } else {
            require(account == address(0), "treasury: propose locked to non-zero address");
        }

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

    function execute(uint256 blockNumber) public payable onlyAgent returns (uint256) {
        ProposalSupplyInfo memory data = getProposalSupplyInfoByBlockNumber(blockNumber);
        bytes32 IdCache = blockProposal[blockNumber];
        (bool callback) = _execute(IdCache);
        uint256 timeCache = block.timestamp;
        if (callback) {
            if (data.proposeType == ProposalType.RELEASED) {
                _transferEther(data.recipient, data.amount);
                emit TreasuryProposalExecuted(IdCache, ProposalType.RELEASED, data.recipient, data.amount, timeCache);
            } else {
                _transferEther(address(0), data.amount);
                emit TreasuryProposalExecuted(IdCache, ProposalType.LOCKED, data.recipient, data.amount, timeCache);
            }
        } else {
            emit TreasuryProposalRejected(IdCache, data.proposeType, data.recipient, data.amount, timeCache);
        }
        _lockedBalance -= data.amount;
        return blockNumber;
    }

    function vote(bytes32 proposalId, bool auth) external override onlyCommittee {
        _vote(proposalId, auth);
        emit TreasuryVoted(proposalId, msg.sender, auth, block.timestamp);
    }
}