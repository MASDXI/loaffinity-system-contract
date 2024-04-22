// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

abstract contract Proxy {

    event ImpelementationContractUpdated(address targetAddress);

    address private _implemetation;

    function _updateImpelemetation(address implementation) internal {
        address implemeationCache = _implemetation;
        require(_implemetation != implementation,"proxy: can't set same implemention");
        _implemetation = implementation;
        emit ImpelementationContractUpdated(_implemetation, implementation);
    }

    function getImplemetation() public returns (address) {
        return _implemetation;
    }

    function setImplementation(address implementation) public virtual {
        _updateImpelemetation(implementation);
    }

}