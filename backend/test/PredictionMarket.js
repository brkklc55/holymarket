const { expect } = require("chai");
const hre = require("hardhat");
const { parseEther, formatEther } = require("viem");
const { decodeEventLog } = require("viem");

describe("PredictionMarket", function () {
    function extractErrorText(e) {
        const parts = [];
        if (!e) return "";
        if (e.shortMessage) parts.push(String(e.shortMessage));
        if (e.message) parts.push(String(e.message));
        if (e.details) parts.push(String(e.details));
        if (e.cause?.message) parts.push(String(e.cause.message));
        if (Array.isArray(e.metaMessages)) parts.push(e.metaMessages.join("\n"));

        try {
            const json = JSON.stringify(e, Object.getOwnPropertyNames(e));
            if (json) parts.push(json);
        } catch (_) {
            // ignore
        }

        return parts.filter(Boolean).join("\n");
    }

    async function expectRevert(promise, messagePart) {
        try {
            await promise;
            expect.fail("Expected transaction to revert");
        } catch (e) {
            const msg = extractErrorText(e);
            expect(msg).to.include(messagePart);
        }
    }

    async function deployMarketFixture() {
        const [owner, user1, user2] = await hre.viem.getWalletClients();
        const market = await hre.viem.deployContract("PredictionMarket", []);
        const publicClient = await hre.viem.getPublicClient();
        return { market, owner, user1, user2, publicClient };
    }

    async function decodeReceiptEvents({ market, receipt }) {
        const abi = market.abi;
        const address = market.address.toLowerCase();
        const events = [];

        for (const log of receipt.logs ?? []) {
            if (!log?.address) continue;
            if (String(log.address).toLowerCase() !== address) continue;
            try {
                const decoded = decodeEventLog({
                    abi,
                    data: log.data,
                    topics: log.topics,
                });
                events.push(decoded);
            } catch (_) {
                // ignore non-matching logs
            }
        }

        return events;
    }

    it("Should create a market", async function () {
        const { market } = await deployMarketFixture();
        const duration = 3600n; // 1 hour
        await market.write.createMarket(["Will ETH hit 4k?", duration]);

        const m = await market.read.markets([1n]);
        expect(m[0]).to.equal("Will ETH hit 4k?");
        expect(m[4]).to.equal(false); // resolved
        expect(m[5]).to.equal(false); // cancelled
    });

    it("Should validate createMarket inputs", async function () {
        const { market } = await deployMarketFixture();
        await expectRevert(market.write.createMarket(["", 3600n]), "Empty question");
        await expectRevert(market.write.createMarket(["Q", 0n]), "Invalid duration");
    });

    it("Should restrict admin-only functions", async function () {
        const { market, user1 } = await deployMarketFixture();
        await expectRevert(
            market.write.createMarket(["Test", 3600n], { account: user1.account }),
            "Only admin"
        );
        await expectRevert(
            market.write.transferAdmin([user1.account.address], { account: user1.account }),
            "Only admin"
        );
        await expectRevert(
            market.write.emergencyCancelMarket([1n], { account: user1.account }),
            "Only admin"
        );
    });

    it("Should allow admin transfer", async function () {
        const { market, user1 } = await deployMarketFixture();
        const txHash = await market.write.transferAdmin([user1.account.address]);
        const publicClient = await hre.viem.getPublicClient();
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        const events = await decodeReceiptEvents({ market, receipt });
        const adminTransferred = events.find((e) => e.eventName === "AdminTransferred");
        expect(adminTransferred).to.not.equal(undefined);
        expect(adminTransferred.args.previousAdmin.toLowerCase()).to.equal(receipt.from.toLowerCase());
        expect(adminTransferred.args.newAdmin.toLowerCase()).to.equal(user1.account.address.toLowerCase());

        const newAdmin = await market.read.admin();
        expect(newAdmin.toLowerCase()).to.equal(user1.account.address.toLowerCase());

        // New admin can create a market
        await market.write.createMarket(["Admin switched", 3600n], { account: user1.account });
        const m = await market.read.markets([1n]);
        expect(m[0]).to.equal("Admin switched");
    });

    it("Should reject invalid market ids", async function () {
        const { market, user1 } = await deployMarketFixture();

        await expectRevert(
            market.write.bet([1n, true], { account: user1.account, value: parseEther("0.1") }),
            "Invalid market"
        );
        await expectRevert(market.write.resolveMarket([1n, true]), "Invalid market");
        await expectRevert(market.write.claim([1n], { account: user1.account }), "Invalid market");
    });

    it("Should cancel a selected market and allow refunds via emergencyWithdraw", async function () {
        const { market, user1, user2, publicClient } = await deployMarketFixture();
        await market.write.createMarket(["Cancel market 1", 3600n]);
        await market.write.createMarket(["Market 2 stays active", 3600n]);

        await market.write.bet([1n, true], {
            account: user1.account,
            value: parseEther("1"),
        });
        await market.write.bet([1n, false], {
            account: user2.account,
            value: parseEther("0.5"),
        });

        const cancelTx = await market.write.emergencyCancelMarket([1n]);
        const cancelReceipt = await publicClient.waitForTransactionReceipt({ hash: cancelTx });
        const cancelEvents = await decodeReceiptEvents({ market, receipt: cancelReceipt });
        const cancelledEvent = cancelEvents.find((e) => e.eventName === "EmergencyMarketCancelled");
        expect(cancelledEvent).to.not.equal(undefined);
        expect(cancelledEvent.args.marketId).to.equal(1n);

        const m1 = await market.read.markets([1n]);
        const m2 = await market.read.markets([2n]);
        expect(m1[5]).to.equal(true);
        expect(m2[5]).to.equal(false);

        const before = await publicClient.getBalance({ address: user1.account.address });
        await market.write.emergencyWithdraw([1n], { account: user1.account });
        const after = await publicClient.getBalance({ address: user1.account.address });
        expect(after).to.be.greaterThan(before);

        // Second withdrawal should fail
        await expectRevert(market.write.emergencyWithdraw([1n], { account: user1.account }), "Already claimed");

        // Other market should still accept bets
        await market.write.bet([2n, true], {
            account: user1.account,
            value: parseEther("0.01"),
        });
    });

    it("Should revert claim when fee transfer fails (admin cannot receive)", async function () {
        const { market, user1, user2 } = await deployMarketFixture();

        // Make admin a contract that can forward admin calls, but reverts on receiving ETH
        const adminForwarder = await hre.viem.deployContract("TestAdminForwarderRevertingReceiver", [market.address]);
        await market.write.transferAdmin([adminForwarder.address]);

        await adminForwarder.write.createMarket(["Fee fail", 3600n]);

        await market.write.bet([1n, true], {
            account: user1.account,
            value: parseEther("1"),
        });
        await market.write.bet([1n, false], {
            account: user2.account,
            value: parseEther("1"),
        });

        await hre.network.provider.send("evm_increaseTime", [3601]);
        await hre.network.provider.send("evm_mine");

        await adminForwarder.write.resolveMarket([1n, true]);

        await expectRevert(market.write.claim([1n], { account: user1.account }), "Fee transfer failed");

        // sanity: state wasn't changed for user1 (still not claimed)
        const bet = await market.read.getUserBet([1n, user1.account.address]);
        expect(bet[2]).to.equal(false);
    });

    it("Should block reentrancy on claim", async function () {
        const { market, user2 } = await deployMarketFixture();

        await market.write.createMarket(["Reentrancy claim", 3600n]);

        const attacker = await hre.viem.deployContract("TestReentrantAttacker", [market.address]);

        // Fund attacker, and have attacker place a winning-side bet
        await user2.sendTransaction({ to: attacker.address, value: parseEther("1") });
        await attacker.write.betYes([1n], { value: parseEther("0.5") });
        await market.write.bet([1n, false], {
            account: user2.account,
            value: parseEther("0.5"),
        });

        await hre.network.provider.send("evm_increaseTime", [3601]);
        await hre.network.provider.send("evm_mine");
        await market.write.resolveMarket([1n, true]);

        // claim triggers a transfer to attacker which will attempt to reenter claim again.
        // attacker swallows the revert but sets a flag.
        await attacker.write.attackClaim([1n]);
        const blocked = await attacker.read.reentrancyBlocked();
        expect(blocked).to.equal(true);

        // sanity: attacker is marked claimed (outer claim succeeded)
        const bet = await market.read.getUserBet([1n, attacker.address]);
        expect(bet[2]).to.equal(true);
    });

    it("Should block reentrancy on emergencyWithdraw", async function () {
        const { market, user2 } = await deployMarketFixture();

        await market.write.createMarket(["Reentrancy ew", 3600n]);
        const attacker = await hre.viem.deployContract("TestReentrantAttacker", [market.address]);

        await user2.sendTransaction({ to: attacker.address, value: parseEther("1") });
        await attacker.write.betYes([1n], { value: parseEther("0.25") });

        await market.write.emergencyCancelMarket([1n]);

        await attacker.write.attackEmergencyWithdraw([1n]);
        const blocked = await attacker.read.reentrancyBlocked();
        expect(blocked).to.equal(true);

        const bet = await market.read.getUserBet([1n, attacker.address]);
        expect(bet[2]).to.equal(true);
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
