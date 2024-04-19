// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Proxy.sol";

contract ProxyMock is Proxy {

    constructor (address target) Proxy(target) {}
    
}