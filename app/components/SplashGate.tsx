"use client";

import React, { useEffect, useState } from "react";

type Props = {
    children: React.ReactNode;
};

export default function SplashGate({ children }: Props) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const t = window.setTimeout(() => setShow(false), 900);
        return () => window.clearTimeout(t);
    }, []);

    if (!show) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[9998] bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center justify-center">
                    <img src="/ihm-beta.png" alt="HolyMarket" className="w-12 h-12" />
                </div>
                <div className="mt-6 text-3xl font-black tracking-tight text-white">
                    HOLY<span className="text-gradient">MARKET</span>
                </div>
                <div className="mt-2 text-sm text-slate-400">Prediction markets on Base Sepolia</div>
                <div className="mt-6 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        </div>
    );
}
