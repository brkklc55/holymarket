'use client';

import React from 'react';
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";

import { ToastProvider } from "./components/ui/ToastProvider";

import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
    appName: 'HolyMarket',
    projectId: 'YOUR_PROJECT_ID', // Optional for local dev/test
    chains: [bscTestnet],
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
