// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPredictionMarketAdmin {
    function createMarket(string calldata question, uint256 duration) external;
    function resolveMarket(uint256 marketId, bool outcome) external;
}

contract TestAdminForwarderRevertingReceiver {
    IPredictionMarketAdmin public market;

    constructor(IPredictionMarketAdmin _market) {
        market = _market;
    }

    function createMarket(string calldata question, uint256 duration) external {
        market.createMarket(question, duration);
    }

    function resolveMarket(uint256 marketId, bool outcome) external {
        market.resolveMarket(marketId, outcome);
    }

    receive() external payable {
        revert("No receive");
    }
}
