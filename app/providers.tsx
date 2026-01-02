'use client';

import React from 'react';
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";

import { ToastProvider } from "./components/ui/ToastProvider";

import '@rainbow-me/rainbowkit/styles.css';

// WalletConnect Cloud Project ID
// Get yours at: https://cloud.walletconnect.com/
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Warn in development if project ID is missing
if (typeof window !== 'undefined' && !WALLETCONNECT_PROJECT_ID) {
    console.warn(
        '[HolyMarket] WalletConnect Project ID not configured. ' +
        'Some wallet connections may not work. ' +
        'Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env file. ' +
        'Get a free Project ID at: https://cloud.walletconnect.com/'
    );
}

const config = getDefaultConfig({
    appName: 'HolyMarket',
    projectId: WALLETCONNECT_PROJECT_ID || 'holymarket-dev-placeholder',
    chains: [baseSepolia],
    ssr: false,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: '#0ea5e9',
                    accentColorForeground: 'white',
                    borderRadius: 'large',
                    fontStack: 'system',
                    overlayBlur: 'small',
                })}>
                    <ToastProvider>{children}</ToastProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
