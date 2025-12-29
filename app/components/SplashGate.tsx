"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

type Props = {
    children: React.ReactNode;
};

export default function SplashGate({ children }: Props) {
    const [show, setShow] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpacity(0);
            setTimeout(() => setShow(false), 500);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return <>{children}</>;

    return (
        <div
            className="fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-in-out"
            style={{ opacity }}
        >
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-sky-500/5 blur-[80px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative group animate-in zoom-in duration-700">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-sky-500/20 blur-xl rounded-[2.5rem] group-hover:opacity-100 transition-opacity" />
                    <img
                        src="/icon-1024.png"
                        alt="HolyMarket Logo"
                        className="w-32 h-32 rounded-[2rem] shadow-2xl relative border border-white/10"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Sparkles size={16} className="text-white" />
                    </div>
                </div>

                <div className="mt-8 text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <h1 className="text-4xl font-black tracking-tighter text-white">
                        HOLY<span className="text-gradient">MARKET</span>
                    </h1>
                    <div className="flex items-center gap-3 justify-center">
                        <div className="h-px w-8 bg-white/10" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Predict The Future</p>
                        <div className="h-px w-8 bg-white/10" />
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-progress-flow" />
                    </div>
                    <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">Initialising Protocol</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress-flow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-flow {
                    animation: progress-flow 2s infinite linear;
                }
            `}</style>
        </div>
    );
}
