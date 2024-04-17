// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

interface IServiceProvider {

    function version() external view returns(uint256);
    function getMerchant() external view returns(uint256);
    function grantMerchant(address account) external;
    function revokeMerchant(address account) external;

}