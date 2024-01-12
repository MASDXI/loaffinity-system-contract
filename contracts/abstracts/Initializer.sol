// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Initializer {

    bool private _init = false;

    event Initialized();
    
    address private constant _initializer = 0x32D5a21376C0dF3F98200a00380b06adeE341B91;

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