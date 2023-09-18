// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract SystemCaller {

    address private constant _systemContract = 0x0000000000000000000000000000000000000F69;

    modifier onlySystemAddress() {
        require(msg.sender == _systemContract,"systemcaller: onlySystemAddress can call");
        _;
    }

}