// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../abstracts/Initializer.sol";

contract InitializedMock is Initializer {
    function init() external onlyInitializer {
        _initialized();
    }
}