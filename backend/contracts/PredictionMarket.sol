// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    struct Market {
        string question;
        uint256 endTime;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcome; // true = Yes, false = No
        mapping(address => uint256) yesBets;
        mapping(address => uint256) noBets;
        mapping(address => bool) claimed;
    }

    function getUserBet(uint256 _marketId, address _user) external view returns (uint256 yesAmount, uint256 noAmount, bool claimed) {
        Market storage m = markets[_marketId];
        return (m.yesBets[_user], m.noBets[_user], m.claimed[_user]);
    }

    uint256 public marketCount;
    uint256 public resetAfterMarketId;
    mapping(uint256 => Market) public markets;
    address public admin;

    event MarketCreated(uint256 indexed marketId, string question, uint256 endTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool outcome, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event EmergencyWithdrawn(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    function createMarket(string memory _question, uint256 _duration) external {
        require(msg.sender == admin, "Only admin");
        marketCount++;
        Market storage m = markets[marketCount];
        m.resolved = false;
        m.outcome = false;
        m.yesPool = 0;
        m.noPool = 0;
        m.question = _question;
        m.endTime = block.timestamp + _duration;
        emit MarketCreated(marketCount, _question, m.endTime);
    }

    function bet(uint256 _marketId, bool _outcome) external payable {
        require(_marketId > resetAfterMarketId, "Market reset");
        Market storage m = markets[_marketId];
        require(block.timestamp < m.endTime, "Market closed");
        require(!m.resolved, "Market resolved");
        require(msg.value > 0, "Bet amount must be > 0");

        if (_outcome) {
            m.yesPool += msg.value;
            m.yesBets[msg.sender] += msg.value;
        } else {
            m.noPool += msg.value;
            m.noBets[msg.sender] += msg.value;
        }

        emit BetPlaced(_marketId, msg.sender, _outcome, msg.value);
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external {
        require(msg.sender == admin, "Only admin");
        require(_marketId > resetAfterMarketId, "Market reset");
        Market storage m = markets[_marketId];
        require(!m.resolved, "Already resolved");
        require(block.timestamp >= m.endTime, "Market not ended");

        m.resolved = true;
        m.outcome = _outcome;
        emit MarketResolved(_marketId, _outcome);
    }

    function claim(uint256 _marketId) external {
        require(_marketId > resetAfterMarketId, "Market reset");
        Market storage m = markets[_marketId];
        require(m.resolved, "Not resolved");
        require(!m.claimed[msg.sender], "Already claimed");

        uint256 userBet;
        uint256 totalWinningPool;
        uint256 totalLosingPool;

        if (m.outcome) { // Yes won
            userBet = m.yesBets[msg.sender];
            totalWinningPool = m.yesPool;
            totalLosingPool = m.noPool;
        } else { // No won
            userBet = m.noBets[msg.sender];
            totalWinningPool = m.noPool;
            totalLosingPool = m.yesPool;
        }

        require(userBet > 0, "No winnings");

        m.claimed[msg.sender] = true;
        uint256 totalPool = totalWinningPool + totalLosingPool;
        uint256 reward = (userBet * totalPool) / totalWinningPool;

        // 5% Platform Fee
        uint256 fee = (reward * 5) / 100;
        uint256 netReward = reward - fee;

        // Pay admin the fee
        (bool feeSuccess, ) = admin.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        // Pay user the net reward
        (bool success, ) = msg.sender.call{value: netReward}("");
        require(success, "Native token transfer failed");
        
        emit WinningsClaimed(_marketId, msg.sender, netReward);
    }

    function emergencyWithdraw(uint256 _marketId) external {
        require(_marketId <= resetAfterMarketId, "Market not cancelled");
        Market storage m = markets[_marketId];
        require(!m.claimed[msg.sender], "Already claimed");

        uint256 yes = m.yesBets[msg.sender];
        uint256 no = m.noBets[msg.sender];
        uint256 amount = yes + no;
        require(amount > 0, "Nothing to withdraw");

        // Effects
        m.yesBets[msg.sender] = 0;
        m.noBets[msg.sender] = 0;
        m.claimed[msg.sender] = true;

        // Interaction
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Native token transfer failed");

        emit EmergencyWithdrawn(_marketId, msg.sender, amount);
    }

    function emergencyReset() external {
        require(msg.sender == admin, "Only admin");
        resetAfterMarketId = marketCount;
    }
}
