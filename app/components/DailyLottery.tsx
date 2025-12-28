"use client";

import { useState, useEffect, useRef } from "react";
import { Gift, Loader2, Sparkles, Clock, Flame, X, ArrowLeft } from "lucide-react";

interface DailyLotteryProps {
    userAddress?: string;
    onClose: () => void;
    onWin: (amount: number) => void;
}

const PRIZE_SEGMENTS = [
    { value: 5, color: "#3b82f6", label: "5" },
    { value: 10, color: "#8b5cf6", label: "10" },
    { value: 15, color: "#ec4899", label: "15" },
    { value: 20, color: "#f59e0b", label: "20" },
    { value: 25, color: "#10b981", label: "25" },
    { value: 50, color: "#ef4444", label: "50" },
    { value: 75, color: "#6366f1", label: "75" },
    { value: 100, color: "#f97316", label: "100" },
];

export default function DailyLottery({ userAddress, onClose, onWin }: DailyLotteryProps) {
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [canSpin, setCanSpin] = useState(false);
    const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
    const [streak, setStreak] = useState(0);
    const [result, setResult] = useState<number | null>(null);
    const [rotation, setRotation] = useState(0);
    const [timeLeft, setTimeLeft] = useState("");
    const wheelRef = useRef<HTMLDivElement>(null);

    // Fetch lottery status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/lottery?user=${userAddress}`);
                const data = await res.json();
                setCanSpin(data.canSpin || false);
                setStreak(data.streak || 0);
                if (data.cooldownEnd) {
                    setCooldownEnd(data.cooldownEnd);
                }
            } catch (e) {
                console.error("Failed to fetch lottery status:", e);
            } finally {
                setLoading(false);
            }
        };
        if (userAddress) fetchStatus();
        else setLoading(false);
    }, [userAddress]);

    // Countdown timer
    useEffect(() => {
        if (!cooldownEnd || canSpin) {
            setTimeLeft("");
            return;
        }
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = cooldownEnd - now;
            if (diff <= 0) {
                setCanSpin(true);
                setCooldownEnd(null);
                setTimeLeft("");
                clearInterval(interval);
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldownEnd, canSpin]);

    const handleSpin = async () => {
        if (!canSpin || spinning) return;
        setSpinning(true);
        setResult(null);

        try {
            const res = await fetch("/api/lottery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: userAddress }),
            });
            const data = await res.json();

            if (data.ok && data.prize !== undefined) {
                // Find prize segment index
                const prizeIndex = PRIZE_SEGMENTS.findIndex((s) => s.value === data.prize);
                const segmentAngle = 360 / PRIZE_SEGMENTS.length;
                const targetAngle = prizeIndex * segmentAngle;
                const spins = 5 + Math.random() * 3;
                const finalRotation = spins * 360 + (360 - targetAngle - segmentAngle / 2);

                setRotation(finalRotation);

                // Wait for animation
                setTimeout(() => {
                    setResult(data.prize);
                    setSpinning(false);
                    setCanSpin(false);
                    setStreak(data.streak || streak + 1);
                    if (data.cooldownEnd) setCooldownEnd(data.cooldownEnd);
                    onWin(data.prize);
                }, 4000);
            } else {
                setSpinning(false);
            }
        } catch (e) {
            console.error("Spin failed:", e);
            setSpinning(false);
        }
    };

    const segmentAngle = 360 / PRIZE_SEGMENTS.length;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-md px-4 pt-8 pb-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="w-full max-w-sm premium-card p-6 bg-slate-950 border border-white/10 relative overflow-hidden animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(59,130,246,0.1)]">
                {/* Back button */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    <span className="text-xs font-medium">Back</span>
                </button>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] -mr-32 -mt-32" />

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
                        <Gift size={14} className="text-purple-400" />
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Daily Lottery</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Free Daily Spin</h2>
                    <p className="text-sm text-slate-400">Spin to win PTS every day!</p>
                </div>

                {/* Streak indicator */}
                {streak > 0 && (
                    <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <Flame size={18} className="text-orange-400" />
                        <span className="text-sm font-bold text-orange-400">{streak} Day Streak!</span>
                        {streak >= 7 && <span className="text-xs text-orange-300">+Bonus</span>}
                    </div>
                )}

                {!userAddress ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <Gift size={32} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Connect Wallet</h3>
                        <p className="text-sm text-slate-400 mb-6">Connect your wallet to spin the wheel and win PTS!</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-purple-500 text-white font-bold text-sm rounded-xl active:scale-95 transition-all"
                        >
                            Got it
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {/* Wheel */}
                        <div className="relative mx-auto w-64 h-64 mb-6">
                            {/* Pointer */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
                            </div>

                            {/* Wheel */}
                            <div
                                ref={wheelRef}
                                className="w-full h-full rounded-full border-4 border-white/20 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                                }}
                            >
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    {PRIZE_SEGMENTS.map((segment, i) => {
                                        const startAngle = i * segmentAngle - 90;
                                        const endAngle = (i + 1) * segmentAngle - 90;
                                        const startRad = (startAngle * Math.PI) / 180;
                                        const endRad = (endAngle * Math.PI) / 180;
                                        const x1 = 50 + 50 * Math.cos(startRad);
                                        const y1 = 50 + 50 * Math.sin(startRad);
                                        const x2 = 50 + 50 * Math.cos(endRad);
                                        const y2 = 50 + 50 * Math.sin(endRad);
                                        const largeArc = segmentAngle > 180 ? 1 : 0;
                                        const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
                                        const textX = 50 + 32 * Math.cos(midAngle);
                                        const textY = 50 + 32 * Math.sin(midAngle);

                                        return (
                                            <g key={i}>
                                                <path
                                                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                    fill={segment.color}
                                                    stroke="#020617"
                                                    strokeWidth="0.5"
                                                />
                                                <text
                                                    x={textX}
                                                    y={textY}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="white"
                                                    fontSize="8"
                                                    fontWeight="bold"
                                                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                                                >
                                                    {segment.label}
                                                </text>
                                            </g>
                                        );
                                    })}
                                    {/* Center circle */}
                                    <circle cx="50" cy="50" r="12" fill="#020617" stroke="#3b82f6" strokeWidth="2" />
                                    <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="6" fontWeight="bold">
                                        PTS
                                    </text>
                                </svg>
                            </div>
                        </div>

                        {/* Result */}
                        {result !== null && (
                            <div className="text-center mb-6 animate-in zoom-in duration-300">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30">
                                    <Sparkles size={20} className="text-green-400" />
                                    <span className="text-lg font-black text-green-400">+{result} PTS!</span>
                                </div>
                            </div>
                        )}

                        {/* Spin Button or Cooldown */}
                        {canSpin ? (
                            <button
                                onClick={handleSpin}
                                disabled={spinning}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {spinning ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={18} className="animate-spin" />
                                        Spinning...
                                    </span>
                                ) : (
                                    "🎰 SPIN NOW"
                                )}
                            </button>
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                                    <Clock size={16} />
                                    <span className="text-sm font-medium">Next spin in:</span>
                                </div>
                                <div className="text-3xl font-black text-white font-mono tracking-wider">
                                    {timeLeft || "Loading..."}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
