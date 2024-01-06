// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Initializer {
    
    address private constant _initializer = 0x0000000000000000000000000000000000000080;

    modifier onlyInitializer() {
        require(msg.sender == _initializer,"initializer: onlyInitializer can call");
        _;
    }

}