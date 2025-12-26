"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const logos = [
    {
        id: 1,
        name: "Fintech Minimalist",
        description: "Clean typography with a subtle geometric overlap.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#0ea5e9", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#2563eb", stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <path d="M20 20 V80 M20 50 H50 M50 20 V80" stroke="url(#grad1)" strokeWidth="12" fill="none" strokeLinecap="round" />
                <path d="M60 20 L80 50 L100 20 M80 50 V80" stroke="#f8fafc" strokeWidth="12" fill="none" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 2,
        name: "Cyber Monogram",
        description: "Interlocking letters with neon accents.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M25 25 V75 M25 50 H75 M75 25 V75" stroke="#22d3ee" strokeWidth="8" fill="none" strokeLinejoin="round" />
                <circle cx="50" cy="50" r="40" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="2" fill="none" />
            </svg>
        ),
    },
    {
        id: 3,
        name: "The Shield",
        description: "Security and trust focused corporate emblem.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 5 L10 20 V50 C10 75 50 95 50 95 C50 95 90 75 90 50 V20 L50 5Z" fill="#1e293b" stroke="#0ea5e9" strokeWidth="4" />
                <text x="50" y="60" textAnchor="middle" fill="#0ea5e9" fontSize="24" fontWeight="900" fontFamily="sans-serif">HM</text>
            </svg>
        ),
    },
    {
        id: 4,
        name: "Pulse & Market",
        description: "Connecting data points with market movement.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10 50 L30 50 L40 20 L60 80 L70 50 L90 50" stroke="#0ea5e9" strokeWidth="6" fill="none" strokeLinecap="round" />
                <text x="50" y="45" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">HM</text>
            </svg>
        ),
    },
    {
        id: 5,
        name: "Modern Brutalism",
        description: "Bold, thick strokes for a strong brand presence.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="20" y="20" width="15" height="60" fill="#0ea5e9" />
                <rect x="35" y="45" width="30" height="10" fill="#0ea5e9" />
                <rect x="65" y="20" width="15" height="60" fill="#0ea5e9" />
            </svg>
        ),
    },
    {
        id: 6,
        name: "Digital Horizon",
        description: "Abstract lines representing growth and future.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10 80 L40 40 L60 60 L90 20" stroke="#22d3ee" strokeWidth="8" fill="none" strokeLinecap="round" />
                <text x="25" y="30" fill="white" fontSize="18" fontWeight="900">HM</text>
            </svg>
        ),
    },
    {
        id: 7,
        name: "Infinity HM",
        description: "A continuous flow representing endless markets.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M20 70 Q 20 20 50 50 Q 80 80 80 30" stroke="#0ea5e9" strokeWidth="10" fill="none" strokeLinecap="round" />
                <text x="50" y="90" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">HM BETA</text>
            </svg>
        ),
    },
    {
        id: 8,
        name: "The Node",
        description: "Decentralized and interconnected design.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="20" cy="20" r="8" fill="#0ea5e9" />
                <circle cx="80" cy="20" r="8" fill="#0ea5e9" />
                <circle cx="50" cy="80" r="8" fill="#0ea5e9" />
                <path d="M20 20 L50 80 L80 20" stroke="rgba(14, 165, 233, 0.5)" strokeWidth="2" fill="none" />
                <text x="50" y="45" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">HM</text>
            </svg>
        ),
    },
    {
        id: 9,
        name: "Sleek Professional",
        description: "Luxury fintech style with deep blue accents.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="10" y="10" width="80" height="80" rx="20" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                <text x="50" y="65" textAnchor="middle" fill="#0ea5e9" fontSize="40" fontWeight="900">HM</text>
                <rect x="30" y="70" width="40" height="4" fill="#0ea5e9" rx="2" />
            </svg>
        ),
    },
    {
        id: 10,
        name: "The Beacon",
        description: "Bright and visible, leading the market.",
        svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M50 10 L90 80 H10 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
                <text x="50" y="65" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">HM</text>
                <circle cx="50" cy="10" r="5" fill="#22d3ee">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
            </svg>
        ),
    },
];

export default function LogoLab() {
    return (
        <div className="min-h-screen bg-[#020617] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to App
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter">
                            HM <span className="text-gradient">LOGO LAB</span>
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Corporate & Modern SVG Variations</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                        <span className="text-blue-400 text-sm font-bold">BETA BRANDING</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {logos.map((logo) => (
                        <div key={logo.id} className="premium-card p-6 flex flex-col items-center text-center group cursor-pointer">
                            <div className="w-32 h-32 mb-6 transition-transform group-hover:scale-110 duration-300">
                                {logo.svg}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{logo.name}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                {logo.description}
                            </p>
                            <button className="premium-btn w-full mt-auto">
                                Select This Style
                            </button>
                        </div>
                    ))}
                </div>

                <footer className="mt-20 text-center border-t border-slate-800 pt-8 text-slate-500 text-sm">
                    <p>© 2025 HolyMarket Corporate Design System. All logos generated via SVG Code.</p>
                </footer>
            </div>
        </div>
    );
}
