"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http, parseEther, createWalletClient, custom, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TrendingUp, Share2, Twitter, Info, Sparkles, Search } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "../constants";
import { useToast } from "./ui/ToastProvider";

export default function MarketView() {
    const { address: userAddress, isConnected } = useAccount();
    const chainId = useChainId();
    const { toast } = useToast();
    const [selectedMarketId, setSelectedMarketId] = useState<bigint>(1n);
    const [marketCount, setMarketCount] = useState<bigint>(0n);
    const [market, setMarket] = useState<any>(null);
    const [allMarkets, setAllMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [betting, setBetting] = useState(false);
    const [amount, setAmount] = useState("0.001");
    const [walletBalance, setWalletBalance] = useState<bigint | null>(null);
    const [walletBalanceLoading, setWalletBalanceLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"market" | "leaderboard" | "activity" | "profile" | "faucet" | "airdrop" | "admin" | "list">("market");
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [recentBets, setRecentBets] = useState<any[]>([]);
    const [userHistory, setUserHistory] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminRole, setAdminRole] = useState<null | "admin" | "superadmin">(null);
    const [admins, setAdmins] = useState<Array<{ address: string; role: "admin" | "superadmin" }>>([]);
    const [adminMgmtTarget, setAdminMgmtTarget] = useState("");
    const [adminMgmtRole, setAdminMgmtRole] = useState<"admin" | "superadmin">("admin");
    const [adminMgmtBusy, setAdminMgmtBusy] = useState(false);
    const [sharePromptOpen, setSharePromptOpen] = useState(false);
    const [sharePromptTxHash, setSharePromptTxHash] = useState<string | null>(null);
    const [sharePromptAmountBnb, setSharePromptAmountBnb] = useState<string | null>(null);
    const [sharePromptChoice, setSharePromptChoice] = useState<"YES" | "NO" | null>(null);
    const [shareBoostBusy, setShareBoostBusy] = useState(false);
    const [userBet, setUserBet] = useState<{ yesAmount: bigint; noAmount: bigint; claimed: boolean } | null>(null);
    const [claimableAmount, setClaimableAmount] = useState("0");
    const [historyUserBets, setHistoryUserBets] = useState<Record<string, { yesAmount: bigint; noAmount: bigint; claimed: boolean }>>({});
    const [historyCancelled, setHistoryCancelled] = useState<Record<string, boolean>>({});
    const [historyMarkets, setHistoryMarkets] = useState<
        Record<
            string,
            {
                question: string;
                endTime: bigint;
                yesPool: bigint;
                noPool: bigint;
                resolved: boolean;
                cancelled: boolean;
                outcome: boolean;
            }
        >
    >({});
    const [marketSearch, setMarketSearch] = useState("");
    const [marketFilter, setMarketFilter] = useState<"all" | "live" | "ended" | "cancelled">("all");
    const [marketSort, setMarketSort] = useState<"newest" | "ending" | "volume">("newest");
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    const formatTimeLeft = (totalSeconds: number) => {
        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "ENDED";
        const d = Math.floor(totalSeconds / 86400);
        const h = Math.floor((totalSeconds % 86400) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        const parts: string[] = [];
        if (d > 0) parts.push(`${d}D`);
        if (h > 0 || d > 0) parts.push(`${h}H`);
        if (m > 0 || h > 0 || d > 0) parts.push(`${m}M`);
        parts.push(`${s}S`);
        return parts.join(" ");
    };

    const marketAddress = (process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || PREDICTION_MARKET_ADDRESS) as `0x${string}`;

    const [userPoints, setUserPoints] = useState<number>(0);
    const [pointsLeaderboard, setPointsLeaderboard] = useState<Array<{ user: string; points: number }>>([]);
    const [leaderboardPage, setLeaderboardPage] = useState(1);
    const [leaderboardHasMore, setLeaderboardHasMore] = useState(false);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const leaderboardLimit = 50;


    // Admin Creation State
    const [newQuestion, setNewQuestion] = useState("");
    const [newDuration, setNewDuration] = useState("3600"); // seconds (contract arg)
    const [durationDays, setDurationDays] = useState("0");
    const [durationHours, setDurationHours] = useState("1");
    const [durationMinutes, setDurationMinutes] = useState("0");
    const [targetEndTime, setTargetEndTime] = useState("");

    const needsNetworkSwitch = isConnected && chainId !== baseSepolia.id;

    const getShareBaseUrl = () => {
        // ALWAYS use our own domain - never the farcaster wrapper
        return "https://baseappholymarket.xyz";
    };

    const getMarketShareUrl = (forcedChoice?: "YES" | "NO") => {
        const base = getShareBaseUrl();
        if (!base) return "";
        const m = market;
        const choice = forcedChoice || sharePromptChoice;

        const params = new URLSearchParams();
        params.set('marketId', selectedMarketId.toString());

        if (m) {
            params.set('question', m.question);
            const total = m.yesPool + m.noPool;
            const yesPct = total > 0n ? Math.round(Number(m.yesPool * 100n / total)) : 50;
            const noPct = 100 - yesPct;
            const volume = (Number(total) / 1e18).toFixed(3);

            params.set('yesPct', yesPct.toString());
            params.set('noPct', noPct.toString());
            params.set('volume', volume);
        }

        if (choice) params.set('choice', choice);

        return `${base}/?${params.toString()}`;
    };

    const parseNonNegativeInt = (v: string) => {
        const n = Number(String(v ?? "").replace(/[^0-9]/g, ""));
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.floor(n);
    };

    const computeDurationSeconds = (dStr: string, hStr: string, mStr: string) => {
        const d = parseNonNegativeInt(dStr);
        const h = parseNonNegativeInt(hStr);
        const m = parseNonNegativeInt(mStr);
        const total = d * 86400 + h * 3600 + m * 60;
        return total;
    };

    const setDurationPresetSeconds = (seconds: number) => {
        const s = Math.max(0, Math.floor(seconds));
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        setDurationDays(String(d));
        setDurationHours(String(h));
        setDurationMinutes(String(m));
        setNewDuration(String(s));
    };

    const getDeviceId = () => {
        try {
            const key = "holymarket_device_id_v1";
            const existing = window.localStorage.getItem(key);
            if (existing) return existing;
            const created = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            window.localStorage.setItem(key, created);
            return created;
        } catch {
            return "unknown";
        }
    };

    const fetchWalletBalance = async () => {
        if (!userAddress || !isConnected || needsNetworkSwitch) {
            setWalletBalance(null);
            return;
        }
        setWalletBalanceLoading(true);
        try {
            const bal = await publicClient.getBalance({ address: userAddress as `0x${string}` });
            setWalletBalance(bal);
        } catch {
            setWalletBalance(null);
        } finally {
            setWalletBalanceLoading(false);
        }
    };


    const claimShareBoost = async (txHash: string, amountBnb: string) => {
        if (!userAddress) return;
        setShareBoostBusy(true);
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "shareBoost", user: userAddress, txHash, amountBnb: Number(amountBnb) }),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                toast({ title: "Share boost failed", message: json?.error || "Unknown error", variant: "error" });
                return;
            }
            if (json?.leaderboard) setPointsLeaderboard(json.leaderboard);
            await fetchPoints();
            if (json?.skipped) {
                toast({ title: "Already claimed", message: "Share boost was already applied for this bet.", variant: "warning" });
            } else {
                toast({ title: "2x points claimed", message: `Bonus +${json?.extra ?? ""} points added.`, variant: "success" });
            }
        } catch (e: any) {
            toast({ title: "Share boost failed", message: e?.message || "Unknown error", variant: "error" });
        } finally {
            setShareBoostBusy(false);
        }
    };

    const fetchAdminRole = async () => {
        if (!userAddress) {
            setAdminRole(null);
            setIsAdmin(false);
            return;
        }
        try {
            const res = await fetch(`/api/points?whoami=${encodeURIComponent(userAddress)}`, {
                cache: "no-store",
                headers: { "x-device-id": getDeviceId() },
            });
            if (!res.ok) {
                setAdminRole(null);
                setIsAdmin(false);
                return;
            }
            const json = await res.json();
            const role = json?.role === "admin" || json?.role === "superadmin" ? json.role : null;
            setAdminRole(role);
            setIsAdmin(Boolean(role));
        } catch {
            setAdminRole(null);
            setIsAdmin(false);
        }
    };

    const fetchAdmins = async () => {
        if (!userAddress) return;
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "adminList", adminAddress: userAddress }),
            });
            if (!res.ok) return;
            const json = await res.json();
            if (Array.isArray(json?.admins)) {
                setAdmins(json.admins.map((a: any) => ({ address: a.address, role: a.role })));
            }
        } catch {
            // ignore
        }
    };

    const adminUpsert = async () => {
        if (!userAddress) return;
        setAdminMgmtBusy(true);
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "adminUpsert", adminAddress: userAddress, target: adminMgmtTarget, role: adminMgmtRole }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => null);
                toast({ title: "Admin update failed", message: json?.error || "Not authorized", variant: "error" });
                return;
            }
            toast({ title: "Admin updated", message: "Admin role saved.", variant: "success" });
            setAdminMgmtTarget("");
            await fetchAdmins();
        } finally {
            setAdminMgmtBusy(false);
        }
    };

    const adminRemove = async (target: string) => {
        if (!userAddress) return;
        setAdminMgmtBusy(true);
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "adminRemove", adminAddress: userAddress, target }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => null);
                toast({ title: "Remove failed", message: json?.error || "Not authorized", variant: "error" });
                return;
            }
            toast({ title: "Admin removed", message: "Admin access removed.", variant: "success" });
            await fetchAdmins();
            await fetchAdminRole();
        } finally {
            setAdminMgmtBusy(false);
        }
    };

    const fetchPoints = async () => {
        setLeaderboardLoading(true);
        try {
            const url = userAddress
                ? `/api/points?user=${encodeURIComponent(userAddress)}&page=1&limit=${leaderboardLimit}`
                : `/api/points?page=1&limit=${leaderboardLimit}`;
            const res = await fetch(url, {
                cache: "no-store",
                headers: typeof window !== "undefined" ? { "x-device-id": getDeviceId() } : undefined,
            });
            if (!res.ok) return;
            const json = await res.json();
            setPointsLeaderboard(json.leaderboard || []);
            setLeaderboardPage(1);
            setLeaderboardHasMore(Boolean(json?.hasMore));
            if (json.user?.points !== undefined && json.user?.points !== null) {
                setUserPoints(Number(json.user.points) || 0);
            } else if (!userAddress) {
                setUserPoints(0);
            }
        } catch (e) {
            console.error("Failed to fetch points:", e);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    const fetchLeaderboardPage = async (page: number) => {
        const p = Math.max(1, Math.floor(page));
        setLeaderboardLoading(true);
        try {
            const url = userAddress
                ? `/api/points?user=${encodeURIComponent(userAddress)}&page=${p}&limit=${leaderboardLimit}`
                : `/api/points?page=${p}&limit=${leaderboardLimit}`;
            const res = await fetch(url, {
                cache: "no-store",
                headers: typeof window !== "undefined" ? { "x-device-id": getDeviceId() } : undefined,
            });
            if (!res.ok) return;
            const json = await res.json();
            setPointsLeaderboard(json.leaderboard || []);
            setLeaderboardPage(p);
            setLeaderboardHasMore(Boolean(json?.hasMore));
            if (json.user?.points !== undefined && json.user?.points !== null) {
                setUserPoints(Number(json.user.points) || 0);
            }
        } catch (e) {
            console.error("Failed to fetch leaderboard page:", e);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    const bindReferralIfPresent = async () => {
        if (!userAddress) return;
        try {
            const url = new URL(window.location.href);
            const ref = url.searchParams.get("ref");
            if (!ref) return;
            if (ref.toLowerCase() === userAddress.toLowerCase()) return;
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "bindReferral", user: userAddress, referrer: ref }),
            });
            if (res.ok) {
                await fetchPoints();
            }
        } catch (e) {
            console.error("Failed to bind referral:", e);
        }
    };

    const earnPointsForBet = async (amountBnb: string) => {
        if (!userAddress) return;
        const bnb = Number(amountBnb);
        if (!Number.isFinite(bnb) || bnb <= 0) return;
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "earn", user: userAddress, amountBnb: bnb }),
            });
            if (!res.ok) return;
            const json = await res.json();
            if (json?.leaderboard) setPointsLeaderboard(json.leaderboard);
            await fetchPoints();
        } catch (e) {
            console.error("Failed to earn points:", e);
        }
    };

    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://base-sepolia.publicnode.com"),
    });

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const url = new URL(window.location.href);
            const raw = url.searchParams.get("marketId");
            if (!raw) return;
            const n = BigInt(raw);
            if (n <= 0n) return;
            setSelectedMarketId(n);
            setActiveTab("market");
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            if (typeof window === "undefined") return;
            const key = "holymarket_prompt_addminiapp_v1";
            const cooldownMs = 5 * 60 * 1000;
            const last = window.sessionStorage.getItem(key);
            if (last) {
                const t = Number(last);
                if (Number.isFinite(t) && Date.now() - t < cooldownMs) return;
            }

            try {
                await sdk.actions.ready();
                const isMiniApp = await sdk.isInMiniApp().catch(() => false);
                if (!isMiniApp) return;

                // Give the UI a moment to settle before prompting
                await new Promise((r) => setTimeout(r, 600));
                await sdk.actions.addMiniApp();

                // Avoid spamming prompts; cooldown instead of one-time lock
                window.sessionStorage.setItem(key, String(Date.now()));
            } catch {
                // If it fails, don't spam retries.
                try {
                    window.sessionStorage.setItem("holymarket_prompt_addminiapp_v1", String(Date.now()));
                } catch {
                    // ignore
                }
            }
        };

        run();
    }, []);

    const handleResetNotificationPrompt = async () => {
        try {
            if (typeof window !== "undefined") {
                try {
                    window.sessionStorage.removeItem("holymarket_prompt_addminiapp_v1");
                } catch {
                    // ignore
                }
            }

            await sdk.actions.ready();

            let isMiniApp = false;
            try {
                isMiniApp = await sdk.isInMiniApp();
            } catch {
                isMiniApp = false;
            }

            if (!isMiniApp) {
                toast({
                    title: "Not in Warpcast Mini App",
                    message: "Open HolyMarket inside Warpcast mobile Mini Apps.",
                    variant: "warning",
                });
                return;
            }

            await sdk.actions.addMiniApp();

            try {
                if (typeof window !== "undefined") {
                    window.sessionStorage.setItem("holymarket_prompt_addminiapp_v1", String(Date.now()));
                }
            } catch {
                // ignore
            }

            toast({ title: "Requested", message: "Check the Warpcast prompt.", variant: "success" });
        } catch (e: any) {
            const name = String(e?.name || "");
            const msg = String(e?.shortMessage || e?.message || e || "Could not open Warpcast prompt.");
            toast({
                title: "Reset prompt failed",
                message: `${name ? `${name}: ` : ""}${msg}`,
                variant: "error",
            });
        }
    };

    useEffect(() => {
        const total = computeDurationSeconds(durationDays, durationHours, durationMinutes);
        const next = String(total);
        if (newDuration !== next) setNewDuration(next);
    }, [durationDays, durationHours, durationMinutes]);

    useEffect(() => {
        if (market?.resolved && userBet && !userBet.claimed && market.outcome !== undefined) {
            const yesAmt = BigInt(userBet.yesAmount);
            const noAmt = BigInt(userBet.noAmount);
            const winningPool = market.outcome ? BigInt(market.yesPool) : BigInt(market.noPool);
            const totalPool = BigInt(market.yesPool) + BigInt(market.noPool);

            const winningBet = market.outcome ? yesAmt : noAmt;

            if (winningBet > 0n && winningPool > 0n) {
                const reward = (winningBet * totalPool) / winningPool;
                const fee = (reward * 5n) / 100n;
                const netReward = reward - fee;
                setClaimableAmount(formatEther(netReward));
            } else {
                setClaimableAmount("0");
            }
        } else {
            setClaimableAmount("0");
        }
    }, [market, userBet]);

    const fetchUserBet = async () => {
        if (!userAddress || !selectedMarketId) return;
        try {
            const data: any = await publicClient.readContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "getUserBet",
                args: [selectedMarketId, userAddress as `0x${string}`],
            });
            setUserBet({
                yesAmount: data[0],
                noAmount: data[1],
                claimed: data[2]
            });
        } catch (e) {
            console.error("Failed to fetch user bet:", e);
        }
    };

    useEffect(() => {
        if (selectedMarketId) {
            fetchMarketData();
            fetchLeaderboard();
            fetchRecentBets();
            if (userAddress) fetchUserBet();
        }
    }, [selectedMarketId, userAddress]);

    useEffect(() => {
        if (userAddress) {
            fetchAdminRole();
            fetchUserHistory();
            fetchPoints();
            if (typeof window !== "undefined") bindReferralIfPresent();
            fetchWalletBalance();
        } else {
            setIsAdmin(false);
            setAdminRole(null);
            setUserHistory([]);
            setUserPoints(0);
            setWalletBalance(null);
            fetchPoints();
        }
    }, [userAddress]);

    useEffect(() => {
        fetchHistoryUserBets(userHistory as any[]);
    }, [userHistory, userAddress]);

    useEffect(() => {
        fetchWalletBalance();
    }, [isConnected, needsNetworkSwitch]);

    useEffect(() => {
        if (activeTab === "admin" && userAddress && adminRole) {
            fetchAdmins();
        }
    }, [activeTab, userAddress, adminRole]);

    useEffect(() => {
        fetchPoints();
    }, []);

    const init = async () => {
        await fetchMarketCount();
    };

    const fetchUserHistory = async () => {
        if (!userAddress) return;
        try {
            const currentBlock = await publicClient.getBlockNumber();
            const fromBlock = currentBlock - 20000n; // Last ~3 days on BSC
            const logs = await publicClient.getContractEvents({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                eventName: "BetPlaced",
                args: { user: userAddress as `0x${string}` },
                fromBlock: fromBlock,
            });
            const history = logs.map((log: any) => ({
                marketId: log.args.marketId,
                amount: log.args.amount,
                outcome: log.args.outcome,
                blockNumber: log.blockNumber
            })).reverse();
            setUserHistory(history);
        } catch (e) {
            console.error("Failed to fetch user history:", e);
        }
    };

    const fetchHistoryUserBets = async (history: any[]) => {
        if (!userAddress || !history || history.length === 0) {
            setHistoryUserBets({});
            setHistoryCancelled({});
            setHistoryMarkets({});
            return;
        }
        try {
            const next: Record<string, { yesAmount: bigint; noAmount: bigint; claimed: boolean }> = {};
            const nextCancelled: Record<string, boolean> = {};
            const nextMarkets: Record<
                string,
                {
                    question: string;
                    endTime: bigint;
                    yesPool: bigint;
                    noPool: bigint;
                    resolved: boolean;
                    cancelled: boolean;
                    outcome: boolean;
                }
            > = {};
            const ids = Array.from(new Set(history.map((h) => (h.marketId as bigint).toString())));
            for (const idStr of ids) {
                const id = BigInt(idStr);
                try {
                    const res = await publicClient.readContract({
                        address: marketAddress,
                        abi: PREDICTION_MARKET_ABI,
                        functionName: "getUserBet",
                        args: [id, userAddress as `0x${string}`],
                    });
                    const [yesAmount, noAmount, claimed] = res as unknown as [bigint, bigint, boolean];
                    next[idStr] = { yesAmount, noAmount, claimed };

                    try {
                        const m: any = await publicClient.readContract({
                            address: marketAddress,
                            abi: PREDICTION_MARKET_ABI,
                            functionName: "markets",
                            args: [id],
                        });
                        // markets() now returns: question, endTime, yesPool, noPool, resolved, cancelled, outcome
                        nextCancelled[idStr] = Boolean(m[5]);
                        nextMarkets[idStr] = {
                            question: String(m[0] || ""),
                            endTime: BigInt(m[1] ?? 0),
                            yesPool: BigInt(m[2] ?? 0),
                            noPool: BigInt(m[3] ?? 0),
                            resolved: Boolean(m[4]),
                            cancelled: Boolean(m[5]),
                            outcome: Boolean(m[6]),
                        };
                    } catch {
                        nextCancelled[idStr] = false;
                    }
                } catch (e: any) {
                    const msg = String(e?.shortMessage || e?.message || "");
                    console.error("Failed to fetch getUserBet for market", idStr, e);
                }
            }
            setHistoryUserBets(next);
            setHistoryCancelled(nextCancelled);
            setHistoryMarkets(nextMarkets);
        } catch (e) {
            console.error("Failed to fetch history user bets:", e);
        }
    };

    const positionsSummary = useMemo(() => {
        const ids = Object.keys(historyUserBets);
        let openCount = 0;
        let closedCount = 0;
        let claimableCount = 0;
        let totalWagered = 0n;
        let claimableTotalWei = 0n;

        for (const idStr of ids) {
            const ub = historyUserBets[idStr];
            if (!ub) continue;
            const wagered = (ub.yesAmount || 0n) + (ub.noAmount || 0n);
            if (wagered <= 0n) continue;
            totalWagered += wagered;

            const m = historyMarkets[idStr];
            const cancelled = Boolean(historyCancelled[idStr]) || Boolean(m?.cancelled);
            const resolved = Boolean(m?.resolved);
            const ended = cancelled || resolved;

            if (ended) closedCount += 1;
            else openCount += 1;

            if (resolved && !ub.claimed) {
                const winningPool = m?.outcome ? (m?.yesPool || 0n) : (m?.noPool || 0n);
                const totalPool = (m?.yesPool || 0n) + (m?.noPool || 0n);
                const winningBet = m?.outcome ? (ub.yesAmount || 0n) : (ub.noAmount || 0n);
                if (winningBet > 0n && winningPool > 0n && totalPool > 0n) {
                    const reward = (winningBet * totalPool) / winningPool;
                    const fee = (reward * 5n) / 100n;
                    const netReward = reward - fee;
                    if (netReward > 0n) {
                        claimableCount += 1;
                        claimableTotalWei += netReward;
                    }
                }
            }
        }

        return {
            openCount,
            closedCount,
            claimableCount,
            totalWageredEth: Number(formatEther(totalWagered)).toFixed(4),
            claimableTotalEth: Number(formatEther(claimableTotalWei)).toFixed(4),
        };
    }, [historyUserBets, historyMarkets, historyCancelled]);

    const claimablePositions = useMemo(() => {
        const out: Array<{ id: bigint; question: string; amountEth: string }> = [];
        for (const [idStr, ub] of Object.entries(historyUserBets)) {
            const m = historyMarkets[idStr];
            if (!m || !m.resolved || ub.claimed) continue;
            const winningPool = m.outcome ? m.yesPool : m.noPool;
            const totalPool = m.yesPool + m.noPool;
            const winningBet = m.outcome ? ub.yesAmount : ub.noAmount;
            if (winningBet <= 0n || winningPool <= 0n || totalPool <= 0n) continue;
            const reward = (winningBet * totalPool) / winningPool;
            const fee = (reward * 5n) / 100n;
            const netReward = reward - fee;
            if (netReward <= 0n) continue;
            out.push({
                id: BigInt(idStr),
                question: m.question,
                amountEth: Number(formatEther(netReward)).toFixed(4),
            });
        }
        out.sort((a, b) => (a.id > b.id ? -1 : 1));
        return out;
    }, [historyUserBets, historyMarkets]);

    const fetchMarketCount = async () => {
        try {
            const count = await publicClient.readContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "marketCount",
            });
            const c = count as bigint;
            setMarketCount(c);
            if (c > 0n) {
                setSelectedMarketId((prev) => {
                    if (!prev) return 1n;
                    if (prev > c) return 1n;
                    return prev;
                });
            }

            fetchAllMarkets(c);
        } catch (e) {
            console.error("Failed to fetch market count:", e);
        }
    };

    const fetchAllMarkets = async (count: bigint) => {
        try {
            const markets = [];
            const start = count > 10n ? count - 9n : 1n;
            for (let i = count; i >= start; i--) {
                const data: any = await publicClient.readContract({
                    address: marketAddress,
                    abi: PREDICTION_MARKET_ABI,
                    functionName: "markets",
                    args: [i],
                });
                markets.push({
                    id: i,
                    question: data[0],
                    endTime: data[1],
                    yesPool: data[2],
                    noPool: data[3],
                    resolved: data[4],
                    cancelled: data[5],
                    outcome: data[6]
                });
            }
            setAllMarkets(markets);
        } catch (e) {
            console.error("Failed to fetch all markets:", e);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (market?.endTime) {
                const now = Math.floor(Date.now() / 1000);
                const end = Number(market.endTime);
                const diff = end - now;
                if (diff <= 0) {
                    setTimeLeft("ENDED");
                } else {
                    setTimeLeft(formatTimeLeft(diff));
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [market?.endTime]);

    const checkAndSwitchNetwork = async () => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            try {
                const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
                if (chainId !== "0x14a34") { // 84532 in hex (Base Sepolia)
                    try {
                        await (window as any).ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x14a34' }],
                        });
                    } catch (switchError: any) {
                        if (switchError.code === 4902) {
                            await (window as any).ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: '0x14a34',
                                        chainName: 'Base Sepolia',
                                        nativeCurrency: {
                                            name: 'Ether',
                                            symbol: 'ETH',
                                            decimals: 18,
                                        },
                                        rpcUrls: ['https://base-sepolia.publicnode.com'],
                                        blockExplorerUrls: ['https://sepolia.basescan.org'],
                                    },
                                ],
                            });
                        } else {
                            throw switchError;
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to switch network:", error);
                throw new Error("Please switch to Base Sepolia");
            }
        }
    };

    const fetchMarketData = async () => {
        setLoading(true);
        try {
            const data: any = await publicClient.readContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "markets",
                args: [selectedMarketId],
            });
            setMarket({
                question: data[0],
                endTime: data[1],
                yesPool: data[2],
                noPool: data[3],
                resolved: data[4],
                cancelled: data[5],
                outcome: data[6]
            });
        } catch (e) {
            console.error("Failed to fetch market:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleEnableNotifications = async () => {
        try {
            await sdk.actions.ready();

            let isMiniApp = false;
            try {
                isMiniApp = await sdk.isInMiniApp();
            } catch {
                isMiniApp = false;
            }

            if (!isMiniApp) {
                toast({
                    title: "Not in Warpcast Mini App",
                    message: "Open HolyMarket inside Warpcast mobile Mini Apps. addMiniApp() prompt cannot show in normal browser/webview.",
                    variant: "warning",
                });
                return;
            }

            await sdk.actions.addMiniApp();
            toast({ title: "Requested", message: "Check the Warpcast prompt to add HolyMarket and enable notifications.", variant: "success" });
        } catch (e: any) {
            const name = String(e?.name || "");
            const msg = String(e?.shortMessage || e?.message || e || "Could not open Warpcast prompt.");
            const debug = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
            toast({
                title: "Enable notifications failed",
                message: `${name ? `${name}: ` : ""}${msg}${debug ? ` (${debug})` : ""}`,
                variant: "error",
            });
        }
    };


    const handleCreateMarket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminRole !== "superadmin") {
            toast({ title: "Not authorized", message: "Only superadmin can create markets.", variant: "error" });
            return;
        }
        setBetting(true);
        try {
            await checkAndSwitchNetwork();
            const walletClient = createWalletClient({ chain: baseSepolia, transport: custom((window as any).ethereum) });
            const [address] = await walletClient.requestAddresses();

            let durationSecs = BigInt(newDuration);
            if (targetEndTime) {
                const targetMs = new Date(targetEndTime).getTime();
                const nowMs = Date.now();
                const diffSecs = Math.floor((targetMs - nowMs) / 1000);
                if (diffSecs <= 0) {
                    toast({ title: "Invalid date", message: "Target time must be in the future.", variant: "warning" });
                    setBetting(false);
                    return;
                }
                durationSecs = BigInt(diffSecs);
            }

            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "createMarket",
                args: [newQuestion, durationSecs],
                account: address,
            });

            toast({ title: "Market created", message: `Transaction submitted: ${hash}`, variant: "success" });
            await fetchMarketCount();
            setNewQuestion("");

            // Best-effort Warpcast notification broadcast
            try {
                const res = await fetch("/api/farcaster/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        adminAddress: address,
                        title: "New market",
                        body: newQuestion.slice(0, 120),
                        notificationId: `market-${Date.now()}`,
                        targetUrl: typeof window !== "undefined" ? window.location.origin : undefined,
                    }),
                });

                const json = await res.json().catch(() => null);
                if (!res.ok) {
                    toast({
                        title: "Notify failed",
                        message: json?.error || "Notification broadcast failed",
                        variant: "warning",
                    });
                } else {
                    const sends = Number(json?.sends || 0);
                    toast({
                        title: "Notified",
                        message: sends > 0 ? `Sent to ${sends} subscribers.` : "No subscribers yet.",
                        variant: "success",
                    });
                }
            } catch {
                // ignore
            }
        } catch (error: any) {
            toast({ title: "Create market failed", message: error?.message || "Unknown error", variant: "error" });
        } finally {
            setBetting(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const currentBlock = await publicClient.getBlockNumber();
            const fromBlock = currentBlock - 10000n;
            const logs = await publicClient.getContractEvents({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                eventName: "BetPlaced",
                args: { marketId: selectedMarketId },
                fromBlock: fromBlock,
            });
            const stats: Record<string, bigint> = {};
            logs.forEach((log: any) => {
                const user = log.args.user;
                const amount = log.args.amount;
                stats[user] = (stats[user] || 0n) + amount;
            });
            const entries = Object.entries(stats)
                .map(([user, amount]) => ({ user, amount: amount as bigint }))
                .sort((a, b) => Number(b.amount - a.amount))
                .slice(0, 10);
            setLeaderboard(entries);
        } catch (e) {
            console.error("Failed to fetch leaderboard:", e);
        }
    };

    const fetchRecentBets = async () => {
        try {
            const currentBlock = await publicClient.getBlockNumber();
            const fromBlock = currentBlock - 10000n;
            const logs = await publicClient.getContractEvents({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                eventName: "BetPlaced",
                args: { marketId: selectedMarketId },
                fromBlock: fromBlock,
            });
            const recent = logs
                .map((log: any) => ({
                    user: log.args.user,
                    amount: log.args.amount,
                    outcome: log.args.outcome,
                    timestamp: Date.now()
                }))
                .reverse()
                .slice(0, 10);
            setRecentBets(recent);
        } catch (e) {
            console.error("Failed to fetch recent bets:", e);
        }
    };

    const handleBet = async (outcome: boolean) => {
        setBetting(true);
        try {
            await checkAndSwitchNetwork();
            const walletClient = createWalletClient({ chain: baseSepolia, transport: custom((window as any).ethereum) });
            const [address] = await walletClient.requestAddresses();
            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "bet",
                args: [selectedMarketId, outcome],
                value: parseEther(amount),
                account: address,
                gas: 300000n
            });
            toast({ title: "Bet submitted", message: `Transaction: ${hash}`, variant: "success" });
            await fetchMarketData();
            await fetchLeaderboard();
            await fetchRecentBets();
            await earnPointsForBet(amount);

            // Prompt share to claim 2x points
            setSharePromptTxHash(hash);
            setSharePromptAmountBnb(amount);
            setSharePromptChoice(outcome ? "YES" : "NO");
            setSharePromptOpen(true);
        } catch (error: any) {
            const msg = String(error?.message || "Unknown error");
            if (msg.toLowerCase().includes("market cancelled")) {
                toast({ title: "Market cancelled", message: "This market was cancelled. Please pick another market.", variant: "warning" });
                await fetchMarketCount();
            } else {
                toast({ title: "Bet failed", message: msg, variant: "error" });
            }
        } finally {
            setBetting(false);
        }
    };

    const handleClaim = async () => {
        if (parseFloat(claimableAmount) <= 0) {
            toast({ title: "Nothing to claim", message: "Your claimable reward is 0.", variant: "warning" });
            return;
        }
        setBetting(true);
        try {
            await checkAndSwitchNetwork();
            const walletClient = createWalletClient({ chain: baseSepolia, transport: custom((window as any).ethereum) });
            const [address] = await walletClient.requestAddresses();
            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "claim",
                args: [selectedMarketId],
                account: address,
            });
            toast({ title: "Claim submitted", message: `Transaction: ${hash}`, variant: "success" });
            await fetchMarketData();
            await fetchUserBet();
        } catch (error: any) {
            toast({ title: "Claim failed", message: error?.message || "Unknown error", variant: "error" });
        } finally {
            setBetting(false);
        }
    };

    const handleResolve = async (outcome: boolean) => {
        if (adminRole !== "superadmin") {
            toast({ title: "Not authorized", message: "Only superadmin can resolve markets.", variant: "error" });
            return;
        }
        setBetting(true);
        try {
            await checkAndSwitchNetwork();
            const walletClient = createWalletClient({ chain: baseSepolia, transport: custom((window as any).ethereum) });
            const [address] = await walletClient.requestAddresses();
            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "resolveMarket",
                args: [selectedMarketId, outcome],
                account: address,
                gas: 500000n
            });
            toast({ title: "Resolve submitted", message: `Transaction: ${hash}`, variant: "success" });
            await fetchMarketData();
        } catch (error: any) {
            toast({ title: "Resolve failed", message: error?.message || "Unknown error", variant: "error" });
        } finally {
            setBetting(false);
        }
    };

    const handleEmergencyCancelMarket = async () => {
        if (!confirm(`Are you sure you want to cancel market #${selectedMarketId.toString()}?`)) return;
        setBetting(true);
        try {
            const walletClient = createWalletClient({
                chain: baseSepolia,
                transport: custom((window as any).ethereum),
            });
            const [address] = await walletClient.getAddresses();
            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "emergencyCancelMarket",
                args: [selectedMarketId],
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash });
            toast({ title: "Market cancelled", message: `Market #${selectedMarketId.toString()} was cancelled.`, variant: "success" });
            await fetchMarketCount();
            setActiveTab("market");
        } catch (e: any) {
            toast({ title: "Cancel failed", message: e?.message || "Unknown error", variant: "error" });
        }
        setBetting(false);
    };

    const handleEmergencyWithdraw = async (marketId: bigint) => {
        if (!isConnected) {
            toast({ title: "Wallet not connected", message: "Connect your wallet to withdraw.", variant: "warning" });
            return;
        }
        if (needsNetworkSwitch) {
            toast({ title: "Wrong network", message: "Switch to Base Sepolia to withdraw.", variant: "warning" });
            return;
        }
        setBetting(true);
        try {
            const walletClient = createWalletClient({
                chain: baseSepolia,
                transport: custom((window as any).ethereum),
            });
            const [address] = await walletClient.getAddresses();
            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "emergencyWithdraw",
                args: [marketId],
                account: address,
            });
            toast({ title: "Withdraw submitted", message: `Transaction: ${hash}`, variant: "success" });
            await publicClient.waitForTransactionReceipt({ hash });
            toast({ title: "Withdrawn", message: "Refund sent to your wallet.", variant: "success" });
            await fetchWalletBalance();
            await fetchUserHistory();
        } catch (e: any) {
            toast({ title: "Withdraw failed", message: e?.message || "Unknown error", variant: "error" });
        } finally {
            setBetting(false);
        }
    };

    const calculateMultiplier = (isYes: boolean) => {
        if (!market) return "1.00";
        const yes = Number(market.yesPool) / 1e18;
        const no = Number(market.noPool) / 1e18;
        const total = yes + no;
        if (isYes) {
            return yes > 0 ? (total / yes).toFixed(2) : "1.00";
        } else {
            return no > 0 ? (total / no).toFixed(2) : "1.00";
        }
    };

    const calculatePotentialProfit = (isYes: boolean) => {
        if (!amount || !market) return "0.000";
        try {
            const betAmt = parseEther(amount);
            const totalPool = BigInt(market.yesPool) + BigInt(market.noPool) + betAmt;
            const winningPool = (isYes ? BigInt(market.yesPool) : BigInt(market.noPool)) + betAmt;
            const grossReward = (betAmt * totalPool) / winningPool;
            const fee = (grossReward * 5n) / 100n;
            const netReward = grossReward - fee;
            return formatEther(netReward).slice(0, 7);
        } catch {
            return "0.000";
        }
    };

    if (loading && !market)
        return (
            <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <div className="premium-card p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="h-6 w-44 bg-slate-800/70 rounded-lg animate-pulse" />
                        <div className="h-10 w-28 bg-slate-800/70 rounded-xl animate-pulse" />
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="h-4 w-24 bg-slate-800/70 rounded animate-pulse" />
                        <div className="h-8 w-full bg-slate-800/70 rounded-xl animate-pulse" />
                        <div className="h-8 w-2/3 bg-slate-800/70 rounded-xl animate-pulse" />
                    </div>
                </div>
                <div className="premium-card p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
                        <div className="h-32 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>
        );

    if (!market && !loading) {
        return (
            <div className="w-full max-w-md p-8 premium-card text-center mx-auto">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Market Not Found</h2>
                <p className="text-slate-400 text-sm mb-6">Failed to fetch prediction data. Please ensure you are connected to Base Sepolia.</p>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 font-mono text-[10px] text-slate-500 mb-6 break-all">
                    {marketAddress}
                </div>
                <button onClick={() => window.location.reload()} className="w-full premium-btn">Try Again</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl lg:max-w-4xl mx-auto space-y-6">
            {/* Header & Wallet */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex flex-wrap gap-1">
                        {[
                            { id: "market", label: "Market" },
                            { id: "leaderboard", label: "Leaderboard" },
                            { id: "activity", label: "Activity" },
                            { id: "profile", label: "Profile" },
                            { id: "faucet", label: "Faucet" },
                            { id: "admin", label: "Admin" },
                            { id: "airdrop", label: "Airdrop", disabled: true, badge: "SOON" },
                        ].map((tab) => (
                            (tab.id !== "admin" || isAdmin) && (
                                <button
                                    key={tab.id}
                                    disabled={(tab as any).disabled}
                                    onClick={() => {
                                        if ((tab as any).disabled) return;
                                        setActiveTab(tab.id as any);
                                    }}
                                    className={`nav-tab ${(tab as any).disabled ? "opacity-40 cursor-not-allowed" : ""} ${activeTab === tab.id ? "nav-tab-active" : ""}`}
                                >
                                    <span>{tab.label}</span>
                                    {(tab as any).badge && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-white/10 text-[8px] font-black border border-white/10">
                                            {(tab as any).badge}
                                        </span>
                                    )}
                                </button>
                            )
                        ))}
                    </div>
                </div>
                <div className="flex justify-end scale-90 origin-right">
                    <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
                </div>
            </div>

            <div className="premium-card p-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12" />
                <div className="flex items-start gap-4 relative z-10">
                    <div className="mt-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 tracking-wider">
                        BETA
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white mb-1">Platform Rules & Disclaimer</div>
                        <div className="text-xs text-slate-400 leading-relaxed">
                            HolyMarket is currently in beta. All bets use Base Sepolia testnet ETH.
                            Active participation earns <span className="text-white font-bold">Protocol Points</span> which may qualify for future rewards.
                            <span className="block mt-1.5 text-slate-500 font-medium italic">Note: A 5% protocol fee applies to winning claims.</span>
                        </div>
                    </div>
                </div>
            </div>

            {needsNetworkSwitch && (
                <div className="premium-card p-4 border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                            <div className="mt-0.5 w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                <Info size={16} />
                            </div>
                            <div>
                                <div className="text-sm font-extrabold text-white">Wrong network</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    This dApp runs on <span className="font-bold text-slate-200">Base Sepolia</span>. Switch your wallet network to continue.
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => checkAndSwitchNetwork()}
                            className="premium-btn py-2 px-3 text-xs whitespace-nowrap"
                        >
                            Switch Network
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="premium-card p-6 min-h-[400px]">
                {activeTab === "market" && market && (
                    <div className="animate-in fade-in duration-500 flex flex-col h-full">
                        {/* Horizontal Market List */}
                        {(() => {
                            const nowSec = Math.floor(Date.now() / 1000);
                            const q = marketSearch.trim().toLowerCase();
                            const statusOf = (m: any) => {
                                if (m.cancelled) return "cancelled" as const;
                                if (m.resolved) return "ended" as const;
                                const end = Number(m.endTime);
                                if (Number.isFinite(end) && nowSec >= end) return "ended" as const;
                                return "live" as const;
                            };

                            const filtered = allMarkets
                                .filter((m) => {
                                    if (q && !String(m.question || "").toLowerCase().includes(q)) return false;
                                    if (marketFilter === "all") return true;
                                    return statusOf(m) === marketFilter;
                                })
                                .sort((a, b) => {
                                    if (marketSort === "volume") {
                                        const av = Number(a.yesPool + a.noPool);
                                        const bv = Number(b.yesPool + b.noPool);
                                        return bv - av;
                                    }
                                    if (marketSort === "ending") {
                                        const ae = Number(a.endTime);
                                        const be = Number(b.endTime);
                                        if (!Number.isFinite(ae) && !Number.isFinite(be)) return 0;
                                        if (!Number.isFinite(ae)) return 1;
                                        if (!Number.isFinite(be)) return -1;
                                        return ae - be;
                                    }
                                    return Number(b.id - a.id);
                                });

                            return (
                                <>
                                    <div className="p-6 rounded-[32px] bg-white/[0.02] border border-white/5 shadow-2xl mb-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-blue-500/10" />

                                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 relative z-10">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    value={marketSearch}
                                                    onChange={(e) => setMarketSearch(e.target.value)}
                                                    placeholder="Search by question..."
                                                    style={{ paddingLeft: '3rem' }}
                                                    className="w-full premium-input pr-4 py-2.5 text-sm"
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {[
                                                    { id: "all", label: "ALL" },
                                                    { id: "live", label: "LIVE" },
                                                    { id: "ended", label: "ENDED" },
                                                    { id: "cancelled", label: "CANCELLED" },
                                                ].map((btn) => (
                                                    <button
                                                        key={btn.id}
                                                        type="button"
                                                        onClick={() => setMarketFilter(btn.id as any)}
                                                        className={`px-3 py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border ${marketFilter === btn.id ? "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300"}`}
                                                    >
                                                        {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory relative z-10 px-1">
                                            {filtered.map((m) => (
                                                <button
                                                    key={m.id.toString()}
                                                    onClick={() => setSelectedMarketId(m.id)}
                                                    className={`w-[85%] flex-shrink-0 snap-center p-6 rounded-[32px] border transition-all text-left relative overflow-hidden group/card ${selectedMarketId === m.id ? "bg-blue-500/10 border-blue-500/40 shadow-2xl" : "bg-white/[0.03] border-white/5 hover:border-white/10"}`}
                                                >
                                                    {selectedMarketId === m.id && (
                                                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                                                    )}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span
                                                            className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border ${m.cancelled
                                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/10"
                                                                : m.resolved
                                                                    ? "bg-slate-800/50 text-slate-500 border-slate-700/50"
                                                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
                                                                }`}
                                                        >
                                                            {m.cancelled ? "CANCELLED" : m.resolved ? "ENDED" : "LIVE"}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-600">#{m.id.toString()}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-white line-clamp-3 mb-6 min-h-[3rem] leading-relaxed group-hover:text-blue-400 transition-colors">
                                                        {m.question}
                                                    </p>
                                                    <div className="pt-4 border-t border-white/5 space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-end">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Volume</span>
                                                                    <span className="text-sm font-black text-white">
                                                                        {(Number(m.yesPool + m.noPool) / 1e18).toFixed(3)} <span className="text-[9px] opacity-70">ETH</span>
                                                                    </span>
                                                                </div>
                                                                <div className="text-right flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                                                                    <span className="text-emerald-500">{m.yesPool + m.noPool > 0n ? Math.round(Number(m.yesPool * 100n / (m.yesPool + m.noPool))) : 50}% YES</span>
                                                                    <span className="text-slate-800">/</span>
                                                                    <span className="text-rose-500">{m.yesPool + m.noPool > 0n ? Math.round(Number(m.noPool * 100n / (m.yesPool + m.noPool))) : 50}% NO</span>
                                                                </div>
                                                            </div>
                                                            {/* Volume Visualizer */}
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                                <div
                                                                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-500"
                                                                    style={{ width: `${m.yesPool + m.noPool > 0n ? Number(m.yesPool * 100n / (m.yesPool + m.noPool)) : 50}%` }}
                                                                />
                                                                <div
                                                                    className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all duration-500"
                                                                    style={{ width: `${m.yesPool + m.noPool > 0n ? Number(m.noPool * 100n / (m.yesPool + m.noPool)) : 50}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        {m.resolved && (
                                                            <div className="text-right">
                                                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Outcome</span>
                                                                <span className={`text-[10px] font-black uppercase ${m.outcome ? "text-emerald-500" : "text-rose-500"}`}>
                                                                    {m.outcome ? "YES" : "NO"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                            {filtered.length === 0 && (
                                                <div className="w-full py-12 px-6 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 text-center">
                                                    <div className="text-sm font-bold text-slate-400">No matching markets found</div>
                                                    <div className="mt-1.5 text-xs text-slate-600">Refine your search or filters.</div>
                                                </div>
                                            )}
                                        </div>
                                    </div >
                                </>
                            );
                        })()}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 mt-4">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black tracking-widest border border-blue-500/20 uppercase">Market #{selectedMarketId.toString()}</span>
                                    {!market.resolved && (
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border uppercase ${timeLeft === "ENDED" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                                            {timeLeft === "ENDED" ? "EXPIRED" : timeLeft}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-[1.15] tracking-tight">{market.question}</h2>
                            </div>
                            <div className="flex gap-2.5 shrink-0">
                                <button
                                    onClick={() => {
                                        const shareUrl = getMarketShareUrl() || (typeof window !== "undefined" ? window.location.href : "");
                                        window.open(
                                            `https://warpcast.com/~/compose?text=Predicting on HolyMarket: ${market.question}&embeds[]=${encodeURIComponent(shareUrl)}`
                                        );
                                    }}
                                    className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                                    title="Share on Warpcast"
                                >
                                    <Share2 size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        const shareUrl = getMarketShareUrl() || (typeof window !== "undefined" ? window.location.href : "");
                                        window.open(
                                            `https://twitter.com/intent/tweet?text=I'm predicting on HolyMarket: ${market.question}&url=${encodeURIComponent(shareUrl)}`
                                        );
                                    }}
                                    className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                                    title="Share on Twitter"
                                >
                                    <Twitter size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="p-5 rounded-[24px] bg-emerald-500/[0.03] border border-emerald-500/10 flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl -mr-8 -mt-8" />
                                <span className="text-[10px] font-black text-emerald-500/70 mb-3 uppercase tracking-widest relative z-10">YES POOL • {calculateMultiplier(true)}x</span>
                                <div className="flex items-baseline gap-1.5 relative z-10">
                                    <span className="text-3xl font-black text-white">{Number(formatEther(market.yesPool)).toFixed(3)}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ETH</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-emerald-500/10 relative z-10">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Potential Payout</span>
                                    <span className="text-sm font-black text-emerald-400">{calculatePotentialProfit(true)} <span className="text-[10px] opacity-70">ETH</span></span>
                                </div>
                            </div>
                            <div className="p-5 rounded-[24px] bg-rose-500/[0.03] border border-rose-500/10 flex flex-col relative overflow-hidden group hover:border-rose-500/30 transition-all">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-2xl -mr-8 -mt-8" />
                                <span className="text-[10px] font-black text-rose-500/70 mb-3 uppercase tracking-widest relative z-10">NO POOL • {calculateMultiplier(false)}x</span>
                                <div className="flex items-baseline gap-1.5 relative z-10">
                                    <span className="text-3xl font-black text-white">{Number(formatEther(market.noPool)).toFixed(3)}</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ETH</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-rose-500/10 relative z-10">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Potential Payout</span>
                                    <span className="text-sm font-black text-rose-400">{calculatePotentialProfit(false)} <span className="text-[10px] opacity-70">ETH</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            {market.resolved ? (
                                <>
                                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className={`absolute top-0 inset-x-0 h-1 ${market.outcome ? "bg-emerald-500" : "bg-rose-500"}`} />
                                        <span className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em]">Market Result</span>
                                        <div className={`text-5xl font-black mb-8 filter drop-shadow-lg ${market.outcome ? "text-emerald-400" : "text-rose-500"}`}>
                                            {market.outcome ? "YES" : "NO"} <span className="text-3xl ml-1">✓</span>
                                        </div>

                                        <div className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-left mb-6">
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Your Final Position</div>
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase">YES Prediction</div>
                                                    <div className="text-sm font-black text-white">{userBet ? Number(formatEther(userBet.yesAmount)).toFixed(4) : "0.0000"} <span className="text-[10px] opacity-60">ETH</span></div>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase">NO Prediction</div>
                                                    <div className="text-sm font-black text-white">{userBet ? Number(formatEther(userBet.noAmount)).toFixed(4) : "0.0000"} <span className="text-[10px] opacity-60">ETH</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        {userBet?.claimed ? (
                                            <div className="w-full py-4 px-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                                Reward Successfully Claimed
                                            </div>
                                        ) : (userBet && userBet.yesAmount === 0n && userBet.noAmount === 0n) ? (
                                            <div className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-bold text-sm">
                                                No bets placed in this market
                                            </div>
                                        ) : parseFloat(claimableAmount) <= 0 ? (
                                            <div className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-500 font-bold text-sm">
                                                No winnings to claim
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleClaim}
                                                disabled={betting || needsNetworkSwitch || !isConnected}
                                                className="w-full premium-btn py-4 text-slate-950 bg-white hover:bg-slate-100 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                            >
                                                {betting ? "Processing..." : `Claim ${Number(claimableAmount).toFixed(4)} ETH Reward`}
                                            </button>
                                        )}
                                    </div>
                                    {(!isConnected || needsNetworkSwitch) && (
                                        <div className="mt-3 text-[11px] text-slate-500 text-center">
                                            Connect your wallet and switch to Base Sepolia to claim.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Prediction Amount</div>
                                            <div className="flex items-center gap-3">
                                                {walletBalanceLoading ? (
                                                    <span className="text-[10px] font-bold text-slate-500 animate-pulse">Checking balance...</span>
                                                ) : walletBalance !== null ? (
                                                    <span className="text-[10px] font-bold text-slate-500">Balance: <span className="text-slate-300">{Number(formatEther(walletBalance)).toFixed(4)}</span> ETH</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-600">Balance: —</span>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={walletBalance === null || walletBalanceLoading || needsNetworkSwitch || !isConnected}
                                                    onClick={() => {
                                                        if (walletBalance === null) return;
                                                        const reserve = parseEther("0.0003");
                                                        const max = walletBalance > reserve ? walletBalance - reserve : 0n;
                                                        if (max <= 0n) {
                                                            toast({ title: "Low Balance", message: "Insufficient ETH for gas and bet.", variant: "warning" });
                                                            return;
                                                        }
                                                        setAmount(formatEther(max));
                                                    }}
                                                    className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full premium-input py-5 text-2xl font-black pr-16 bg-white/[0.02]"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm tracking-widest">ETH</span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {["0.001", "0.005", "0.01", "0.05"].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setAmount(val)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${amount === val ? "bg-white text-slate-950 border-white" : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"}`}
                                                >
                                                    {val} ETH
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleBet(true)}
                                            disabled={betting || needsNetworkSwitch || !isConnected}
                                            className="premium-btn py-5 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] active:scale-95 disabled:grayscale"
                                        >
                                            {betting ? "Confirming..." : "PREDICT YES"}
                                        </button>
                                        <button
                                            onClick={() => handleBet(false)}
                                            disabled={betting || needsNetworkSwitch || !isConnected}
                                            className="premium-btn py-5 bg-rose-500 hover:bg-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)] active:scale-95 disabled:grayscale"
                                        >
                                            {betting ? "Confirming..." : "PREDICT NO"}
                                        </button>
                                    </div>

                                    {!isConnected && (
                                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                                            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Connect wallet to start trading</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div >
                )}

                {activeTab === "airdrop" && (
                    <div className="animate-in fade-in zoom-in duration-500 space-y-6 px-1">
                        <div className="w-full premium-card p-10 bg-gradient-to-br from-blue-600/10 to-transparent border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[120px] -mr-32 -mt-32 animate-pulse" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.5)] mx-auto flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform duration-700">
                                    <Sparkles size={48} className="animate-pulse" />
                                </div>
                                <div className="text-center space-y-4">
                                    <h3 className="text-3xl font-black text-white tracking-tight">The Holy Allocation</h3>
                                    <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.5em]">Season 1 • Active Now</p>

                                    <div className="py-8 grid grid-cols-2 gap-4 border-y border-white/5 my-8">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Your PTS</div>
                                            <div className="text-3xl font-black text-white">{userPoints}</div>
                                        </div>
                                        <div className="text-center border-l border-white/5">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Multiplier</div>
                                            <div className="text-3xl font-black text-emerald-400">1.25x</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-w-sm mx-auto">
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>Progress to Next Tier</span>
                                            <span className="text-white">65%</span>
                                        </div>
                                    </div>

                                    <button
                                        className="mt-10 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
                                        onClick={() => setShowHowToPlay(true)}
                                    >
                                        How to Farm?
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: "Early Adopter", desc: "Bet on your first market.", pts: "+500", done: userHistory.length > 0 },
                                { title: "High Roller", desc: "Wager more than 0.1 ETH.", pts: "+2500", done: parseFloat(positionsSummary.totalWageredEth) > 0.1 },
                            ].map((task, i) => (
                                <div key={i} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{task.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium">{task.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        {task.done ? (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                                <Info size={14} />
                                            </div>
                                        ) : (
                                            <span className="text-[11px] font-black text-blue-400">{task.pts}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "faucet" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4 max-w-md">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Testnet Utility</span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white mb-2">Official Faucet</h3>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                            Access the <span className="text-white font-bold">Official Coinbase Faucet</span> to request Base Sepolia ETH. This utility allows you to participate in the predictive economy by providing the necessary initial capital for testing.
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <button
                                        onClick={() => window.open("https://portal.cdp.coinbase.com/products/faucet", "_blank")}
                                        className="premium-btn px-10 py-5 bg-[#0052FF] text-white hover:bg-[#0045D9] shadow-[0_0_50px_rgba(0,82,255,0.2)] active:scale-95"
                                    >
                                        COINBASE FAUCET
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-[24px] bg-white/[0.01] border border-white/5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Network Status</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-400">Environment</span>
                                        <span className="text-white">Base Sepolia</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-400">Gas Price</span>
                                        <span className="text-emerald-400">Optimal</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-[24px] bg-white/[0.01] border border-white/5">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Requirements</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                        <span className="text-slate-400">Connected Wallet</span>
                                        <span className={`ml-auto ${isConnected ? "text-emerald-400" : "text-rose-400"}`}>{isConnected ? "YES" : "NO"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                        <span className="text-slate-400">Base Sepolia Network</span>
                                        <span className={`ml-auto ${!needsNetworkSwitch ? "text-emerald-400" : "text-rose-400"}`}>{!needsNetworkSwitch ? "YES" : "NO"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-blue-500/10" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-1">Your Dashboard</h3>
                                        <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-[0.3em]">Official Predictive Market</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Points</div>
                                            <div className="text-lg font-black text-white">{userPoints} <span className="text-[10px] text-blue-400 ml-0.5">PTS</span></div>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Activity</div>
                                            <div className="text-lg font-black text-white">{userHistory.length} <span className="text-[10px] text-blue-400 ml-0.5">BETS</span></div>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <div className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-1">Rank</div>
                                            <div className="text-lg font-black text-white">
                                                {userPoints > 10000 ? "Grandmaster" : userPoints > 5000 ? "Pro" : "Rookie"}
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Success</div>
                                            <div className="text-lg font-black text-white">
                                                {(() => {
                                                    const closedCount = positionsSummary.closedCount;
                                                    const won = userHistory.filter(h => h.resolved && ((h.outcome && h.yesAmount > 0n) || (!h.outcome && h.noAmount > 0n))).length;
                                                    return closedCount > 0 ? Math.round((won / closedCount) * 100) : 0;
                                                })()}% <span className="text-[10px] opacity-70">WON</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-16 h-16 bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] rounded-2xl flex items-center justify-center text-white">
                                    <TrendingUp size={32} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Open", value: positionsSummary.openCount },
                                { label: "Closed", value: positionsSummary.closedCount },
                                { label: "Claimable", value: positionsSummary.claimableCount, sub: `${positionsSummary.claimableTotalEth} ETH`, highlight: true },
                                { label: "Total Volume", value: positionsSummary.totalWageredEth, sub: "ETH" },
                            ].map((stat, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">{stat.label}</div>
                                    <div className={`text-2xl font-black ${stat.highlight ? "text-emerald-400" : "text-white"}`}>{stat.value}</div>
                                    {stat.sub && <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">{stat.sub}</div>}
                                </div>
                            ))}
                        </div>

                        {claimablePositions.length > 0 && (
                            <div className="p-6 rounded-[24px] bg-emerald-500/[0.03] border border-emerald-500/10">
                                <div className="flex items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Winnings Ready</h4>
                                    </div>
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-white/5 text-[9px] font-black text-slate-400 rounded-lg hover:text-white transition-colors border border-white/5"
                                        onClick={() => fetchUserHistory()}
                                    >
                                        REFRESH
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {claimablePositions.slice(0, 5).map((p) => (
                                        <button
                                            key={p.id.toString()}
                                            onClick={() => {
                                                setSelectedMarketId(p.id);
                                                setActiveTab("market");
                                            }}
                                            className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">MARKET #{p.id.toString()}</div>
                                                    <div className="text-xs font-bold text-white truncate pr-4 group-hover:text-emerald-400 transition-colors">{p.question}</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-black text-emerald-400">+{p.amountEth} <span className="text-[10px]">ETH</span></div>
                                                    <div className="text-[8px] text-emerald-500/70 font-black uppercase tracking-widest">TAP TO CLAIM</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {userAddress && (
                            <div className="p-6 rounded-[24px] bg-blue-500/[0.03] border border-blue-500/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Affiliate Network</div>
                                        <button
                                            type="button"
                                            className="px-3 py-1.5 bg-blue-500 text-[10px] font-black text-white rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                            onClick={async () => {
                                                const link = `https://baseappholymarket.xyz/?ref=${userAddress}`;
                                                try {
                                                    // Try native clipboard API first
                                                    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                                                        await navigator.clipboard.writeText(link);
                                                        toast({ title: "Copied!", message: "Your referral link is ready to share.", variant: "success" });
                                                    } else {
                                                        throw new Error('Clipboard API not available');
                                                    }
                                                } catch {
                                                    // Fallback: create temporary input and select
                                                    try {
                                                        const textArea = document.createElement('textarea');
                                                        textArea.value = link;
                                                        textArea.style.position = 'fixed';
                                                        textArea.style.left = '-9999px';
                                                        textArea.style.top = '0';
                                                        document.body.appendChild(textArea);
                                                        textArea.focus();
                                                        textArea.select();
                                                        const successful = document.execCommand('copy');
                                                        document.body.removeChild(textArea);
                                                        if (successful) {
                                                            toast({ title: "Copied!", message: "Your referral link is ready to share.", variant: "success" });
                                                        } else {
                                                            throw new Error('execCommand failed');
                                                        }
                                                    } catch {
                                                        // Final fallback: prompt user to copy manually
                                                        prompt('Copy your referral link:', link);
                                                        toast({ title: "Link Ready", message: "Please copy the link from the dialog.", variant: "info" });
                                                    }
                                                }
                                            }}
                                        >
                                            COPY LINK
                                        </button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 font-mono text-[10px] text-slate-400 break-all mb-4">
                                        {`https://baseappholymarket.xyz/?ref=${userAddress}`}
                                    </div>
                                    <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="mt-0.5 text-blue-400 h-4 w-4 shrink-0">
                                            <Info size={16} />
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                            Refer bettors and earn <span className="text-white font-bold">10%</span> of their earned points + a <span className="text-white font-bold">+50 PTS</span> initial bonus for both parties.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Bet History</h4>
                                <div className="h-px flex-1 bg-white/5 mx-4" />
                            </div>
                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                                {userHistory.map((bet, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group">
                                        <div className="space-y-1">
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">MARKET #{bet.marketId.toString()}</div>
                                            <div className={`text-xs font-black uppercase tracking-tight ${bet.outcome ? "text-emerald-400" : "text-rose-400"}`}>
                                                Predicted {bet.outcome ? "YES" : "NO"}
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                                                {Number(formatEther(bet.amount)).toFixed(4)} <span className="text-[10px] opacity-60">ETH</span>
                                            </div>
                                            <div className="text-[9px] text-slate-600 font-bold">BLOCK {bet.blockNumber.toString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {userHistory.length === 0 && (
                                    <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                        <p className="text-slate-600 font-bold text-sm uppercase tracking-widest">Vault Empty</p>
                                        <p className="text-[10px] text-slate-700 mt-2 uppercase">Your trading history starts here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "leaderboard" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white">Leaderboard</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Official Rankings</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchPoints()}
                                disabled={leaderboardLoading}
                                className="px-4 py-2 bg-white/5 text-[9px] font-black text-slate-400 rounded-xl hover:text-white border border-white/5 transition-all"
                            >
                                REFRESH DATA
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-6 py-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bettor</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cumulative Points</span>
                            </div>
                            {pointsLeaderboard.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-[20px] border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-all ${i === 0 ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-slate-950" : i === 1 ? "bg-slate-300 text-slate-900" : i === 2 ? "bg-orange-600 text-white" : "bg-white/5 text-slate-500"}`}>
                                            {i + 1}
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-bold text-white block">{entry.user.slice(0, 10)}...{entry.user.slice(-6)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <div className="text-lg font-black text-blue-400 group-hover:text-blue-300 transition-colors">{entry.points} <span className="text-[10px] text-slate-500 ml-1">PTS</span></div>
                                    </div>
                                    {i === 0 && <div className="absolute top-0 right-0 w-32 h-full bg-amber-500/5 blur-3xl -mr-16" />}
                                </div>
                            ))}
                            {pointsLeaderboard.length === 0 && (
                                <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                    <p className="text-slate-600 font-bold text-sm uppercase tracking-widest">No rankings available</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => fetchLeaderboardPage(leaderboardPage - 1)}
                                disabled={leaderboardLoading || leaderboardPage <= 1}
                                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                            >
                                PREVIOUS
                            </button>
                            <div className="px-6 py-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                PAGE <span className="text-white ml-2">{leaderboardPage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchLeaderboardPage(leaderboardPage + 1)}
                                disabled={leaderboardLoading || !leaderboardHasMore}
                                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                            >
                                NEXT
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "activity" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-white">Live Activity</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-[0.3em]">Official Market Discovery</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2.5">
                            {recentBets.length === 0 ? (
                                <div className="text-center py-24 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
                                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">Awaiting Transactions...</p>
                                </div>
                            ) : recentBets.map((bet, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-[20px] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${bet.outcome ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                                            {bet.outcome ? "YES" : "NO"}
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-white block">{bet.user.slice(0, 8)}...</span>
                                            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Market Predictive</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 relative z-10">
                                        <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">+{Number(formatEther(bet.amount)).toFixed(4)} <span className="text-[10px] opacity-60">ETH</span></div>
                                    </div>
                                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "admin" && isAdmin && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                            <div>
                                <h3 className="text-3xl font-black text-white">Admin Terminal</h3>
                                <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-[0.4em] mt-2">Protocol Governance</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    Role: Super Admin
                                </div>
                            </div>
                        </div>

                        {/* Quick Create Market */}
                        <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                Provision New Market
                            </h4>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Question</label>
                                    <input
                                        type="text"
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="Will ETH hit 5k before Feb 2026?"
                                        className="w-full premium-input bg-white/[0.01] py-4"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={targetEndTime}
                                            onChange={(e) => setTargetEndTime(e.target.value)}
                                            className="w-full premium-input bg-white/[0.01] py-4 font-sans text-xs"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={(e) => handleCreateMarket(e)}
                                            disabled={betting || needsNetworkSwitch || !isConnected}
                                            className="w-full premium-btn py-4 bg-blue-500 hover:bg-blue-400 shadow-lg shadow-blue-500/20 active:scale-95 disabled:grayscale"
                                        >
                                            {betting ? "INITIALIZING..." : "INITIALIZE MARKET"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Manage Admins */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Advisory Board</h4>
                                <div className="p-6 rounded-[28px] bg-white/[0.01] border border-white/5 space-y-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="0x... address"
                                            value={adminMgmtTarget}
                                            onChange={(e) => setAdminMgmtTarget(e.target.value)}
                                            className="flex-1 premium-input bg-transparent py-3 text-xs font-mono"
                                        />
                                        <button
                                            onClick={() => adminUpsert()}
                                            disabled={adminMgmtBusy || !adminMgmtTarget}
                                            className="px-4 py-2 bg-emerald-500 text-[10px] font-black text-white rounded-xl active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                        >
                                            {adminMgmtBusy ? "SAVING..." : "ADD"}
                                        </button>
                                        <button
                                            onClick={() => adminRemove(adminMgmtTarget)}
                                            disabled={adminMgmtBusy || !adminMgmtTarget}
                                            className="px-4 py-2 bg-rose-500 text-[10px] font-black text-white rounded-xl active:scale-95 shadow-lg shadow-rose-500/20 disabled:opacity-50"
                                        >
                                            {adminMgmtBusy ? "REMOVING..." : "REMOVE"}
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 no-scrollbar">
                                        {admins.map((a, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                <span className="text-[11px] font-mono text-slate-400">{a.address.slice(0, 16)}...</span>
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{a.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Protocols */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.3em] ml-1">Emergency Protocols</h4>
                                <div className="p-6 rounded-[28px] bg-rose-500/[0.03] border border-rose-500/10 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Active Market ID: {selectedMarketId.toString()}</label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleResolve(true)}
                                            disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                            className="py-3 bg-emerald-600 text-[9px] font-black text-white rounded-xl active:scale-95 hover:bg-emerald-500 transition-colors uppercase tracking-widest disabled:opacity-50"
                                        >
                                            RESOLVE YES
                                        </button>
                                        <button
                                            onClick={() => handleResolve(false)}
                                            disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                            className="py-3 bg-rose-600 text-[9px] font-black text-white rounded-xl active:scale-95 hover:bg-rose-500 transition-colors uppercase tracking-widest disabled:opacity-50"
                                        >
                                            RESOLVE NO
                                        </button>
                                        <button
                                            onClick={handleEmergencyCancelMarket}
                                            disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                            className="col-span-2 py-3 bg-slate-700 text-[9px] font-black text-white rounded-xl active:scale-95 hover:bg-slate-600 transition-colors uppercase tracking-widest disabled:opacity-50"
                                        >
                                            EMERGENCY VOID MARKET
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {
                sharePromptOpen && sharePromptTxHash && sharePromptAmountBnb && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 animate-in fade-in duration-300">
                        <div className="w-full max-w-sm premium-card p-10 bg-slate-950 border border-white/10 relative overflow-hidden animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(59,130,246,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />

                            <div className="w-24 h-24 rounded-[2.5rem] bg-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.4)] mx-auto flex items-center justify-center text-white mb-10">
                                <Sparkles size={48} className="animate-pulse" />
                            </div>

                            <h3 className="text-3xl font-black text-white text-center mb-3 tracking-tighter">CLAIM BOOST</h3>
                            <p className="text-[13px] text-slate-400 text-center leading-relaxed font-bold mb-10 max-w-[240px] mx-auto uppercase tracking-wider">
                                Share your prediction to <span className="text-blue-400">Double</span> your PTS allocation.
                            </p>

                            <div className="space-y-4 mb-8">
                                <button
                                    type="button"
                                    disabled={shareBoostBusy}
                                    className="w-full premium-btn py-4 bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 flex items-center justify-center gap-2 group disabled:grayscale active:scale-95 transition-all"
                                    onClick={async () => {
                                        const text = `Predicting ${sharePromptChoice} on HolyMarket: ${market?.question || ""}`;
                                        const url = getMarketShareUrl() || window.location.href;
                                        window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`);
                                        await claimShareBoost(sharePromptTxHash, sharePromptAmountBnb);
                                        setSharePromptOpen(false);
                                    }}
                                >
                                    <span className="text-xs font-black uppercase tracking-widest text-white">Share on Warpcast</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                className="w-full text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-[0.3em] transition-colors"
                                onClick={() => setSharePromptOpen(false)}
                                disabled={shareBoostBusy}
                            >
                                Skip Bonus
                            </button>
                        </div>
                    </div>
                )
            }

            {showHowToPlay && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-sm premium-card bg-slate-950 border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32" />

                        <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5 relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">How to Play</h3>
                            <button onClick={() => setShowHowToPlay(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Info size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto no-scrollbar space-y-8 relative z-10">
                            {[
                                { step: "01", title: "Connect & Faucet", desc: "Connect your wallet and use the Faucet to get free Testnet ETH. No real money required." },
                                { step: "02", title: "Predict & Bet", desc: "Choose a market and predict the outcome. More volume means higher potential rewards." },
                                { step: "03", title: "Earn PTS", desc: "Every bet earns you PTS. Share your bets on social media to double your allocation." },
                                { step: "04", title: "Claim Rewards", desc: "If your prediction is correct, claim your share of the total pool once the market ends." }
                            ].map((s, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <span className="text-2xl font-black text-blue-500/30 group-hover:text-blue-500 transition-colors duration-500">{s.step}</span>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-wider">{s.title}</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 pt-4 relative z-10">
                            <button
                                onClick={() => setShowHowToPlay(false)}
                                className="w-full premium-btn py-4 bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                Let's Holy Start
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
