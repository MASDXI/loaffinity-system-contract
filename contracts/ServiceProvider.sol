// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./abstracts/Initializer.sol";
import "./interfaces/IServiceProvider.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract ServiceProvider is AccessControlEnumerable, Initializer, IServiceProvider {

    /// @notice store merchant as key and return service provider as value.
    mapping(address => address) private _registry;

    address private _proxy;

    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");

    event proxyUpdated(address indexed oldProxy, address indexed newProxy);

    modifier onlyProxy() {
        require(msg.sender == _proxy, "serviceprovider: only proxy can call");
        _;
    }

    /// @notice point to system contract service provider proxy
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

    function getServiceProvider(address merchant) public view returns (address) {
        return _registry[merchant];
    }

    function grantMerchant(address merchant, address callee) public onlyProxy {
        _registry[merchant] = callee;
        _grantRole(MERCHANT_ROLE, merchant);
    }

    function revokeMerchant(address merchant, address callee) public onlyProxy {
        require( _registry[merchant] == callee,"serviceprovider:");
        _registry[merchant] = address(0);
        _revokeRole(MERCHANT_ROLE, merchant);
    }

}