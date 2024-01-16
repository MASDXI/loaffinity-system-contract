// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interfaces/ITransactionFeeDistributor.sol";

contract TransactionFeeDistributor is ITransactionFeeDistributor {

    mapping(address => address) private _registry;

    address private _treasury;

    event Ex

    function submitTxGasUsed(uint256 gasUsed, uint256 gasPrice) external returns (bool) {
        address cache = _registry[msg.sender];
        if (cache != address(0)) {
            payable(cache).transfer(calculate(gasUsed, gasPrice));
            emit 
        } else {
            payable(_treasury).transfer(calculate(gasUsed, gasPrice));
            emit
        }
    }

    function calculate(uint256 gasUsed, uint256 gasPrice) public view returns (uint256) {
        // TODO adding more advance logic here.
        return gasUsed * gasPrice;
    }

    function onboardMerchant(address merchant) external returns (bool) {
        // TODO provisioning role.
        _registry[merchant] = msg.sender;
        return true;
    }

    function offboardMerchant(address merchant) external returns (bool) {
        // TODO provisioning role.
        delete _registry[merchant];
        return true;
    }

}