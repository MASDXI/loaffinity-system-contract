// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../interfaces/ITransactionFeeDistributor.sol" ;

abstract contract TransactionTransport {

    event TransportUpdated(ITransactionFeeDistributor distributor);

    // interface
    ITransactionFeeDistributor private _txfeedistributor;

    modifier calculatorGasUsed {
        // temporary caching gas used in execution
        uint256 gasCache = gasleft();
        _;
        gasCache = gasCache - gasleft();
        _txfeedistributor.submitTxGasUsed(gasCache, tx.gasprice);
    }

    function _setTxFeeDistributor(ITransactionFeeDistributor _new) external {
        require(_new != txfeedistributor(),"transaction: tx feedistributor already set");
        _txfeedistributor = _new;
        emit TransportUpdated(_new);
    }

    function txfeedistributor() public view returns (ITransactionFeeDistributor memory) {
        return _txfeedistributor;
    }
}