"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

type Props = {
    children: React.ReactNode;
};

/**
 * v41: Safe Splash Recovery (Double App Fix)
 * - Ensures children (App) are NOT rendered until splash is fully finished.
 * - Prevents the "Double App" look seen in Farcaster frames.
 * - Maintains premium visual centering.
 */
export default function SplashGate({ children }: Props) {
    const [showSplash, setShowSplash] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Show splash for 2s, then fade out
        const timer = setTimeout(() => {
            setOpacity(0);
            // After fade out, remove splash and SHOW app
            setTimeout(() => {
                setShowSplash(false);
            }, 1000);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // v41: If splash is done, return app ONLY. No nesting.
    if (!showSplash) return <>{children}</>;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out"
            style={{
                opacity,
                pointerEvents: opacity === 0 ? 'none' : 'auto'
            }}
        >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Premium Logo Wrapper */}
                <div className="relative group animate-in zoom-in duration-1000 ease-out">
                    <div className="absolute -inset-8 bg-gradient-to-tr from-blue-500/20 to-sky-500/20 blur-2xl rounded-full group-hover:opacity-100 transition-opacity" />
                    <img
                        src="/icon-1024.png?v=47"
                        alt="HolyMarket Logo"
                        className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] shadow-[0_0_50px_rgba(14,165,233,0.3)] relative border border-white/10"
                    />
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Sparkles size={20} className="text-white" />
                    </div>
                </div>

                {/* Title & Slogan */}
                <div className="mt-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                        HOLY<span className="text-gradient">MARKET</span>
                    </h1>
                    <div className="flex items-center gap-4 justify-center">
                        <div className="h-px w-12 bg-white/10" />
                        <p className="text-[12px] text-slate-500 font-extrabold uppercase tracking-[0.5em]">Predict The Future</p>
                        <div className="h-px w-12 bg-white/10" />
                    </div>
                </div>

                {/* Loading Indicator */}
                <div className="mt-16 flex flex-col items-center gap-6">
                    <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-progress-flow" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em]">Initialising Protocol</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-500/40 rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-blue-500/40 rounded-full animate-pulse [animation-delay:200ms]" />
                            <div className="w-1 h-1 bg-blue-500/40 rounded-full animate-pulse [animation-delay:400ms]" />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress-flow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-flow {
                    animation: progress-flow 2.5s infinite ease-in-out;
                }
                .text-gradient {
                    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
}
