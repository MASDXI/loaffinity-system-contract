// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interface/ICommitee.sol";
import "./Votable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract SupplyControl is Votable {
    
    error ProposalNotFound();

    struct ProposalInfo {
        address proposer;
        address recipient;
        uint256 amount;
        uint256 blockNumber;
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

    mapping(bytes32 => ProposalInfo) private _proposals; 
    mapping(uint256 => bytes32) public blockProposals;

    modifier onlySystemAddress() {
        require(msg.sender == _systemContract);
        _;
    }

    modifier onlyProposalCreator() {
        require(ICommittee.isProposalCreator(msg.sender));
        _;
    }

    function initialized (
        uint256 voteDelay_,
        uint256 votePeriod_,
        address systemContract_,
        ICommittee commiteeContractAddress_
    ) external  {
        require(!_init,"");
        _init = true;
        _systemContract = systemContract_;
        _commiteeContract = commiteeContractAddress_;
        _voteDelay = voteDelay_;
        _votePeriod = votePeriod_;
    }

    function _getProposal(bytes32 proposalId) private view returns (ProposalInfo memory) {
        ProposalInfo memory data = _proposals[proposalId];
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

    function propose(
        uint256 blockNumber,
        uint256 amount,
        address account
    ) public onlyProposalCreator returns(uint256) {
        require(_init,"require init");
        require(amount > 0, "");
        require(block.number < blockNumber, "");
        require(account != address(0), "");
        require((block.number + votingPeriod()) < blockNumber,"");

        // only one minting could execute in a block so we use it as an ID
        // uint256 proposalId = uint256(keccak256(abi.encodePacked(_block)));

        // proposal.block = _block;
        // proposal.amounts = _amounts;
        // proposal.scriptTypes = _scriptTypes;
        // proposal.scripts = _scripts;
        // _proposals[proposalId] = proposal;

        bytes32 proposalId = keccak256(abi.encode(msg.sender, account, amount, blockNumber));
        blockProposals[blockNumber] = proposalId;
        _proposals[proposalId] = ProposalInfo({proposer: msg.sender, receipient: account, amount: amount, blockNumber: blockNumber});

        _propose(proposalId);
        emit ProposalCreated(proposalId);
        emit SupplyMintProposalProposed(proposalId, msg.sender, account, amount, blockNumber, block.timestamp);

        return proposalId;
    }

    function votingDeley() public view virtual override returns(uint256) {
        return _voteDelay;
    }

    function votingPeriod() public view virtual override returns(uint256) {
        return _votePeriod;
    }

    function quorum(uint256 timepoint) public view virtual override returns (uint256) {
        // supper majority for supply control
        uint256 total = getManager().getTotalAdminOrGov(timepoint);
        return total * 2 / 3 + (total % 3 == 0 ? 0 : 1);
    }

    function _quorumReached(uint256 proposalId) internal view virtual override returns (bool) {
        ProposalMeta memory p = proposalMetas[proposalId];
        ProposalVote memory v = _proposalVotes[p.proposalID];

        uint256 _quorum = quorum(p.proposedAt);
        uint256 _total = getManager().getTotalAdminOrGov(p.proposedAt);

        return v.forVotes >= _quorum || (v.abstainVotes + v.againstVotes) > (_total - _quorum);
    }

    function _voteSucceeded(uint256 proposalId) internal view virtual override returns (bool) {
        ProposalMeta memory p = proposalMetas[proposalId];
        ProposalVote memory v = _proposalVotes[proposalId];

        // require supper majority for evaluate as success
        uint256 total = getManager().getTotalAdminOrGov(p.proposedAt);

        return v.forVotes >= total * 2 / 3 + (total % 3 == 0 ? 0 : 1);
    }

    function _execute(uint256 proposalId) internal virtual override returns (uint256) {
        ProposalDetail memory p = _proposals[proposalId];
        delete _proposals[proposalId]; // ? delete or not
        delete blockProposals[p.block]; // ? delete or not

        require(p.block > block.number, "proposal must be added before minting block");

        // Mint storage m = _mints[p.block];
        // m.proposalId = proposalId;
        // m.amounts = p.amounts;
        // m.scriptTypes = p.scriptTypes;
        // m.scripts = p.scripts;

        // emit SupplyMintProposalExecuted(p.block, p.amounts, p.scriptTypes, p.scripts);

        return proposalId;
    }

    function execute(uint256 proposalId) public override onlySystemAddress returns (uint256) {
        super.execute(proposalId);
        return proposalId;
    }
}