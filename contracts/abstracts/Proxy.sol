// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Proxy {
    event ImpelementationContractUpdated(address targetAddress);

    address private _implementation;

    function _updateImpelemetation(address implementation) internal {
        address implemeationCache = _implementation;
        require(
            _implementation != implementation,
            "proxy: can't set same implemention"
        );
        _implementation = implementation;
        emit ImpelementationContractUpdated(_implementation, implementation);
    }

    function getImplemetation() public returns (address) {
        return _implementation;
    }

    function setImplementation(address implementation) public virtual {
        _updateImpelemetation(implementation);
    }
}
