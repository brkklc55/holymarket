import { NextResponse } from 'next/server';

export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_URL || 'https://cas-peterson-july-kissing.trycloudflare.com';

    const config = {
        accountAssociation: {
            header: "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgzREYzYjFDNUE3N0ZmODVGRjI1NzI3RTU0Njg1YjE3MTcxQ0MyNTI2In0",
            payload: "eyJkb21haW4iOiJjYXMtcGV0ZXJzb24tanVseS1raXNzaW5nLnRyeWNsb3VkZmxhcmUuY29tIn0",
            signature: "IN3kWg0iJctJyNOumnTixu6v8s+jUrw8n8sLSGMDwcow4TqADvtKDYr/wbvfj4irbGzPmuwwuXNdjTXQeuaOQBw="
        },
        frame: {
            version: "1",
            name: "FolyMarket",
            iconUrl: `${appUrl}/logo.png`,
            homeUrl: appUrl,
        }
    };

    return NextResponse.json(config, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
