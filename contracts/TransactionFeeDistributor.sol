// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interfaces/ITransactionFeeDistributor.sol";

contract TransactionFeeDistributor is ITransactionFeeDistributor {

    mapping(address => address) private _registry;

    address private _treasury;

    event Transfer(address indexed account, uint256 amount);

    uint8 private _percentage = 100;

    /**
     * @param gasUsed
     * @param gasPrice
     */
    function submitTxGasUsed(uint256 gasUsed, uint256 gasPrice) external returns (bool) {
        address cache = _registry[msg.sender];
        uint256 amount = calculate(gasUsed, gasPrice);
        // TODO consider to change to .call instead?
        if (cache != address(0)) {
            payable(cache).transfer(amount);
            emit Transfer(cache, amount);
        } else {
            payable(_treasury).transfer(amount);
            emit Transfer(_treasury, amount);
        }
    }

    /**
     * @param gasUsed
     * @param gasPrice
     * @notice constant 10 came from tranasction processor in core blockchain that deduct
     * 10 percent of each transaction fee to transaction fee distributor contract address.
     */ 
    function calculate(uint256 gasUsed, uint256 gasPrice) public view returns (uint256) {
        uint256 percentageAmount = ((gasUsed * gasPrice ) * 10 /** constant */) / 100;
        uint256 transactionFee = (percentageAmount * _percentage) / 100;
        return transactionFee;
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