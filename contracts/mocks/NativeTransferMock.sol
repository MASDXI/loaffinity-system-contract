// SPDX-License-Identifier: MIT
pragma solidity 0.8.17; 

import "../abstracts/NativeTransfer.sol";

contract NativeTransferMock is NativeTransfer{
    function transferEther(address account, uint256 amount) external {
        _transferEther(account,amount);
    }
}