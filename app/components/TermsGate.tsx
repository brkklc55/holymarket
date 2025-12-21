"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
    children: React.ReactNode;
};

const STORAGE_KEY = "holymarket_terms_v1";

export default function TermsGate({ children }: Props) {
    const [ready, setReady] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        try {
            const value = window.localStorage.getItem(STORAGE_KEY);
            if (value === "accepted") {
                setAccepted(true);
            }
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        if (!ready) return;
        if (!accepted) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            return () => {
                document.documentElement.style.overflow = "";
                document.body.style.overflow = "";
            };
        }
    }, [ready, accepted]);

    const disclaimerText = useMemo(() => {
        return {
            title: "Disclaimer & Terms",
            subtitle: "Please read and accept before using the app.",
            sections: [
                {
                    title: "Beta / Testnet",
                    body: "HolyMarket is a beta test running on BNB Smart Chain Testnet. The app, smart contracts, points system and UI may change or break at any time.",
                },
                {
                    title: "No financial advice",
                    body: "Nothing in this app constitutes financial advice, investment advice or a recommendation. You are solely responsible for your actions.",
                },
                {
                    title: "Risk & loss",
                    body: "Using smart contracts involves risk, including loss of funds due to bugs, exploits, incorrect transactions or network issues. Only use testnet funds you can afford to lose.",
                },
                {
                    title: "Protocol fee",
                    body: "Winnings claims include a 5% protocol fee, deducted from claimable winnings.",
                },
                {
                    title: "Points & airdrop eligibility",
                    body: "Points are tracked for testing and may be used for potential future airdrop eligibility. Points have no guaranteed value and may be reset, adjusted, removed or invalidated at any time.",
                },
                {
                    title: "Privacy",
                    body: "Wallet addresses and on-chain activity are public by design. Off-chain points are stored locally on the server during testing.",
                },
            ],
        };
    }, []);

    const onAccept = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
        } finally {
            setAccepted(true);
        }
    };

    if (!ready) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (accepted) return <>{children}</>;

    return (
        <div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
            <div className="relative w-full min-h-[100dvh] overflow-y-auto overscroll-contain">
                <div className="w-full min-h-[100dvh] flex items-start justify-center p-6">
                    <div className="w-full max-w-2xl premium-card p-6 sm:p-8 bg-slate-950/90 border border-slate-800 flex flex-col max-h-[calc(100dvh-3rem)] min-h-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-[10px] font-black text-sky-400 uppercase tracking-[0.25em]">BETA ACCESS</div>
                                <h2 className="mt-2 text-2xl font-black text-white">{disclaimerText.title}</h2>
                                <p className="mt-2 text-sm text-slate-400">{disclaimerText.subtitle}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20">TESTNET</span>
                        </div>

                        <div
                            className="mt-6 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar overscroll-contain touch-pan-y"
                            style={{ WebkitOverflowScrolling: "touch" }}
                        >
                            <div className="space-y-4">
                                {disclaimerText.sections.map((s) => (
                                    <div key={s.title} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                                        <div className="text-sm font-extrabold text-white">{s.title}</div>
                                        <div className="mt-1 text-[12px] leading-relaxed text-slate-400">{s.body}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => setChecked(e.target.checked)}
                                    className="mt-1 h-4 w-4"
                                />
                                <div className="text-[12px] text-slate-300">
                                    I have read and understand the disclaimer. I agree to the terms and acknowledge the risks.
                                </div>
                            </label>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a
                                    href="https://testnet.bscscan.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all text-center"
                                >
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explorer</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">BscScan Testnet</div>
                                </a>
                                <a
                                    href="https://testnet.binance.org/faucet-smart"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all text-center"
                                >
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Faucet</div>
                                    <div className="mt-1 text-sm font-black text-slate-200">Get Test BNB</div>
                                </a>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                disabled={!checked}
                                onClick={onAccept}
                                className="premium-btn py-3 px-5 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Accept & Continue
                            </button>
                        </div>

                        <div className="mt-4 text-[11px] text-slate-600">
                            By continuing you confirm you are using the beta version on testnet and accept the disclaimer.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
