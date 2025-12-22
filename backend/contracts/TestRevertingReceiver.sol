// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestRevertingReceiver {
    receive() external payable {
        revert("No receive");
    }
}
