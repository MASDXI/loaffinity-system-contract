// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "./abstracts/Initializer.sol";
import "./interfaces/IServiceProvider.sol";

contract ServiceProvider is Initializer, IServiceProvider {

    mapping(address => address) private _merchantRegistry;

    /// @notice system contract not use constructor due it's preload into genesis block

    function grantMerchant(address account) public {
        // @TODO authorization
        _merchantRegistry[account] = msg.sender;
    }

    function revokeMerchant(address account) public {
        // @TODO authorization
        _merchantRegistry[account] = address(0);
    }

}