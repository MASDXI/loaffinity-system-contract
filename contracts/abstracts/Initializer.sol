// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Initializer {

    bool private _init = false;

    event Initialized();
    
    address private constant _initializer = 0x0000000000000000000000000000000000000AeE;

    modifier onlyInitializer() {
        require(msg.sender == _initializer,"initializer: onlyInitializer can call");
        _;
    }

    function _initialized() internal {
        require(!isInit(),"initializer: already init");
        _init = true;
        emit Initialized();
    }

    function isInit() public view returns (bool) {
        return _init;
    }

    function isIntializer(address account) external pure returns (bool) {
        return account == _initializer;
    }
}