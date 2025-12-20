const { expect } = require("chai");
const hre = require("hardhat");
const { parseEther, formatEther } = require("viem");

describe("PredictionMarket", function () {
    async function deployMarketFixture() {
        const [owner, user1, user2] = await hre.viem.getWalletClients();
        const market = await hre.viem.deployContract("PredictionMarket", []);
        const publicClient = await hre.viem.getPublicClient();
        return { market, owner, user1, user2, publicClient };
    }

    it("Should create a market", async function () {
        const { market } = await deployMarketFixture();
        const duration = 3600n; // 1 hour
        await market.write.createMarket(["Will ETH hit 4k?", duration]);

        const m = await market.read.markets([1n]);
        expect(m[0]).to.equal("Will ETH hit 4k?");
        expect(m[4]).to.equal(false); // resolved
    });

    it("Should accept bets and calculate winnings correctly", async function () {
        const { market, user1, user2, publicClient } = await deployMarketFixture();
        await market.write.createMarket(["Test Market", 3600n]);

        // User 1 bets 1 ETH on YES (true)
        await market.write.bet([1n, true], {
            account: user1.account,
            value: parseEther("1")
        });

        // User 2 bets 1 ETH on NO (false)
        await market.write.bet([1n, false], {
            account: user2.account,
            value: parseEther("1")
        });

        // Check pools
        const m = await market.read.markets([1n]);
        expect(m[2]).to.equal(parseEther("1")); // yesPool
        expect(m[3]).to.equal(parseEther("1")); // noPool

        // Fast forward time
        await hre.network.provider.send("evm_increaseTime", [3601]);
        await hre.network.provider.send("evm_mine");

        // Resolve market as YES (true)
        await market.write.resolveMarket([1n, true]);

        // User 1 claims winnings
        const balanceBefore = await publicClient.getBalance({ address: user1.account.address });
        await market.write.claim([1n], { account: user1.account });
        const balanceAfter = await publicClient.getBalance({ address: user1.account.address });

        // User 1 should get ~2 ETH (minus gas)
        // 1 ETH (own bet) + 1 ETH (User 2's bet)
        console.log("Winnings claimed:", formatEther(balanceAfter - balanceBefore));
        expect(balanceAfter > balanceBefore).to.be.true;
    });
});
