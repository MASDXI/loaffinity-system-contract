// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Initializer.sol";
import "./interfaces/IServiceProvider.sol";

contract ServiceProvider is Initializer, IServiceProvider {

    // store merchant as key and return service provider as value
    mapping(address => address) private _merchantRegistry;

    address private _proxy;

    modifier onlyProxy() {
        require(msg.sender == _proxy,"only proxy can call this ");
        _;
    }

    constructor (address proxyContract) {
        _proxy = proxyContract;
    }
    
    function version() public override view returns(uint256) {
        return 10;
    }

    function updateProxy(address proxy) external {
        address proxyCache = _proxy;
        _proxy = proxy;
        emit proxyUpdated(proxyCache, proxy);
    }

    /// @notice only proxy contract can call this function.
    function grantMerchant(address account) public onlyProxy {
        _merchantRegistry[account] = msg.sender;
        // emit event
    }

    /// @notice only proxy contract can call this function.
    function revokeMerchant(address account) public onlyProxy {
        _merchantRegistry[account] = address(0);
        // emit event
    }

}