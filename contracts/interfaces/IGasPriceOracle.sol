// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IGasPriceOracle {

    function version() external view returns(uint256);
    // incase static?
    function calculate(uint256 gasUsed) external view returns(uint256);
    // incase dynamics?
    function calculate(bytes memory encodePayload) external view returns(uint256);
}