import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_URI;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_KV_TABLE || "holymarket_kv";

const FALLBACK_SUPERADMINS = [
    "0x33713b87bab352c46bba4953ab6cb11afe895d93",
];

function normalizeAddress(a: string) {
    return String(a || "").trim().toLowerCase();
}

function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

function chunk<T>(arr: T[], size: number) {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

async function sendBatch(params: {
    url: string;
    tokens: string[];
    notificationId: string;
    title: string;
    body: string;
    targetUrl: string;
}) {
    const res = await fetch(params.url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            tokens: params.tokens,
            notificationId: params.notificationId,
            title: params.title,
            body: params.body,
            targetUrl: params.targetUrl,
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Notification send failed: ${res.status} ${text}`);
    }
}

export async function POST(req: NextRequest) {
    const json = await req.json().catch(() => null);
    if (!json) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const adminAddress = normalizeAddress(json?.adminAddress);
    const superadmins = String(process.env.NOTIF_SUPERADMINS || "")
        .split(",")
        .map((x) => normalizeAddress(x))
        .filter(Boolean);

    const allowed = (superadmins.length ? superadmins : FALLBACK_SUPERADMINS).includes(adminAddress);
    if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const title = String(json?.title || "New market").slice(0, 80);
    const body = String(json?.body || "A new market is live on HolyMarket").slice(0, 160);
    const notificationId = String(json?.notificationId || `broadcast-${Date.now()}`)
        .replace(/[^a-zA-Z0-9:_-]/g, "")
        .slice(0, 64);

    const targetUrl = String(
        json?.targetUrl || process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://holymarket.vercel.app"
    ).slice(0, 512);

    const supabase = getSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

    // Load all notification records from KV table
    const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("key,value")
        .like("key", "notif_v1:%");

    if (error) {
        return NextResponse.json({ error: "Failed to load subscribers" }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data : [];

    const byUrl = new Map<string, string[]>();
    for (const r of rows) {
        const v: any = (r as any).value;
        const url = typeof v?.url === "string" ? v.url : null;
        const token = typeof v?.token === "string" ? v.token : null;
        if (!url || !token) continue;
        if (!byUrl.has(url)) byUrl.set(url, []);
        byUrl.get(url)!.push(token);
    }

    let sends = 0;
    let batches = 0;

    try {
        for (const [url, tokens] of byUrl.entries()) {
            for (const batch of chunk(tokens, 100)) {
                batches += 1;
                sends += batch.length;
                await sendBatch({
                    url,
                    tokens: batch,
                    notificationId,
                    title,
                    body,
                    targetUrl,
                });
            }
        }
    } catch (e: any) {
        return NextResponse.json(
            {
                error: "Failed to send notifications",
                detail: String(e?.message || e),
                batches,
                sends,
            },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true, subscribers: rows.length, batches, sends });
}
