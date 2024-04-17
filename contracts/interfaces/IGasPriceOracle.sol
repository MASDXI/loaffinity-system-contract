// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

interface IGasPriceOracle {

    function version() external view returns(uint256);
    function calculate() external view returns(uint256);
}