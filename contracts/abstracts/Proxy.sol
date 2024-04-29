// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Proxy {
    event ImpelementationContractUpdated(
        address oldAddress,
        address newAddress
    );

    address private _implementation;

    function _updateImpelemetation(address implementation) internal {
        require(
            implementation != address(0),
            "proxy: can't set to zero address"
        );
        address implemeationCache = _implementation;
        require(
            implemeationCache != implementation,
            "proxy: can't set same implemention"
        );
        _implementation = implementation;
        emit ImpelementationContractUpdated(implemeationCache, implementation);
    }

    function getImplementation() public view returns (address) {
        return _implementation;
    }

    function setImplementation(address implementation) public virtual {
        _updateImpelemetation(implementation);
    }
}
