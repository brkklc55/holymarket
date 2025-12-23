import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "../../../constants";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_URI;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_KV_TABLE || "holymarket_kv";

function nowIso() {
    return new Date().toISOString();
}

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

async function loadSubscribers() {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("key,value")
        .like("key", "notif_v1:%");

    if (error) throw error;

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

    return { rowsCount: rows.length, byUrl, supabase };
}

function markerKey(type: "ending15" | "resolved", marketId: bigint) {
    return `alert_v1:${type}:${marketId.toString()}`;
}

async function hasMarker(supabase: ReturnType<typeof getSupabaseClient>, key: string) {
    if (!supabase) return false;
    const { data, error } = await supabase.from(SUPABASE_TABLE).select("key").eq("key", key).maybeSingle();
    if (error) return false;
    return Boolean(data?.key);
}

async function setMarker(supabase: ReturnType<typeof getSupabaseClient>, key: string, value: any) {
    if (!supabase) return;
    const { error } = await supabase.from(SUPABASE_TABLE).upsert({ key, value });
    if (error) throw error;
}

async function broadcast(params: {
    byUrl: Map<string, string[]>;
    title: string;
    body: string;
    notificationId: string;
    targetUrl: string;
}) {
    let sends = 0;
    let batches = 0;

    for (const [url, tokens] of params.byUrl.entries()) {
        for (const batch of chunk(tokens, 100)) {
            batches += 1;
            sends += batch.length;
            await sendBatch({
                url,
                tokens: batch,
                notificationId: params.notificationId,
                title: params.title,
                body: params.body,
                targetUrl: params.targetUrl,
            });
        }
    }

    return { sends, batches };
}

export async function GET() {
    return NextResponse.json({ ok: true, at: nowIso() });
}

export async function POST(req: NextRequest) {
    try {
        const secret = String(process.env.ALERTS_CRON_SECRET || "");
        const provided = String(req.headers.get("x-cron-secret") || "");
        if (!secret || provided !== secret) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
        const marketAddress = (process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || PREDICTION_MARKET_ADDRESS) as `0x${string}`;

        const baseUrl = String(process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "https://holymarket.vercel.app").replace(/\/$/, "");

        const scanLimit = Math.min(2000, Math.max(1, Number(process.env.ALERTS_SCAN_LIMIT || "200")));
        const endingWindowSec = Math.min(86400, Math.max(60, Number(process.env.ALERTS_ENDING_WINDOW_SEC || "900")));

        const publicClient = createPublicClient({
            chain: baseSepolia,
            transport: http(rpcUrl),
        });

        const { rowsCount, byUrl, supabase } = await loadSubscribers();

        const count = (await publicClient.readContract({
            address: marketAddress,
            abi: PREDICTION_MARKET_ABI,
            functionName: "marketCount",
        })) as unknown as bigint;

        const nowSec = BigInt(Math.floor(Date.now() / 1000));

        const from = count > BigInt(scanLimit) ? count - BigInt(scanLimit) + 1n : 1n;

        let evaluated = 0;
        let endingCandidates = 0;
        let resolvedCandidates = 0;
        let sent = 0;
        let batches = 0;

        for (let id = count; id >= from; id--) {
            evaluated += 1;

            const m: any = await publicClient.readContract({
                address: marketAddress,
                abi: PREDICTION_MARKET_ABI,
                functionName: "markets",
                args: [id],
            });

            const question = String(m?.[0] || "");
            const endTime = BigInt(m?.[1] ?? 0);
            const resolved = Boolean(m?.[4]);
            const cancelled = Boolean(m?.[5]);
            const outcome = Boolean(m?.[6]);

            if (cancelled) continue;

            if (!resolved) {
                const diff = endTime > nowSec ? endTime - nowSec : 0n;
                if (diff > 0n && diff <= BigInt(endingWindowSec)) {
                    endingCandidates += 1;
                    const key = markerKey("ending15", id);
                    if (await hasMarker(supabase, key)) continue;

                    const title = "Market ending soon";
                    const body = `\"${question.slice(0, 80)}\" ends in ${Math.floor(Number(diff) / 60)}m`;
                    const notificationId = `ending15-${id.toString()}`;
                    const targetUrl = `${baseUrl}/?marketId=${id.toString()}`;

                    const r = await broadcast({ byUrl, title, body, notificationId, targetUrl });
                    sent += r.sends;
                    batches += r.batches;

                    await setMarker(supabase, key, { at: nowIso(), type: "ending15", marketId: id.toString() });
                }
                continue;
            }

            // resolved
            resolvedCandidates += 1;
            const key = markerKey("resolved", id);
            if (await hasMarker(supabase, key)) continue;

            const title = "Market resolved";
            const body = `#${id.toString()} result: ${outcome ? "YES" : "NO"} — tap to claim`;
            const notificationId = `resolved-${id.toString()}`;
            const targetUrl = `${baseUrl}/?marketId=${id.toString()}`;

            const r = await broadcast({ byUrl, title, body, notificationId, targetUrl });
            sent += r.sends;
            batches += r.batches;

            await setMarker(supabase, key, { at: nowIso(), type: "resolved", marketId: id.toString() });
        }

        return NextResponse.json({
            ok: true,
            subscribers: rowsCount,
            evaluated,
            endingCandidates,
            resolvedCandidates,
            batches,
            sends: sent,
            at: nowIso(),
        });
    } catch (e: any) {
        return NextResponse.json(
            {
                error: "Internal error",
                message: String(e?.message || e || "unknown"),
            },
            { status: 500 },
        );
    }
}
