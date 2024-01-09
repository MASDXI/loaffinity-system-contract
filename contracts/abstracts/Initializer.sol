// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Initializer {

    bool private _init = false;

    event Initialized();
    
    address private constant _initializer = 0x0000000000000000000000000000000000000080;

    modifier onlyInitializer() {
        require(msg.sender == _initializer,"initializer: onlyInitializer can call");
        _;
    }

    function _initialized() internal {
        require(!_init, "initializer: already init");
        _init = true;
        emit Initialized();
    }
}