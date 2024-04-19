// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IServiceProvider {

    event grantedMerchant(address indexed serviceProvider, address indexed merchant);
    event revokedMerchant(address indexed serviceProvider, address indexed merchant);

    function version() external view returns(uint256);
    function getMerchant() external view returns(uint256);
    function grantMerchant(address account) external;
    function revokeMerchant(address account) external;

}