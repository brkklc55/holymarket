"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http, parseEther, createWalletClient, custom, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TrendingUp, Share2, Twitter, Info } from "lucide-react";
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

    const needsNetworkSwitch = isConnected && chainId !== baseSepolia.id;

    const getShareBaseUrl = () => {
        const miniappUrl = process.env.NEXT_PUBLIC_MINIAPP_URL;
        if (miniappUrl) return miniappUrl.replace(/\/$/, "");

        if (typeof window !== "undefined") {
            const origin = window.location.origin;
            const pathname = window.location.pathname;

            // If opened inside the Farcaster/Base miniapp wrapper, prefer sharing the wrapper URL
            // so shared links look like farcaster.xyz/miniapps/... instead of the underlying app host.
            if (origin.includes("farcaster.xyz") || origin.includes("warpcast.com")) {
                return `${origin}${pathname}`.replace(/\/$/, "");
            }
        }

        const envBase = process.env.NEXT_PUBLIC_URL;
        if (envBase) return envBase.replace(/\/$/, "");
        if (typeof window !== "undefined") return window.location.origin;
        return "";
    };

    const getMarketShareUrl = () => {
        const base = getShareBaseUrl();
        if (!base) return "";
        return `${base}/?marketId=${selectedMarketId.toString()}`;
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

            const hash = await walletClient.writeContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "createMarket",
                args: [newQuestion, BigInt(newDuration)],
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="premium-card p-1.5 bg-slate-900/50">
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
                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${(tab as any).disabled ? "opacity-60 cursor-not-allowed" : ""} ${activeTab === tab.id ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                                >
                                    <span>{tab.label}</span>
                                    {(tab as any).badge && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[8px] font-black border border-slate-700">
                                            {(tab as any).badge}
                                        </span>
                                    )}
                                </button>
                            )
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
                </div>
            </div>

            <div className="premium-card p-4 bg-slate-900/30 border border-slate-800">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="mt-0.5 px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-[10px] font-black border border-sky-500/20">
                            BETA
                        </div>
                        <div>
                            <div className="text-sm font-extrabold text-white">Beta test</div>
                            <div className="text-xs text-slate-400 mt-1">
                                This app is in beta. Testnet funds are for testing only. Earned points may be used for future airdrop eligibility.
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                Winnings claims include a <span className="text-slate-200 font-bold">5%</span> protocol fee.
                            </div>
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
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                                        <div className="flex-1">
                                            <input
                                                value={marketSearch}
                                                onChange={(e) => setMarketSearch(e.target.value)}
                                                placeholder="Search markets"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setMarketFilter("all")}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${marketFilter === "all" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"}`}
                                            >
                                                ALL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMarketFilter("live")}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${marketFilter === "live" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"}`}
                                            >
                                                LIVE
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMarketFilter("ended")}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${marketFilter === "ended" ? "bg-slate-900/60 text-slate-300 border-slate-800" : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"}`}
                                            >
                                                ENDED
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMarketFilter("cancelled")}
                                                className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${marketFilter === "cancelled" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"}`}
                                            >
                                                CANCELLED
                                            </button>

                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sort</span>
                                                <select
                                                    value={marketSort}
                                                    onChange={(e) => setMarketSort(e.target.value as any)}
                                                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-[10px] font-black text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                                >
                                                    <option value="newest" className="bg-slate-950 text-slate-100">Newest</option>
                                                    <option value="ending" className="bg-slate-950 text-slate-100">Ending soon</option>
                                                    <option value="volume" className="bg-slate-950 text-slate-100">Top volume</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 overflow-x-auto pb-6 mb-6 custom-scrollbar no-scrollbar">
                                        {filtered.map((m) => (
                                            <button
                                                key={m.id.toString()}
                                                onClick={() => setSelectedMarketId(m.id)}
                                                className={`flex-shrink-0 w-48 p-3 rounded-xl border transition-all text-left ${selectedMarketId === m.id ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-900/40 hover:border-slate-700"}`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span
                                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${m.cancelled
                                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                            : m.resolved
                                                                ? "bg-slate-900/60 text-slate-400 border-slate-800"
                                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            }`}
                                                    >
                                                        {m.cancelled ? "CANCELLED" : m.resolved ? `ENDED • ${m.outcome ? "YES" : "NO"}` : "LIVE"}
                                                    </span>
                                                    <span className="text-[8px] font-mono text-slate-600">#{m.id.toString()}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-200 truncate mb-2">{m.question}</p>
                                                <div className="text-[9px] font-black text-sky-400">
                                                    {(Number(m.yesPool + m.noPool) / 1e18).toFixed(3)} ETH
                                                </div>
                                                <div className="mt-1 flex justify-between text-[9px] font-bold text-slate-500">
                                                    <span>YES {(Number(m.yesPool) / 1e18).toFixed(3)}</span>
                                                    <span>NO {(Number(m.noPool) / 1e18).toFixed(3)}</span>
                                                </div>
                                                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                                    {(() => {
                                                        const y = Number(m.yesPool);
                                                        const n = Number(m.noPool);
                                                        const total = y + n;
                                                        const pct = total > 0 ? Math.max(4, Math.min(96, (y / total) * 100)) : 50;
                                                        return <div className="h-full bg-emerald-500/70" style={{ width: `${pct}%` }} />;
                                                    })()}
                                                </div>
                                            </button>
                                        ))}
                                        {filtered.length === 0 && (
                                            <div className="flex-shrink-0 w-full p-6 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center">
                                                <div className="text-sm font-black text-slate-200">No markets found</div>
                                                <div className="mt-1 text-xs text-slate-500">Try clearing filters or search.</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 rounded text-[10px] font-extrabold uppercase border border-sky-500/20">Market #{selectedMarketId.toString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${timeLeft === "ENDED" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                                        {timeLeft === "ENDED" ? "EXPIRED" : timeLeft}
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight break-words">{market.question}</h2>
                            </div>
                            <div className="flex gap-2 md:pt-1">
                                <button
                                    onClick={() => {
                                        const shareUrl = getMarketShareUrl() || (typeof window !== "undefined" ? window.location.href : "");
                                        window.open(
                                            `https://warpcast.com/~/compose?text=Predicting on HolyMarket: ${market.question}&embeds[]=${encodeURIComponent(shareUrl)}`
                                        );
                                    }}
                                    className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                    title="Share on Warpcast"
                                >
                                    <Share2 size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const shareUrl = getMarketShareUrl() || (typeof window !== "undefined" ? window.location.href : "");
                                        window.open(
                                            `https://twitter.com/intent/tweet?text=I'm predicting on HolyMarket: ${market.question}&url=${encodeURIComponent(shareUrl)}`
                                        );
                                    }}
                                    className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                    title="Share on Twitter"
                                >
                                    <Twitter size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-tighter">YES Pool ({calculateMultiplier(true)}x)</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white">{(Number(market.yesPool) / 1e18).toFixed(3)}</span>
                                    <span className="text-xs text-slate-500 font-bold">ETH</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-emerald-500/10">
                                    <span className="text-[10px] text-slate-500 block mb-1">Potential Payout</span>
                                    <span className="text-xs font-bold text-emerald-400">{calculatePotentialProfit(true)} ETH</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col">
                                <span className="text-[10px] font-bold text-rose-500 mb-2 uppercase tracking-tighter">NO Pool ({calculateMultiplier(false)}x)</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white">{(Number(market.noPool) / 1e18).toFixed(3)}</span>
                                    <span className="text-xs text-slate-500 font-bold">ETH</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-rose-500/10">
                                    <span className="text-[10px] text-slate-500 block mb-1">Potential Payout</span>
                                    <span className="text-xs font-bold text-rose-400">{calculatePotentialProfit(false)} ETH</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            {market.resolved ? (
                                <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 flex flex-col items-center text-center">
                                    <span className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest">Winning Outcome</span>
                                    <div className={`text-4xl font-black mb-6 ${market.outcome ? "text-emerald-400" : "text-rose-500"}`}>
                                        {market.outcome ? "YES ✓" : "NO ✓"}
                                    </div>

                                    <div className="w-full p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-left mb-4">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your bet</div>
                                        <div className="mt-2 flex justify-between gap-4">
                                            <div className="text-xs font-bold text-emerald-400">YES: {userBet ? Number(formatEther(userBet.yesAmount)).toFixed(4) : "0.0000"} ETH</div>
                                            <div className="text-xs font-bold text-rose-400">NO: {userBet ? Number(formatEther(userBet.noAmount)).toFixed(4) : "0.0000"} ETH</div>
                                        </div>
                                    </div>

                                    {userBet?.claimed ? (
                                        <div className="w-full p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-sm text-slate-300 font-bold">
                                            Already claimed.
                                        </div>
                                    ) : (userBet && userBet.yesAmount === 0n && userBet.noAmount === 0n) ? (
                                        <div className="w-full p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-sm text-slate-400 font-bold">
                                            You did not place a bet in this market.
                                        </div>
                                    ) : parseFloat(claimableAmount) <= 0 ? (
                                        <div className="w-full p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-sm text-slate-400 font-bold">
                                            No winnings for this wallet.
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleClaim}
                                            disabled={betting || needsNetworkSwitch || !isConnected || parseFloat(claimableAmount) <= 0}
                                            className="w-full premium-btn py-4 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {betting ? "Processing..." : `Claim ${Number(claimableAmount).toFixed(4)} ETH Reward`}
                                        </button>
                                    )}
                                    {(!isConnected || needsNetworkSwitch) && (
                                        <div className="mt-3 text-[11px] text-slate-500">
                                            Connect your wallet and switch to Base Sepolia to claim.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</div>
                                            <div className="flex items-center gap-2">
                                                {walletBalanceLoading ? (
                                                    <span className="text-[10px] font-bold text-slate-500">Loading...</span>
                                                ) : walletBalance !== null ? (
                                                    <span className="text-[10px] font-bold text-slate-500">Available: {Number(formatEther(walletBalance)).toFixed(4)} ETH</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-600">Available: —</span>
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={walletBalance === null || walletBalanceLoading || needsNetworkSwitch || !isConnected}
                                                    onClick={() => {
                                                        if (walletBalance === null) return;
                                                        const reserve = parseEther("0.0002");
                                                        const max = walletBalance > reserve ? walletBalance - reserve : 0n;
                                                        if (max <= 0n) {
                                                            toast({ title: "Insufficient balance", message: "Not enough ETH for a bet (after gas reserve).", variant: "warning" });
                                                            return;
                                                        }
                                                        const maxStr = formatEther(max);
                                                        setAmount(maxStr);
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-extrabold text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    MAX
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: "0.001", value: "0.001" },
                                                { label: "0.005", value: "0.005" },
                                                { label: "0.01", value: "0.01" },
                                                { label: "0.05", value: "0.05" },
                                            ].map((chip) => (
                                                <button
                                                    key={chip.value}
                                                    type="button"
                                                    onClick={() => setAmount(chip.value)}
                                                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition-all ${amount === chip.value ? "bg-sky-500/15 text-sky-300 border-sky-500/30" : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"}`}
                                                >
                                                    {chip.label} ETH
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full premium-input py-4 text-xl pr-16 bg-slate-900/80"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">ETH</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleBet(true)}
                                            disabled={betting || needsNetworkSwitch || !isConnected}
                                            className={`premium-btn py-4 bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 ${betting || needsNetworkSwitch || !isConnected ? "opacity-60 cursor-not-allowed hover:transform-none" : ""}`}
                                        >
                                            {betting ? "Processing..." : "VOTE YES"}
                                        </button>
                                        <button
                                            onClick={() => handleBet(false)}
                                            disabled={betting || needsNetworkSwitch || !isConnected}
                                            className={`premium-btn py-4 bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/20 ${betting || needsNetworkSwitch || !isConnected ? "opacity-60 cursor-not-allowed hover:transform-none" : ""}`}
                                        >
                                            {betting ? "Processing..." : "VOTE NO"}
                                        </button>
                                    </div>
                                    {!isConnected && (
                                        <div className="text-center text-xs text-slate-500">
                                            Connect your wallet to place a vote.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "airdrop" && (
                    <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[360px] text-center">
                        <div className="w-full max-w-md premium-card p-8 bg-slate-900/40">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700 mx-auto flex items-center justify-center text-slate-300 font-black text-lg">
                                ⏳
                            </div>
                            <h3 className="mt-5 text-xl font-black text-white">Airdrop</h3>
                            <p className="mt-2 text-sm text-slate-400">Soon.</p>
                            <div className="mt-6 text-[11px] text-slate-500">
                                This section is disabled during test phase.
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "faucet" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Faucet</h3>
                                <div className="mt-1 text-[11px] text-slate-500">
                                    Need test ETH to place bets? Use a faucet and fund your wallet.
                                </div>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20">
                                TESTNET
                            </span>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                            <div className="mt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a
                                    href="https://portal.cdp.coinbase.com/products/faucet"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all"
                                >
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Official</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">Base Sepolia Faucet</div>
                                    <div className="mt-1 text-[11px] text-slate-500">portal.cdp.coinbase.com</div>
                                </a>
                                <a
                                    href="https://thirdweb.com/base-sepolia-testnet"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all"
                                >
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alt</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">Base Sepolia Faucet</div>
                                    <div className="mt-1 text-[11px] text-slate-500">thirdweb.com</div>
                                </a>
                            </div>

                            <div className="mt-4 p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your wallet address</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 font-mono text-[11px] text-slate-300 break-all">
                                        {userAddress ? userAddress : "Connect your wallet to copy your address"}
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!userAddress}
                                        className="premium-btn py-2 px-3 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                                        onClick={async () => {
                                            if (!userAddress) return;
                                            try {
                                                await navigator.clipboard.writeText(userAddress);
                                                toast({ title: "Copied", message: "Wallet address copied.", variant: "success" });
                                            } catch {
                                                toast({ title: "Copy failed", message: userAddress, variant: "warning" });
                                            }
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-2 text-[11px] text-slate-500">
                                    Make sure your wallet network is set to <span className="text-slate-200 font-bold">Base Sepolia</span>.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="p-6 rounded-3xl bg-sky-500/10 border border-sky-500/20 mb-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-white mb-1">Your Dashboard</h3>
                                <p className="text-xs text-sky-400 font-bold uppercase tracking-widest">{userHistory.length} Predictions Made</p>
                                <p className="text-[11px] text-slate-300 font-bold mt-2">Points: <span className="text-white">{userPoints}</span></p>
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Points are important for future airdrops. Winnings claims have a <span className="text-slate-200 font-bold">5%</span> protocol fee.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Open</div>
                                <div className="mt-2 text-xl font-black text-white">{positionsSummary.openCount}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Closed</div>
                                <div className="mt-2 text-xl font-black text-white">{positionsSummary.closedCount}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claimable</div>
                                <div className="mt-2 text-xl font-black text-white">{positionsSummary.claimableCount}</div>
                                <div className="mt-1 text-[11px] text-slate-500">{positionsSummary.claimableTotalEth} ETH</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total wagered</div>
                                <div className="mt-2 text-xl font-black text-white">{positionsSummary.totalWageredEth}</div>
                                <div className="mt-1 text-[11px] text-slate-500">ETH</div>
                            </div>
                        </div>

                        {claimablePositions.length > 0 && (
                            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-xs font-extrabold text-white">Claimable</div>
                                        <div className="mt-1 text-[11px] text-slate-500">Tap a market to claim your winnings.</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                                        onClick={() => {
                                            fetchUserHistory();
                                        }}
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {claimablePositions.slice(0, 20).map((p) => (
                                        <button
                                            key={p.id.toString()}
                                            type="button"
                                            onClick={() => {
                                                setSelectedMarketId(p.id);
                                                setActiveTab("market");
                                            }}
                                            className="w-full text-left p-4 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market #{p.id.toString()}</div>
                                                    <div className="mt-1 text-xs font-bold text-slate-200 truncate">{p.question}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-emerald-400">{p.amountEth} ETH</div>
                                                    <div className="text-[10px] text-slate-600 font-bold">CLAIM</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {userAddress && (
                            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your referral link</div>
                                        <div className="mt-2 font-mono text-[11px] text-slate-300 break-all">
                                            {`${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${userAddress}`}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="premium-btn py-2 px-3 text-xs"
                                        onClick={async () => {
                                            const link = `${window.location.origin}/?ref=${userAddress}`;
                                            try {
                                                await navigator.clipboard.writeText(link);
                                                toast({ title: "Copied", message: "Referral link copied.", variant: "success" });
                                            } catch {
                                                toast({ title: "Copy failed", message: link, variant: "warning" });
                                            }
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="mt-3 text-[11px] text-slate-500">
                                    When someone joins with your link: both sides get <span className="text-slate-200 font-bold">+50</span> points.
                                    You also earn <span className="text-slate-200 font-bold">10%</span> of their future points.
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Betting History</h4>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {userHistory.map((bet, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-bold mb-1">MARKET #{bet.marketId.toString()}</span>
                                            <span className={`text-xs font-black ${bet.outcome ? "text-emerald-400" : "text-rose-400"}`}>
                                                Voted {bet.outcome ? "YES" : "NO"}
                                            </span>
                                            {(() => {
                                                const idStr = bet.marketId.toString();
                                                const ub = historyUserBets[idStr];
                                                const withdrawable = ub ? ub.yesAmount + ub.noAmount : 0n;
                                                const cancelled = Boolean(historyCancelled[idStr]);
                                                const show = cancelled && ub && !ub.claimed && withdrawable > 0n;
                                                if (!show) return null;
                                                return (
                                                    <button
                                                        type="button"
                                                        disabled={betting || needsNetworkSwitch || !isConnected}
                                                        onClick={() => handleEmergencyWithdraw(bet.marketId)}
                                                        className="mt-2 inline-flex w-fit px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold hover:bg-amber-500/15 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        Emergency Withdraw
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-black text-white">{Number(formatEther(bet.amount)).toFixed(4)} ETH</span>
                                            <span className="block text-[10px] text-slate-600">Block #{bet.blockNumber.toString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {userHistory.length === 0 && (
                                    <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                        <p className="text-slate-500 text-sm">No activity found for this wallet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "leaderboard" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                            <button
                                type="button"
                                onClick={() => fetchPoints()}
                                disabled={leaderboardLoading}
                                className="px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                            >
                                Refresh
                            </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                            Points are tracked for potential future airdrops. Winnings claims have a <span className="text-slate-200 font-bold">5%</span> protocol fee.
                        </div>
                        <div className="space-y-2">
                            {pointsLeaderboard.map((entry, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${i === 0 ? "bg-amber-500/20 text-amber-500" : i === 1 ? "bg-slate-300/20 text-slate-300" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-slate-800 text-slate-500"}`}>
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-mono text-slate-300">{entry.user.slice(0, 8)}...{entry.user.slice(-4)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-sky-400">{entry.points}</span>
                                        <span className="text-[10px] text-slate-600 ml-1 font-bold">PTS</span>
                                    </div>
                                </div>
                            ))}
                            {pointsLeaderboard.length === 0 && (
                                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                    <p className="text-slate-500 text-sm">No points yet.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => fetchLeaderboardPage(leaderboardPage - 1)}
                                disabled={leaderboardLoading || leaderboardPage <= 1}
                                className="flex-1 py-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <div className="px-3 py-2 rounded-xl bg-slate-900/30 border border-slate-800 text-xs font-bold text-slate-400">
                                Page {leaderboardPage}
                            </div>
                            <button
                                type="button"
                                onClick={() => fetchLeaderboardPage(leaderboardPage + 1)}
                                disabled={leaderboardLoading || !leaderboardHasMore}
                                className="flex-1 py-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "activity" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Live Activity</h3>
                            <div className="flex items-center gap-1.5 bg-sky-500/10 px-2 py-1 rounded-full text-sky-500 text-[10px] font-bold">
                                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></div>
                                LIVE
                            </div>
                        </div>
                        <div className="space-y-3">
                            {recentBets.length === 0 ? (
                                <p className="text-slate-500 text-center py-20">Monitoring blockchain activity...</p>
                            ) : recentBets.map((bet, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-800 transition-all hover:bg-slate-900/50">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${bet.outcome ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                                            {bet.outcome ? "YES" : "NO"}
                                        </span>
                                        <span className="text-xs font-mono text-slate-400">{bet.user.slice(0, 6)}...</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-white">+{Number(formatEther(bet.amount)).toFixed(4)} ETH</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "admin" && (
                    <div className="space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Admin Access</h3>
                                    <div className="mt-2 text-xs text-slate-400">
                                        Your role: <span className="text-slate-200 font-bold">{adminRole ? adminRole : "none"}</span>
                                    </div>
                                    <div className="mt-1 text-[11px] text-slate-500">
                                        Only <span className="text-slate-200 font-bold">superadmin</span> can add/remove admins or change roles.
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        fetchAdminRole();
                                        fetchAdmins();
                                    }}
                                    disabled={!userAddress || !adminRole}
                                    className="px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-400 hover:text-white hover:border-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Refresh
                                </button>
                            </div>

                            {!adminRole && (
                                <div className="mt-6 text-[11px] text-slate-500">
                                    You don't have admin access.
                                </div>
                            )}

                            {adminRole && (
                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admins</div>
                                            <div className="text-[10px] font-bold text-slate-600">{admins.length}</div>
                                        </div>
                                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                            {admins.map((a) => (
                                                <div key={a.address} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-mono text-slate-300 truncate">{a.address}</div>
                                                        <div className="mt-1">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${a.role === "superadmin"
                                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                    : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                                                    }`}
                                                            >
                                                                {a.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={adminRole !== "superadmin" || adminMgmtBusy}
                                                        onClick={() => adminRemove(a.address)}
                                                        className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-extrabold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            {admins.length === 0 && (
                                                <div className="text-center py-10 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                                                    <p className="text-slate-500 text-xs">No admins found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Add / Update Admin</div>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Wallet address</label>
                                                <input
                                                    value={adminMgmtTarget}
                                                    onChange={(e) => setAdminMgmtTarget(e.target.value)}
                                                    placeholder="0x..."
                                                    className="w-full premium-input focus:bg-slate-900"
                                                    disabled={adminRole !== "superadmin" || adminMgmtBusy}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Role</label>
                                                <select
                                                    value={adminMgmtRole}
                                                    onChange={(e) => setAdminMgmtRole(e.target.value as any)}
                                                    className="w-full premium-input focus:bg-slate-900"
                                                    disabled={adminRole !== "superadmin" || adminMgmtBusy}
                                                >
                                                    <option value="admin">admin</option>
                                                    <option value="superadmin">superadmin</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => adminUpsert()}
                                                disabled={adminRole !== "superadmin" || adminMgmtBusy || !adminMgmtTarget.trim()}
                                                className="w-full premium-btn py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {adminMgmtBusy ? "Saving..." : "Save Admin"}
                                            </button>

                                            {adminRole !== "superadmin" && (
                                                <div className="text-[11px] text-slate-500">
                                                    You need <span className="text-slate-200 font-bold">superadmin</span> role to manage admins.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                            <h3 className="text-lg font-bold text-white mb-6">New Discovery Market</h3>
                            <form onSubmit={handleCreateMarket} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Market Question</label>
                                    <input
                                        type="text"
                                        required
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="e.g., Will BTC hit $100k this month?"
                                        className="w-full premium-input focus:bg-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Days</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={durationDays}
                                                onChange={(e) => setDurationDays(e.target.value)}
                                                className="w-full premium-input focus:bg-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Hours</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={durationHours}
                                                onChange={(e) => setDurationHours(e.target.value)}
                                                className="w-full premium-input focus:bg-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">Minutes</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={durationMinutes}
                                                onChange={(e) => setDurationMinutes(e.target.value)}
                                                className="w-full premium-input focus:bg-slate-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800 flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total seconds</div>
                                        <div className="text-xs font-mono text-slate-300">{newDuration}</div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-5 gap-2">
                                        <button type="button" onClick={() => setDurationPresetSeconds(15 * 60)} className="py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">15m</button>
                                        <button type="button" onClick={() => setDurationPresetSeconds(60 * 60)} className="py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">1h</button>
                                        <button type="button" onClick={() => setDurationPresetSeconds(6 * 60 * 60)} className="py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">6h</button>
                                        <button type="button" onClick={() => setDurationPresetSeconds(24 * 60 * 60)} className="py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">24h</button>
                                        <button type="button" onClick={() => setDurationPresetSeconds(7 * 24 * 60 * 60)} className="py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">7d</button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                    className="w-full premium-btn py-4 shadow-xl shadow-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {betting ? "Simulating..." : "Launch Discovery Market "}
                                </button>

                                {(!isConnected || needsNetworkSwitch) && (
                                    <div className="mt-4 text-[11px] text-slate-500">
                                        Connect your wallet and switch to Base Sepolia to use admin actions.
                                    </div>
                                )}
                                {isConnected && !needsNetworkSwitch && adminRole !== "superadmin" && (
                                    <div className="mt-4 text-[11px] text-slate-500">
                                        Only <span className="text-slate-200 font-bold">superadmin</span> can create markets.
                                    </div>
                                )}
                            </form>
                        </div>

                        {!market?.resolved && (
                            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                                <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-widest text-center">Resolve Market Discovery</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleResolve(true)}
                                        disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                        className="py-3 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        YES Outcome
                                    </button>
                                    <button
                                        onClick={() => handleResolve(false)}
                                        disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                        className="py-3 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        NO Outcome
                                    </button>
                                </div>
                                {isConnected && !needsNetworkSwitch && adminRole !== "superadmin" && (
                                    <div className="mt-4 text-[11px] text-slate-500">
                                        Only <span className="text-slate-200 font-bold">superadmin</span> can resolve markets.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <h3 className="text-sm font-bold text-rose-500 mb-4 uppercase tracking-widest">Protocol Safety</h3>
                            <button
                                onClick={handleEmergencyCancelMarket}
                                disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                className="w-full py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                CANCEL SELECTED MARKET
                            </button>
                            {isConnected && !needsNetworkSwitch && adminRole !== "superadmin" && (
                                <div className="mt-4 text-[11px] text-slate-500">
                                    Only <span className="text-slate-200 font-bold">superadmin</span> can use emergency actions.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {sharePromptOpen && sharePromptTxHash && sharePromptAmountBnb && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md premium-card p-6 border border-slate-800 bg-slate-950">
                        <div className="text-lg font-extrabold text-white">Claim 2x points</div>
                        <div className="mt-2 text-sm text-slate-400">
                            Share your bet on Twitter, Farcaster, or Base to claim a one-time 2x points bonus for this bet.
                        </div>
                        <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bet tx</div>
                            <div className="mt-1 text-xs font-mono text-slate-300 break-all">{sharePromptTxHash}</div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                disabled={shareBoostBusy}
                                className="w-full premium-btn py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={async () => {
                                    const text = `I just placed a prediction on HolyMarket: ${market?.question || ""}`;
                                    const url = getMarketShareUrl() || window.location.href;
                                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                                    await claimShareBoost(sharePromptTxHash, sharePromptAmountBnb);
                                    setSharePromptOpen(false);
                                }}
                            >
                                Share on Twitter + Claim 2x
                            </button>

                            <button
                                type="button"
                                disabled={shareBoostBusy}
                                className="w-full premium-btn py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={async () => {
                                    const text = `Predicting on HolyMarket: ${market?.question || ""}`;
                                    const url = getMarketShareUrl() || window.location.href;
                                    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`);
                                    await claimShareBoost(sharePromptTxHash, sharePromptAmountBnb);
                                    setSharePromptOpen(false);
                                }}
                            >
                                Share on Farcaster + Claim 2x
                            </button>

                            <button
                                type="button"
                                disabled={shareBoostBusy}
                                className="w-full premium-btn py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={async () => {
                                    const text = `I just placed a prediction on HolyMarket: ${market?.question || ""}`;
                                    const url = getMarketShareUrl() || window.location.href;
                                    window.open(`https://base.app/?text=${encodeURIComponent(text)}`);
                                    await claimShareBoost(sharePromptTxHash, sharePromptAmountBnb);
                                    setSharePromptOpen(false);
                                }}
                            >
                                Share on Base + Claim 2x
                            </button>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                className="flex-1 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-900 transition-all"
                                onClick={() => {
                                    setSharePromptOpen(false);
                                }}
                                disabled={shareBoostBusy}
                            >
                                Skip
                            </button>
                        </div>
                        <div className="mt-3 text-[11px] text-slate-500">
                            Note: This bonus is best-effort and can be claimed once per bet transaction.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
