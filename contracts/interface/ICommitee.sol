// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ICommittee {

    function isCommittee(address account) external view returns(bool);
    function isProposalCreator(address account) external view returns(bool);
}