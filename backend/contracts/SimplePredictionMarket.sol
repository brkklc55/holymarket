// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimplePredictionMarket {
    address public admin;
    address public feeCollector;
    uint256 public platformFeePercent = 10; // 10%
    
    struct Pool {
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool outcome;
    }
    
    // marketId => Pool
    mapping(uint256 => Pool) public pools;
    
    // marketId => user => bet
    mapping(uint256 => mapping(address => Bet)) public bets;
    
    struct Bet {
        uint256 amount;
        bool outcome;
        bool claimed;
    }
    
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool outcome);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event FeesWithdrawn(address indexed collector, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(address _feeCollector) {
        admin = msg.sender;
        feeCollector = _feeCollector;
    }
    
    function bet(uint256 _marketId, bool _outcome) external payable {
        Pool storage pool = pools[_marketId];
        require(!pool.resolved, "Market resolved");
        require(msg.value > 0, "Must send ETH");
        
        Bet storage userBet = bets[_marketId][msg.sender];
        userBet.amount += msg.value;
        userBet.outcome = _outcome;
        
        if (_outcome) {
            pool.yesPool += msg.value;
        } else {
            pool.noPool += msg.value;
        }
        
        emit BetPlaced(_marketId, msg.sender, msg.value, _outcome);
    }
    
    function resolveMarket(uint256 _marketId, bool _outcome) external onlyAdmin {
        Pool storage pool = pools[_marketId];
        require(!pool.resolved, "Already resolved");
        
        pool.resolved = true;
        pool.outcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome);
    }
    
    function claim(uint256 _marketId) external {
        Pool storage pool = pools[_marketId];
        require(pool.resolved, "Not resolved");
        
        Bet storage userBet = bets[_marketId][msg.sender];
        require(userBet.amount > 0, "No bet");
        require(!userBet.claimed, "Already claimed");
        require(userBet.outcome == pool.outcome, "Lost bet");
        
        uint256 totalPool = pool.yesPool + pool.noPool;
        uint256 winningPool = pool.outcome ? pool.yesPool : pool.noPool;
        
        // Calculate user's share of total pool
        uint256 grossPayout = (userBet.amount * totalPool) / winningPool;
        
        // Deduct 10% platform fee
        uint256 fee = (grossPayout * platformFeePercent) / 100;
        uint256 netPayout = grossPayout - fee;
        
        userBet.claimed = true;
        payable(msg.sender).transfer(netPayout);
        
        emit WinningsClaimed(_marketId, msg.sender, netPayout);
    }
    
    function withdrawFees() external {
        require(msg.sender == feeCollector || msg.sender == admin, "Not authorized");
        uint256 balance = address(this).balance;
        payable(feeCollector).transfer(balance);
        emit FeesWithdrawn(feeCollector, balance);
    }
    
    function getPool(uint256 _marketId) external view returns (
        uint256 yesPool,
        uint256 noPool,
        bool resolved,
        bool outcome
    ) {
        Pool memory pool = pools[_marketId];
        return (pool.yesPool, pool.noPool, pool.resolved, pool.outcome);
    }
}
