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
    // @TODO change to custom error for gas optimization.
    // submitTxGasUsed likely to be call by every registered contract at least 1 function
    // in registered contract
    function submitTxGasUsed(uint256 gasUsed, uint256 gasPrice) external returns (bool) {
        address addressCache = _registry[msg.sender];
        uint256 amount = calculate(gasUsed, gasPrice);
        if (addressCache != address(0)) {
            (bool success, ) = payable(addressCache).call{value: amount}("");
            require(success, "Transfer transaction fee to address failed");
            emit Transfer(addressCache, amount);
        } else {
            (bool success, ) = payable(_treasury).call{value: amount}("");
            require(success, "Transfer transction fee to treasury failed");
            emit Transfer(_treasury, amount);
        }
    }

    /**
     * @param gasUsed
     * @param gasPrice
     * @notice constant 10 came from tranasction processor in core blockchain that deduct
     * 10 percent of each transaction fee to transaction fee distributor contract address.
     */ 
    /// @TODO handle case zero gas fee network if node validator set gas price to 0 or
    /// validator adding config piority_local_rpc and dump gas price to zero 
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