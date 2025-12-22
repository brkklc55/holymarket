// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPredictionMarket {
    function claim(uint256 marketId) external;
    function emergencyWithdraw(uint256 marketId) external;
    function bet(uint256 marketId, bool outcome) external payable;
}

contract TestReentrantAttacker {
    IPredictionMarket public market;
    uint256 public marketId;
    bool private reenter;
    bool private reenterEmergencyWithdraw;
    bool public reentrancyBlocked;

    constructor(IPredictionMarket _market) {
        market = _market;
    }

    function betYes(uint256 _marketId) external payable {
        market.bet{ value: msg.value }(_marketId, true);
    }

    function betNo(uint256 _marketId) external payable {
        market.bet{ value: msg.value }(_marketId, false);
    }

    function attackClaim(uint256 _marketId) external {
        marketId = _marketId;
        reenter = true;
        reenterEmergencyWithdraw = false;
        market.claim(_marketId);
        reenter = false;
    }

    function attackEmergencyWithdraw(uint256 _marketId) external {
        marketId = _marketId;
        reenter = true;
        reenterEmergencyWithdraw = true;
        market.emergencyWithdraw(_marketId);
        reenter = false;
    }

    receive() external payable {
        if (reenter) {
            if (reenterEmergencyWithdraw) {
                try market.emergencyWithdraw(marketId) {
                    // should not happen
                } catch {
                    reentrancyBlocked = true;
                }
            } else {
                try market.claim(marketId) {
                    // should not happen
                } catch {
                    reentrancyBlocked = true;
                }
            }
        }
    }
}
