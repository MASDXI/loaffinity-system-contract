// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract NativeTransfer {
    error TransferZeroAmount();
    error TransferExceedBalance(uint256 amount, uint256 balance);

    event Transfer(address indexed account, uint256 amount);

    /**
     * @param account recipient address.
     * @param amount amount of native token.
     */
    function _transferEther(address account, uint256 amount) internal virtual {
        if (amount == 0) {
            revert TransferZeroAmount();
        } else {
            (bool success, ) = payable(account).call{value: amount}("");
            if (success) {
                emit Transfer(account, amount);
            } else {
                uint256 balanceCache = address(this).balance;
                revert TransferExceedBalance(amount, balanceCache);
            }
        }
    }
}
