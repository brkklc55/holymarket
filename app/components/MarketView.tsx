"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http, parseEther, createWalletClient, custom, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { User, History, TrendingUp, Share2, Twitter, Info } from "lucide-react";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "../constants";
import { useToast } from "./ui/ToastProvider";

export default function MarketView() {
    const { address: userAddress, isConnected } = useAccount();
    const chainId = useChainId();
    const { toast } = useToast();
    const [selectedMarketId, setSelectedMarketId] = useState<bigint>(1n);
    const [marketCount, setMarketCount] = useState<bigint>(0n);
    const [resetAfterMarketId, setResetAfterMarketId] = useState<bigint>(0n);
    const [market, setMarket] = useState<any>(null);
    const [allMarkets, setAllMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [betting, setBetting] = useState(false);
    const [amount, setAmount] = useState("0.001");
    const [walletBalance, setWalletBalance] = useState<bigint | null>(null);
    const [walletBalanceLoading, setWalletBalanceLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"market" | "leaderboard" | "activity" | "airdrop" | "tasks" | "admin" | "list" | "profile">("market");
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

    const marketAddress = (process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || PREDICTION_MARKET_ADDRESS) as `0x${string}`;

    const [userPoints, setUserPoints] = useState<number>(0);
    const [pointsLeaderboard, setPointsLeaderboard] = useState<Array<{ user: string; points: number }>>([]);

    const [tasks, setTasks] = useState<any[]>([]);
    const [taskClaims, setTaskClaims] = useState<Record<string, boolean>>({});
    const [taskStats, setTaskStats] = useState<{ points: number; volumeBnb: number; followTasks: number } | null>(null);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [taskClaimBusy, setTaskClaimBusy] = useState<Record<string, boolean>>({});
    const [taskOpened, setTaskOpened] = useState<Record<string, boolean>>({});

    // Admin Task Creation State
    const [adminTasks, setAdminTasks] = useState<any[]>([]);
    const [taskFormId, setTaskFormId] = useState("");
    const [taskFormType, setTaskFormType] = useState<"link" | "follow" | "checkin">("link");
    const [taskFormRepeat, setTaskFormRepeat] = useState<"none" | "daily">("none");
    const [taskFormTitle, setTaskFormTitle] = useState("");
    const [taskFormDescription, setTaskFormDescription] = useState("");
    const [taskFormUrl, setTaskFormUrl] = useState("");
    const [taskFormPoints, setTaskFormPoints] = useState("50");
    const [taskFormActive, setTaskFormActive] = useState(true);
    const [taskFormStartAt, setTaskFormStartAt] = useState("");
    const [taskFormEndAt, setTaskFormEndAt] = useState("");
    const [taskReqMinPoints, setTaskReqMinPoints] = useState("");
    const [taskReqMinVolumeBnb, setTaskReqMinVolumeBnb] = useState("");
    const [taskReqMinFollowTasks, setTaskReqMinFollowTasks] = useState("");
    const [adminTaskBusy, setAdminTaskBusy] = useState(false);

    // Admin Creation State
    const [newQuestion, setNewQuestion] = useState("");
    const [newDuration, setNewDuration] = useState("3600"); // 1 hour default

    const needsNetworkSwitch = isConnected && chainId !== baseSepolia.id;

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

    const toLocalDateTimeInput = (iso?: string | null) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        const pad = (n: number) => String(n).padStart(2, "0");
        const y = d.getFullYear();
        const m = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hh = pad(d.getHours());
        const mm = pad(d.getMinutes());
        return `${y}-${m}-${day}T${hh}:${mm}`;
    };

    const normalizeDateInputToIso = (value: string) => {
        const v = value.trim();
        if (!v) return undefined;
        // If user pasted an ISO string with timezone, keep it.
        if (v.endsWith("Z") || /[+-]\d\d:\d\d$/.test(v)) return v;
        // datetime-local (no timezone) => interpret as local time and convert to UTC ISO
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return undefined;
        return d.toISOString();
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

    const fetchTasks = async () => {
        setTasksLoading(true);
        try {
            const params = new URLSearchParams({ tasks: "1" });
            if (userAddress) params.set("user", userAddress);
            const res = await fetch(`/api/points?${params.toString()}`, {
                cache: "no-store",
                headers: { "x-device-id": getDeviceId() },
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                toast({ title: "Failed to load tasks", message: json?.error || "Unknown error", variant: "error" });
                return;
            }
            setTasks(Array.isArray(json?.tasks) ? json.tasks : []);
            setTaskClaims(json?.claims && typeof json.claims === "object" ? json.claims : {});
            setTaskStats(json?.stats || null);
        } catch (e: any) {
            toast({ title: "Failed to load tasks", message: e?.message || "Unknown error", variant: "error" });
        } finally {
            setTasksLoading(false);
        }
    };

    const taskOpenedKey = (addr: string) => `holymarket_tasks_opened_v1_${addr.toLowerCase()}`;

    const loadTaskOpened = (addr?: string | null) => {
        if (!addr) {
            setTaskOpened({});
            return;
        }
        try {
            const raw = window.localStorage.getItem(taskOpenedKey(addr));
            const parsed = raw ? JSON.parse(raw) : {};
            if (parsed && typeof parsed === "object") {
                const map: Record<string, boolean> = {};
                for (const [k, v] of Object.entries(parsed)) {
                    map[String(k)] = Boolean(v);
                }
                setTaskOpened(map);
            } else {
                setTaskOpened({});
            }
        } catch {
            setTaskOpened({});
        }
    };

    const markTaskOpened = (taskId: string) => {
        if (!userAddress) return;
        try {
            const key = taskOpenedKey(userAddress);
            const raw = window.localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : {};
            const next = { ...(parsed && typeof parsed === "object" ? parsed : {}), [taskId]: true };
            window.localStorage.setItem(key, JSON.stringify(next));
            setTaskOpened((p) => ({ ...p, [taskId]: true }));
        } catch {
            setTaskOpened((p) => ({ ...p, [taskId]: true }));
        }
    };

    const claimTask = async (taskId: string) => {
        if (!userAddress) {
            toast({ title: "Wallet not connected", message: "Connect your wallet to claim tasks.", variant: "warning" });
            return;
        }
        setTaskClaimBusy((p) => ({ ...p, [taskId]: true }));
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "taskClaim", user: userAddress, taskId }),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                toast({ title: "Task claim failed", message: json?.error || "Unknown error", variant: "error" });
                return;
            }
            if (json?.skipped) {
                toast({ title: "Already claimed", message: "You already claimed this task.", variant: "warning" });
            } else {
                toast({ title: "Task claimed", message: `+${json?.awarded ?? ""} points awarded.`, variant: "success" });
            }
            await fetchTasks();
            await fetchPoints();
        } catch (e: any) {
            toast({ title: "Task claim failed", message: e?.message || "Unknown error", variant: "error" });
        } finally {
            setTaskClaimBusy((p) => ({ ...p, [taskId]: false }));
        }
    };

    const fetchAdminTasks = async () => {
        if (!userAddress || !adminRole) return;
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "adminTaskList", adminAddress: userAddress }),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) return;
            setAdminTasks(Array.isArray(json?.tasks) ? json.tasks : []);
        } catch {
            // ignore
        }
    };

    const adminTaskUpsert = async () => {
        if (!userAddress || !adminRole) {
            toast({ title: "Not authorized", message: "Admin role required.", variant: "error" });
            return;
        }
        setAdminTaskBusy(true);
        try {
            const requirements: any = {};
            if (taskReqMinPoints.trim()) requirements.minPoints = Number(taskReqMinPoints);
            if (taskReqMinVolumeBnb.trim()) requirements.minVolumeBnb = Number(taskReqMinVolumeBnb);
            if (taskReqMinFollowTasks.trim()) requirements.minFollowTasks = Number(taskReqMinFollowTasks);
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({
                    action: "adminTaskUpsert",
                    adminAddress: userAddress,
                    id: taskFormId.trim() || undefined,
                    type: taskFormType,
                    repeat: taskFormRepeat,
                    title: taskFormTitle,
                    description: taskFormDescription,
                    url: taskFormUrl,
                    points: Number(taskFormPoints),
                    active: taskFormActive,
                    startAt: normalizeDateInputToIso(taskFormStartAt),
                    endAt: normalizeDateInputToIso(taskFormEndAt),
                    requirements,
                }),
            });
            const text = await res.text();
            const json = (() => {
                try {
                    return text ? JSON.parse(text) : null;
                } catch {
                    return null;
                }
            })();
            if (!res.ok) {
                const msg = json?.error || (text ? text.slice(0, 160) : `HTTP ${res.status}`);
                toast({ title: "Task save failed", message: msg, variant: "error" });
                return;
            }
            toast({ title: "Task saved", message: "Task updated.", variant: "success" });
            setTaskFormId("");
            setTaskFormTitle("");
            setTaskFormDescription("");
            setTaskFormUrl("");
            setTaskFormPoints("50");
            setTaskFormActive(true);
            setTaskFormRepeat("none");
            setTaskFormStartAt("");
            setTaskFormEndAt("");
            setTaskReqMinPoints("");
            setTaskReqMinVolumeBnb("");
            setTaskReqMinFollowTasks("");
            await fetchAdminTasks();
        } catch (e: any) {
            toast({ title: "Task save failed", message: e?.message || "Unknown error", variant: "error" });
        } finally {
            setAdminTaskBusy(false);
        }
    };

    const adminTaskRemove = async (id: string) => {
        if (!userAddress || !adminRole) return;
        if (!confirm("Remove this task?")) return;
        setAdminTaskBusy(true);
        try {
            const res = await fetch("/api/points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-device-id": getDeviceId(),
                },
                body: JSON.stringify({ action: "adminTaskRemove", adminAddress: userAddress, id }),
            });
            const json = await res.json().catch(() => null);
            if (!res.ok) {
                toast({ title: "Remove failed", message: json?.error || "Unknown error", variant: "error" });
                return;
            }
            toast({ title: "Task removed", message: "Task deleted.", variant: "success" });
            await fetchAdminTasks();
        } finally {
            setAdminTaskBusy(false);
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
        try {
            const url = userAddress ? `/api/points?user=${encodeURIComponent(userAddress)}` : "/api/points";
            const res = await fetch(url, {
                cache: "no-store",
                headers: typeof window !== "undefined" ? { "x-device-id": getDeviceId() } : undefined,
            });
            if (!res.ok) return;
            const json = await res.json();
            setPointsLeaderboard(json.leaderboard || []);
            if (json.user?.points !== undefined && json.user?.points !== null) {
                setUserPoints(Number(json.user.points) || 0);
            } else if (!userAddress) {
                setUserPoints(0);
            }
        } catch (e) {
            console.error("Failed to fetch points:", e);
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
        transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
    });

    useEffect(() => {
        init();
    }, []);

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
        fetchHistoryUserBets(userHistory as any[], resetAfterMarketId);
    }, [userHistory, resetAfterMarketId, userAddress]);

    useEffect(() => {
        fetchWalletBalance();
    }, [isConnected, needsNetworkSwitch]);

    useEffect(() => {
        if (activeTab === "admin" && userAddress && adminRole) {
            fetchAdmins();
            fetchAdminTasks();
        }
    }, [activeTab, userAddress, adminRole]);

    useEffect(() => {
        if (activeTab === "tasks") {
            fetchTasks();
            loadTaskOpened(userAddress);
        }
    }, [activeTab, userAddress]);

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

    const fetchHistoryUserBets = async (history: any[], resetAfter: bigint) => {
        if (!userAddress || !history || history.length === 0) {
            setHistoryUserBets({});
            return;
        }
        try {
            const next: Record<string, { yesAmount: bigint; noAmount: bigint; claimed: boolean }> = {};
            const ids = Array.from(new Set(history.map((h) => (h.marketId as bigint).toString())));
            for (const idStr of ids) {
                const id = BigInt(idStr);
                if (id > resetAfter) continue;
                try {
                    const res = await publicClient.readContract({
                        address: marketAddress,
                        abi: PREDICTION_MARKET_ABI,
                        functionName: "getUserBet",
                        args: [id, userAddress as `0x${string}`],
                    });
                    const [yesAmount, noAmount, claimed] = res as unknown as [bigint, bigint, boolean];
                    next[idStr] = { yesAmount, noAmount, claimed };
                } catch (e: any) {
                    const msg = String(e?.shortMessage || e?.message || "");
                    if (msg.toLowerCase().includes("market reset")) {
                        continue;
                    }
                    console.error("Failed to fetch getUserBet for market", idStr, e);
                }
            }
            setHistoryUserBets(next);
        } catch (e) {
            console.error("Failed to fetch history user bets:", e);
        }
    };

    const fetchMarketCount = async () => {
        try {
            const resetAfter = (await publicClient.readContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "resetAfterMarketId",
            })) as bigint;
            const count = await publicClient.readContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "marketCount",
            });
            const c = count as bigint;
            setResetAfterMarketId(resetAfter);
            setMarketCount(c);

            const firstActive = resetAfter + 1n;
            if (c > 0n) {
                setSelectedMarketId((prev) => {
                    if (!prev || prev <= resetAfter) return firstActive;
                    if (prev > c) return firstActive;
                    return prev;
                });
            }

            fetchAllMarkets(c, resetAfter);
        } catch (e) {
            console.error("Failed to fetch market count:", e);
        }
    };

    const fetchAllMarkets = async (count: bigint, resetAfter: bigint = resetAfterMarketId) => {
        try {
            const markets = [];
            const firstActive = resetAfter + 1n;
            const start = count > 10n ? count - 9n : 1n;
            const effectiveStart = start < firstActive ? firstActive : start;
            if (effectiveStart > count) {
                setAllMarkets([]);
                return;
            }
            for (let i = count; i >= effectiveStart; i--) {
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
                    outcome: data[5]
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
                    const m = Math.floor(diff / 60);
                    const s = diff % 60;
                    setTimeLeft(`${m}M ${s}S`);
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
                                        rpcUrls: ['https://sepolia.base.org'],
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
                outcome: data[5]
            });
        } catch (e) {
            console.error("Failed to fetch market:", e);
        } finally {
            setLoading(false);
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
            if (msg.toLowerCase().includes("market reset")) {
                toast({ title: "Market was reset", message: "This market is no longer active. Please pick the latest market.", variant: "warning" });
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

    const handleEmergencyReset = async () => {
        if (!confirm("Are you sure you want to reset all markets?")) return;
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
                functionName: "emergencyReset",
                account: address,
            });
            await publicClient.waitForTransactionReceipt({ hash });
            toast({ title: "Markets reset", message: "All markets were reset.", variant: "success" });
            await fetchMarketCount();
            setActiveTab("market");
        } catch (e: any) {
            toast({ title: "Reset failed", message: e?.message || "Unknown error", variant: "error" });
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
                <div className="premium-card p-1.5 bg-slate-900/50 overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 min-w-max">
                    {[
                        { id: "market", label: "Market" },
                        { id: "leaderboard", label: "Leaderboard" },
                        { id: "activity", label: "Activity" },
                        { id: "airdrop", label: "Airdrop", disabled: true, badge: "SOON" },
                        { id: "tasks", label: "Tasks" },
                        { id: "profile", label: "Profile" },
                        { id: "admin", label: "Admin" }
                    ].map((tab) => (
                        (tab.id !== "admin" || isAdmin) && (
                            <button
                                key={tab.id}
                                disabled={(tab as any).disabled}
                                onClick={() => {
                                    if ((tab as any).disabled) return;
                                    setActiveTab(tab.id as any);
                                }}
                                className={`flex-none px-3 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${(tab as any).disabled ? "opacity-60 cursor-not-allowed" : ""} ${activeTab === tab.id ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
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
                        <div className="flex gap-3 overflow-x-auto pb-6 mb-6 custom-scrollbar no-scrollbar">
                            {allMarkets.map((m) => (
                                <button
                                    key={m.id.toString()}
                                    onClick={() => setSelectedMarketId(m.id)}
                                    className={`flex-shrink-0 w-48 p-3 rounded-xl border transition-all text-left ${selectedMarketId === m.id ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-900/40 hover:border-slate-700"}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${m.resolved ? "bg-slate-900/60 text-slate-400 border-slate-800" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                                            {m.resolved ? `ENDED • ${m.outcome ? "YES" : "NO"}` : "LIVE"}
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
                        </div>
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
                                    onClick={() => window.open(`https://warpcast.com/~/compose?text=Predicting on HolyMarket: ${market.question}&embeds[]=${window.location.href}`)}
                                    className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                    title="Share on Warpcast"
                                >
                                    <Share2 size={18} />
                                </button>
                                <button
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=I'm predicting on HolyMarket: ${market.question}&url=${window.location.href}`)}
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

                {activeTab === "tasks" && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Tasks</h3>
                            <button
                                type="button"
                                onClick={() => fetchTasks()}
                                className="px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eligibility</div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Points</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">{taskStats ? taskStats.points : "—"}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Volume</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">{taskStats ? `${Number(taskStats.volumeBnb).toFixed(4)} ETH` : "—"}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Follow tasks</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">{taskStats ? taskStats.followTasks : "—"}</div>
                                </div>
                            </div>
                            {!userAddress && (
                                <div className="mt-3 text-[11px] text-slate-500">
                                    Connect your wallet to track eligibility and claim tasks.
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {tasksLoading ? (
                                <div className="text-slate-500 text-sm">Loading tasks...</div>
                            ) : (
                                (tasks || []).filter((t) => t?.active !== false).map((t: any) => {
                                    const claimed = Boolean(taskClaims?.[t.id]);
                                    const busy = Boolean(taskClaimBusy?.[t.id]);
                                    const req = t.requirements || {};
                                    const missing: string[] = [];
                                    const pts = Number(taskStats?.points ?? 0);
                                    const vol = Number(taskStats?.volumeBnb ?? 0);
                                    const follows = Number(taskStats?.followTasks ?? 0);
                                    const nowMs = Date.now();
                                    const startMs = t.startAt ? Date.parse(t.startAt) : NaN;
                                    const endMs = t.endAt ? Date.parse(t.endAt) : NaN;
                                    const notStarted = t.startAt && Number.isFinite(startMs) && nowMs < startMs;
                                    const ended = t.endAt && Number.isFinite(endMs) && nowMs > endMs;
                                    if (notStarted) missing.push("not started");
                                    if (ended) missing.push("ended");
                                    if (req.minPoints !== undefined && pts < Number(req.minPoints)) missing.push(`${Number(req.minPoints)} pts`);
                                    if (req.minVolumeBnb !== undefined && vol < Number(req.minVolumeBnb)) missing.push(`${Number(req.minVolumeBnb)} ETH volume`);
                                    if (req.minFollowTasks !== undefined && follows < Number(req.minFollowTasks)) missing.push(`${Number(req.minFollowTasks)} follow tasks`);
                                    const eligible = userAddress && missing.length === 0;
                                    const requiresOpen = (t.type === "link" || t.type === "follow") && Boolean(t.url);
                                    const opened = requiresOpen ? Boolean(taskOpened?.[t.id]) : true;
                                    const canClaim = Boolean(eligible && opened);
                                    const reqText = [
                                        req.minPoints !== undefined ? `min ${req.minPoints} pts` : null,
                                        req.minVolumeBnb !== undefined ? `min ${req.minVolumeBnb} ETH volume` : null,
                                        req.minFollowTasks !== undefined ? `min ${req.minFollowTasks} follow tasks` : null,
                                    ].filter(Boolean).join(" • ");
                                    return (
                                        <div key={t.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${t.type === "follow" ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                                                            {t.type}
                                                        </span>
                                                        {t.repeat === "daily" && (
                                                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border bg-purple-500/10 text-purple-300 border-purple-500/20">
                                                                DAILY
                                                            </span>
                                                        )}
                                                        {!claimed && userAddress && missing.length > 0 && (
                                                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                                                LOCKED
                                                            </span>
                                                        )}
                                                        <div className="text-sm font-black text-white truncate">{t.title}</div>
                                                    </div>
                                                    {t.description && (
                                                        <div className="mt-1 text-[11px] text-slate-500">{t.description}</div>
                                                    )}
                                                    {reqText && (
                                                        <div className="mt-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Requires: {reqText}</div>
                                                    )}
                                                    {(t.startAt || t.endAt) && (
                                                        <div className="mt-2 text-[11px] text-slate-500">
                                                            {t.startAt ? `Starts: ${new Date(t.startAt).toLocaleString()}` : ""}
                                                            {t.startAt && t.endAt ? " • " : ""}
                                                            {t.endAt ? `Ends: ${new Date(t.endAt).toLocaleString()}` : ""}
                                                        </div>
                                                    )}
                                                    {!claimed && userAddress && missing.length > 0 && (
                                                        <div className="mt-2 text-[11px] text-amber-400 font-bold">
                                                            Missing: {missing.join(" • ")}
                                                        </div>
                                                    )}
                                                    {!claimed && userAddress && missing.length === 0 && requiresOpen && !opened && (
                                                        <div className="mt-2 text-[11px] text-slate-500">
                                                            Open the link to unlock claim.
                                                        </div>
                                                    )}
                                                    {!userAddress && (
                                                        <div className="mt-2 text-[11px] text-slate-500">
                                                            Connect wallet to check eligibility.
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-sky-400">+{t.points} PTS</div>
                                                    <div className="mt-2 flex gap-2 justify-end">
                                                        {(t.url && (t.type === "link" || t.type === "follow")) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    window.open(t.url, "_blank");
                                                                    markTaskOpened(t.id);
                                                                }}
                                                                className="px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                                                            >
                                                                Open
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            disabled={claimed || busy || !canClaim}
                                                            onClick={() => claimTask(t.id)}
                                                            className="px-3 py-2 rounded-lg bg-white text-slate-900 text-[10px] font-extrabold hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                                        >
                                                            {claimed ? "Claimed" : busy ? "Claiming..." : "Claim"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {!tasksLoading && (!tasks || tasks.length === 0) && (
                                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                    <p className="text-slate-500 text-sm">No tasks yet.</p>
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

                        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs font-extrabold text-white">Base Sepolia Faucet</div>
                                    <div className="mt-1 text-[11px] text-slate-500">
                                        Need test ETH to place bets? Use a faucet and fund your wallet.
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20">
                                    TESTNET
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                const show = bet.marketId <= resetAfterMarketId && ub && !ub.claimed && withdrawable > 0n;
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
                                        fetchAdminTasks();
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
                                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                                    a.role === "superadmin"
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

                        {adminRole && (
                            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Tasks</h3>
                                        <div className="mt-1 text-[11px] text-slate-500">Create link or follow tasks with optional requirements.</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fetchAdminTasks()}
                                        disabled={!userAddress || !adminRole || adminTaskBusy}
                                        className="px-3 py-1.5 rounded-full bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-400 hover:text-white hover:border-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Create / Update Task</div>
                                        <div className="mt-4 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <select value={taskFormType} onChange={(e) => setTaskFormType(e.target.value as any)} className="w-full premium-input focus:bg-slate-900">
                                                    <option value="link">link</option>
                                                    <option value="follow">follow</option>
                                                    <option value="checkin">checkin</option>
                                                </select>
                                                <select value={taskFormRepeat} onChange={(e) => setTaskFormRepeat(e.target.value as any)} className="w-full premium-input focus:bg-slate-900">
                                                    <option value="none">one-time</option>
                                                    <option value="daily">daily</option>
                                                </select>
                                                <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                                                    <input type="checkbox" checked={taskFormActive} onChange={(e) => setTaskFormActive(e.target.checked)} />
                                                    Active
                                                </label>
                                            </div>
                                            <input value={taskFormTitle} onChange={(e) => setTaskFormTitle(e.target.value)} placeholder="Task title" className="w-full premium-input focus:bg-slate-900" />
                                            {taskFormType !== "checkin" && (
                                                <input value={taskFormUrl} onChange={(e) => setTaskFormUrl(e.target.value)} placeholder="https://..." className="w-full premium-input focus:bg-slate-900" />
                                            )}
                                            <textarea value={taskFormDescription} onChange={(e) => setTaskFormDescription(e.target.value)} placeholder="Description (optional)" className="w-full premium-input focus:bg-slate-900" rows={3} />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Reward points</div>
                                                    <input value={taskFormPoints} onChange={(e) => setTaskFormPoints(e.target.value)} placeholder="e.g. 100" className="w-full premium-input focus:bg-slate-900" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Task ID</div>
                                                    <input value={taskFormId} onChange={(e) => setTaskFormId(e.target.value)} placeholder="e.g. x_follow_holymarket" className="w-full premium-input focus:bg-slate-900" />
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-600">
                                                Leave Task ID empty to auto-generate. Use a fixed ID to update the same task later.
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Start time (optional)</div>
                                                    <input
                                                        value={taskFormStartAt}
                                                        onChange={(e) => setTaskFormStartAt(e.target.value)}
                                                        type="datetime-local"
                                                        className="w-full premium-input focus:bg-slate-900"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">End time (optional)</div>
                                                    <input
                                                        value={taskFormEndAt}
                                                        onChange={(e) => setTaskFormEndAt(e.target.value)}
                                                        type="datetime-local"
                                                        className="w-full premium-input focus:bg-slate-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-600">
                                                Times are entered in your local timezone and stored/enforced as UTC. Daily tasks reset at <span className="font-mono">00:00 UTC</span>.
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optional requirements</div>
                                                <div className="mt-1 text-[11px] text-slate-600">Set any of these to lock the task until the user qualifies.</div>
                                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Min points</div>
                                                        <input value={taskReqMinPoints} onChange={(e) => setTaskReqMinPoints(e.target.value)} placeholder="e.g. 500" className="w-full premium-input focus:bg-slate-900" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Min volume (ETH)</div>
                                                        <input value={taskReqMinVolumeBnb} onChange={(e) => setTaskReqMinVolumeBnb(e.target.value)} placeholder="e.g. 0.25" className="w-full premium-input focus:bg-slate-900" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Min follow tasks</div>
                                                        <input value={taskReqMinFollowTasks} onChange={(e) => setTaskReqMinFollowTasks(e.target.value)} placeholder="e.g. 3" className="w-full premium-input focus:bg-slate-900" />
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-[11px] text-slate-600">Leave blank to disable a specific requirement.</div>
                                            </div>
                                            <button type="button" disabled={adminTaskBusy || !taskFormTitle || !taskFormUrl} onClick={() => adminTaskUpsert()} className="w-full premium-btn py-3 disabled:opacity-60 disabled:cursor-not-allowed">
                                                {adminTaskBusy ? "Saving..." : "Save Task"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Existing Tasks</div>
                                            <div className="text-[10px] font-bold text-slate-600">{adminTasks.length}</div>
                                        </div>
                                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                                            {adminTasks.map((t: any) => (
                                                <div key={t.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-black text-slate-200 truncate">{t.title}</div>
                                                            <div className="mt-1 text-[10px] font-mono text-slate-500 truncate">{t.id}</div>
                                                            <div className="mt-1 text-[10px] text-slate-600">{t.type} • {t.active ? "active" : "inactive"} • +{t.points} pts</div>
                                                            {t.repeat === "daily" && (
                                                                <div className="mt-1 text-[10px] text-slate-600">repeat: daily</div>
                                                            )}
                                                            {(t.startAt || t.endAt) && (
                                                                <div className="mt-1 text-[10px] text-slate-600 truncate">
                                                                    {t.startAt ? `start ${new Date(t.startAt).toLocaleString()}` : ""}
                                                                    {t.startAt && t.endAt ? " • " : ""}
                                                                    {t.endAt ? `end ${new Date(t.endAt).toLocaleString()}` : ""}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setTaskFormId(t.id || "");
                                                                    setTaskFormType(t.type);
                                                                    setTaskFormRepeat(t.repeat === "daily" ? "daily" : "none");
                                                                    setTaskFormTitle(t.title || "");
                                                                    setTaskFormDescription(t.description || "");
                                                                    setTaskFormUrl(t.url || "");
                                                                    setTaskFormPoints(String(t.points ?? ""));
                                                                    setTaskFormActive(Boolean(t.active));
                                                                    setTaskFormStartAt(toLocalDateTimeInput(t.startAt ? String(t.startAt) : ""));
                                                                    setTaskFormEndAt(toLocalDateTimeInput(t.endAt ? String(t.endAt) : ""));
                                                                    setTaskReqMinPoints(t.requirements?.minPoints !== undefined ? String(t.requirements.minPoints) : "");
                                                                    setTaskReqMinVolumeBnb(t.requirements?.minVolumeBnb !== undefined ? String(t.requirements.minVolumeBnb) : "");
                                                                    setTaskReqMinFollowTasks(t.requirements?.minFollowTasks !== undefined ? String(t.requirements.minFollowTasks) : "");
                                                                }}
                                                                className="px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800 text-[10px] font-extrabold text-slate-300 hover:text-white hover:border-slate-700"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={adminTaskBusy}
                                                                onClick={() => adminTaskRemove(t.id)}
                                                                className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-extrabold hover:bg-rose-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {adminTasks.length === 0 && (
                                                <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                                                    <p className="text-slate-500 text-sm">No tasks yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration Window (s)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newDuration}
                                        onChange={(e) => setNewDuration(e.target.value)}
                                        className="w-full premium-input focus:bg-slate-900"
                                    />
                                    <div className="mt-4 flex gap-2">
                                        <button type="button" onClick={() => setNewDuration("3600")} className="flex-1 py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">1 Hour</button>
                                        <button type="button" onClick={() => setNewDuration("86400")} className="flex-1 py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">24 Hours</button>
                                        <button type="button" onClick={() => setNewDuration("604800")} className="flex-1 py-1.5 bg-slate-800 text-[10px] rounded-lg hover:bg-slate-700 font-bold transition-all">7 Days</button>
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
                                onClick={handleEmergencyReset}
                                disabled={betting || needsNetworkSwitch || !isConnected || adminRole !== "superadmin"}
                                className="w-full py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                EMERGENCY GLOBAL RESET
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
                                    const url = window.location.href;
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
                                    const url = window.location.href;
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
                                    const url = window.location.href;
                                    window.open(`https://base.app/?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
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
