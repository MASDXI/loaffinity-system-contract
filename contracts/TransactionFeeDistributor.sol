// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interfaces/ITransactionFeeDistributor.sol";

contract TransactionFeeDistributor is ITransactionFeeDistributor {

    mapping(address => address) private _registry;

    address private _treasury;

    event Transfer(address indexed account, uint256 amount);

    uint8 private _percentage = 100;

    error TransferFailed();

    /**
     * @param gasUsed gasUsed of transaction.
     * @param gasPrice gasPrice of tranaction.
     */
    function submitTxGasUsed(uint256 gasUsed, uint256 gasPrice) external {
        address addressCache = _registry[msg.sender];
        uint256 amount = calculate(gasUsed, gasPrice);
        if (amount != 0) {
            if (addressCache != address(0)) {
                _transfer(addressCache, amount);
            } else {
                _transfer(_treasury, amount);
            }
        } else {
            return;
        }
    }
     
    /**
     * @param account recipient address.
     * @param amount amount of native token.
     */
    function _transfer(address account, uint256 amount) private {
        (bool success, ) = payable(account).call{value: amount}("");
        if (success) {
            emit Transfer(account, amount);
        } else {
            revert TransferFailed();
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