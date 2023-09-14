// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ICommittee {
    function isCommittee(address account) external view returns(bool);
    function isProposer(address account) external view returns(bool);
    function getCommitteeCount() external view returns (uint256);
    function getProposerCount() external view returns (uint256);
}