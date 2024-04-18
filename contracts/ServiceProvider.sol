// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "./abstracts/Initializer.sol";
import "./interfaces/IServiceProvider.sol";

contract ServiceProvider is Initializer, IServiceProvider {

    // store merchant as key and return service provider as value
    mapping(address => address) private _merchantRegistry;

    address private _proxy;

    // modifier check is caller is proxy contract

    /// @notice system contract not use constructor due it's preload into genesis block

    modifier onlyProxy() {
        require(msg.sender == _proxy,"only proxy can call this ");
    }

    function updateProxy(address proxy) external {
        address proxyCache = _proxy;
        _proxy = proxy;
        emit proxyUpdated(proxyCache, proxy);
    }

    function grantMerchant(address account) public {
        _merchantRegistry[account] = msg.sender;
    }

    function revokeMerchant(address account) public {
        _merchantRegistry[account] = address(0);
    }

}