// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract IVotable {
    /**
     * @dev Proposal status which could be
     *   - OnGoing: proposal is running
     *   - Cancelled: proposal is cancelled
     */
    enum ProposalStatus {
        Pending,
        Active,
        Cancaled,
        Succeded,
        VotedOut,
        Executed
    }

    /**
     * @dev Emitted when proposal is created
     */
    event ProposalCreated(uint256 indexed proposalID);

    /**
     * @dev Emitted when proposal is executed
     */
    event ProposalExecuted(uint256 indexed proposalID);


    /**
     * @dev Emitted when proposal is cancelled
     */
    event ProposalCancalled(uint256 indexed proposalID);

    /**
     * @dev Emitted when vote is casted
     */
    event VoteCast(address indexed voter, uint256 proposalID, uint8 casted);

    /**
     * @dev proposal status
     */
    function status(uint256 proposalId) public view virtual returns (ProposalStatus);

    /**
     * @dev Deley before the proposal started
     */
    function votingDeley() public view virtual returns(uint256); //

    /**
     * @dev Voting period
     */
    function votingPeriod() public view virtual returns(uint256); // 

    /**
     * @dev Required votes
     */
    function quorum(uint256 timepoint) public view virtual returns (uint256); //

    /**
     * @dev Get voting weight
     */
    function getVotes(address account, uint256 timepoint) public view virtual returns (uint256);

    /**
     * @dev If already voted
     */
    function hasVoted(uint256 proposalId, address account) public view virtual returns (bool);

    /**
     * @dev Execute proposal
     */
    function execute(uint256 proposalId) public virtual returns (uint256); //

    /**
     * @dev To cast vote
     */
    function castVote(uint256 proposalId, uint8 support) public virtual returns (uint256);
}