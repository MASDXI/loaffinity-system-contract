// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IServiceProvider {
    function version() external view returns (uint256);
    function getServiceProvider(
        address merchant
    ) external view returns (address);
    function grantMerchant(address merchant, address callee) external;
    function revokeMerchant(address merchant, address callee) external;
}
