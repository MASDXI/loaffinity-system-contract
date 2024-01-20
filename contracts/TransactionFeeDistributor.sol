// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/NativeTransfer.sol";
import "./interfaces/ITransactionFeeDistributor.sol";

contract TransactionFeeDistributor is ITransactionFeeDistributor,  NativeTransfer {

    mapping(address => address) private _registry;

    address private _treasury;

    uint8 private _percentage = 100;

    /**
     * @param gasUsed gasUsed of transaction.
     * @param gasPrice gasPrice of transaction.
     */
    function submitTxGasUsed(uint256 gasUsed, uint256 gasPrice) external {
        address addressCache = _registry[msg.sender];
        uint256 amount = calculate(gasUsed, gasPrice);
        if (amount != 0) {
            if (addressCache != address(0)) {
                _transferEther(addressCache, amount);
            } else {
                _transferEther(_treasury, amount);
            }
        } else {
            return;
        }
    }

    /**
     * @param gasUsed gasUsed of transaction.
     * @param gasPrice gasPrice of tranaction.
     * @return transactionCost cost of transaction
     * @notice constant 10 came from tranasction processor in core blockchain that deduct
     * 10 percent of each transaction fee to transaction fee distributor contract address.
     */ 
    function calculate(uint256 gasUsed, uint256 gasPrice) public view returns (uint256 transactionCost) {
        if (gasPrice != 0) {
            uint256 percentageAmount = ((gasUsed * gasPrice ) * 10 /** constant */) / 100;
            transactionCost = (percentageAmount * _percentage) / 100;
            return transactionCost;
        } else {
            return 0;
        }
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