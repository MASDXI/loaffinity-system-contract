// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

abstract contract Proxy {

    address private _implemetation;

    // error

    // event

    function _updateImpelemetation(address implementation) internal {
        // if () {
        //     revert ();
        // }
        address implemeationCache = _implemetation;
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