"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Gift, Trophy, Clock, AlertCircle } from "lucide-react";

export interface Notification {
    id: string;
    type: "lottery" | "market_ending" | "market_result" | "win" | "info";
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    actionUrl?: string;
}

interface NotificationBellProps {
    userAddress?: string;
    markets?: Array<{
        id: bigint;
        question: string;
        endTime: bigint;
        resolved: boolean;
    }>;
    userBets?: Record<string, { yesAmount: bigint; noAmount: bigint; claimed: boolean }>;
    onOpenLottery?: () => void;
}

const STORAGE_KEY = "holymarket_notifications";
const LOTTERY_CHECK_KEY = "holymarket_lottery_checked";

export default function NotificationBell({ userAddress, markets, userBets, onOpenLottery }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Load notifications from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
            } catch { }
        }
    }, []);

    // Save notifications to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }, [notifications]);

    // Check for lottery availability
    useEffect(() => {
        if (!userAddress) return;

        const checkLottery = async () => {
            const lastCheck = localStorage.getItem(LOTTERY_CHECK_KEY);
            const now = Date.now();

            // Only check once per hour
            if (lastCheck && now - parseInt(lastCheck) < 60 * 60 * 1000) return;

            try {
                const res = await fetch(`/api/lottery?user=${userAddress}`);
                const data = await res.json();

                if (data.canSpin) {
                    addNotification({
                        type: "lottery",
                        title: "Daily Spin Ready!",
                        message: "Your free daily lottery spin is ready. Try your luck!",
                    });
                }

                localStorage.setItem(LOTTERY_CHECK_KEY, now.toString());
            } catch { }
        };

        checkLottery();
    }, [userAddress]);

    // Check for market endings
    useEffect(() => {
        if (!markets || !userBets) return;

        const now = Math.floor(Date.now() / 1000);

        markets.forEach((market) => {
            const endTime = Number(market.endTime);
            const timeUntilEnd = endTime - now;
            const bet = userBets[market.id.toString()];

            // If user has a bet and market ends in less than 1 hour
            if (bet && (bet.yesAmount > 0n || bet.noAmount > 0n) && timeUntilEnd > 0 && timeUntilEnd < 3600) {
                const existingNotif = notifications.find(
                    (n) => n.type === "market_ending" && n.id.includes(market.id.toString())
                );

                if (!existingNotif) {
                    addNotification({
                        type: "market_ending",
                        title: "Market Ending Soon!",
                        message: `"${market.question.slice(0, 50)}..." ends in less than 1 hour.`,
                    });
                }
            }

            // If market resolved and user has unclaimed winnings
            if (market.resolved && bet && !bet.claimed && (bet.yesAmount > 0n || bet.noAmount > 0n)) {
                const existingNotif = notifications.find(
                    (n) => n.type === "win" && n.id.includes(market.id.toString())
                );

                if (!existingNotif) {
                    addNotification({
                        type: "win",
                        title: "Claim Your Winnings!",
                        message: `Market "${market.question.slice(0, 40)}..." has resolved. Check if you won!`,
                    });
                }
            }
        });
    }, [markets, userBets]);

    const addNotification = (notif: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotif: Notification = {
            ...notif,
            id: `${notif.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: Date.now(),
            read: false,
        };

        setNotifications((prev) => {
            // Avoid duplicates
            const exists = prev.some(
                (n) => n.type === notif.type && n.title === notif.title && Date.now() - n.timestamp < 60000
            );
            if (exists) return prev;

            // Keep only last 20 notifications
            const updated = [newNotif, ...prev].slice(0, 20);
            return updated;
        });
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "lottery":
                return <Gift size={16} className="text-purple-400" />;
            case "win":
                return <Trophy size={16} className="text-yellow-400" />;
            case "market_ending":
                return <Clock size={16} className="text-orange-400" />;
            case "market_result":
                return <AlertCircle size={16} className="text-blue-400" />;
            default:
                return <Bell size={16} className="text-slate-400" />;
        }
    };

    const handleNotificationClick = (notif: Notification) => {
        markAsRead(notif.id);
        if (notif.type === "lottery" && onOpenLottery) {
            onOpenLottery();
            setIsOpen(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
                <Bell size={20} className="text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-80 max-h-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto max-h-72">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notif.read ? "bg-blue-500/5" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">{getIcon(notif.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">{notif.title}</span>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                                            <span className="text-[10px] text-slate-600 mt-1 block">
                                                {formatTimeAgo(notif.timestamp)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notif.id);
                                            }}
                                            className="p-1 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}
