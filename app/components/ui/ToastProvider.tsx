"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

type ToastItem = {
    id: string;
    title?: string;
    message: string;
    variant: ToastVariant;
    createdAt: number;
};

type ToastInput = {
    title?: string;
    message: string;
    variant?: ToastVariant;
    durationMs?: number;
};

type ToastContextValue = {
    toast: (t: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function genId() {
    // Avoid crypto dependency for older envs
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<ToastItem[]>([]);
    const timersRef = useRef<Record<string, number>>({});

    const remove = useCallback((id: string) => {
        setItems((prev) => prev.filter((t) => t.id !== id));
        const t = timersRef.current[id];
        if (t) {
            window.clearTimeout(t);
            delete timersRef.current[id];
        }
    }, []);

    const toast = useCallback(
        ({ title, message, variant = "default", durationMs = 3800 }: ToastInput) => {
            const id = genId();
            const createdAt = Date.now();
            setItems((prev) => [{ id, title, message, variant, createdAt }, ...prev].slice(0, 4));
            timersRef.current[id] = window.setTimeout(() => remove(id), durationMs);
        },
        [remove]
    );

    const value = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-[10000] w-[calc(100%-2rem)] max-w-sm space-y-2">
                {items.map((t) => {
                    const variantClasses =
                        t.variant === "success"
                            ? "border-emerald-500/20 bg-emerald-500/10"
                            : t.variant === "error"
                                ? "border-rose-500/20 bg-rose-500/10"
                                : t.variant === "warning"
                                    ? "border-amber-500/20 bg-amber-500/10"
                                    : "border-slate-800 bg-slate-900/70";

                    const titleColor =
                        t.variant === "success"
                            ? "text-emerald-300"
                            : t.variant === "error"
                                ? "text-rose-300"
                                : t.variant === "warning"
                                    ? "text-amber-300"
                                    : "text-white";

                    return (
                        <div key={t.id} className={`premium-card p-4 border ${variantClasses}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    {t.title && <div className={`text-sm font-extrabold ${titleColor}`}>{t.title}</div>}
                                    <div className="text-[12px] text-slate-300 mt-1 leading-relaxed">{t.message}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(t.id)}
                                    className="h-8 w-8 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return ctx;
}
