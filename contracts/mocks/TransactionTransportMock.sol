// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/TransactionTransport.sol";
import "../interfaces/ITransactionFeeDistributor.sol";

contract TransactioTransportMock is TransactionTransport {
    uint256 number;

    constructor(ITransactionFeeDistributor _new) {
        _setTxFeeDistributor(_new);
    }

    function set(uint256 value) public calculatorGasUsed {
        number = value;
    }
}
