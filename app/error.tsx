"use client";

import React, { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
            <div className="w-full max-w-md premium-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center text-rose-300 font-black text-lg">
                    !
                </div>
                <h2 className="mt-5 text-xl font-black text-white">Something went wrong</h2>
                <p className="mt-2 text-sm text-slate-400">
                    An unexpected error occurred. Please try again.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3">
                    <button type="button" className="premium-btn" onClick={() => reset()}>
                        Retry
                    </button>
                    <button type="button" className="premium-btn premium-btn-secondary" onClick={() => window.location.reload()}>
                        Reload
                    </button>
                </div>
                {error?.digest && (
                    <div className="mt-6 text-[11px] text-slate-600 font-mono">{error.digest}</div>
                )}
            </div>
        </div>
    );
}
