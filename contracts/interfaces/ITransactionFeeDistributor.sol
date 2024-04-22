// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface ITransactionFeeDistributor {
    function submitTxGasUsed(uint256 gasUsed, uint256 gasPrice) external;
}