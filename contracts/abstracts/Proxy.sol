// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Proxy {

    address private _implemetation;

    // error

    constructor (address implementation) {
        _updateImpelemetation(implementation);
    }

    function _updateImpelemetation(address implementation) internal {
        address implemeationCache = _implemetation;
        if (implementation == _implemetation) {
            revert;
        }
        _implemetation = implementation;
        emit ImpelementationContractUpdated(_implemetation, implementation);
    }

    function getImplemetation() external returns (address) {
        return _implemetation;
    }

    function setImplementation(address implementation) external virtual override {
        _updateImpelemetation(implementation);
    }

}