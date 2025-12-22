"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            // Initialize the SDK
            await sdk.actions.ready();
            setIsSDKLoaded(true);
        };
        if (sdk && !isSDKLoaded) {
            load();
        }
    }, [isSDKLoaded]);

    return <>{children}</>;
}
