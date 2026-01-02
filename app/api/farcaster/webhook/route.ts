import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ParseWebhookEvent, parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/miniapp-node";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_URI;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_KV_TABLE || "holymarket_kv";

function nowIso() {
    return new Date().toISOString();
}

function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

function notifKey(fid: number) {
    return `notif_v1:${fid}`;
}

async function setNotificationDetails(fid: number, notificationDetails: { token: string; url: string }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const value = {
        fid,
        token: String(notificationDetails.token),
        url: String(notificationDetails.url),
        updatedAt: nowIso(),
    };

    const { error } = await supabase.from(SUPABASE_TABLE).upsert({ key: notifKey(fid), value });
    if (error) throw error;
}

async function deleteNotificationDetails(fid: number) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.from(SUPABASE_TABLE).delete().eq("key", notifKey(fid));
    if (error) throw error;
}

export async function GET() {
    try {
        console.log("miniapp_webhook:ping", { at: nowIso() });
    } catch {
        // ignore
    }
    return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
    try {
        const raw = await request.text().catch(() => "");

        // Warpcast verification or empty probe - ALWAYS return 200 to allow manifest update
        if (!raw || raw.length < 2) {
            return NextResponse.json({ success: true, message: "Probe OK" });
        }

        let requestJson: any = null;
        try {
            requestJson = JSON.parse(raw);
        } catch {
            return NextResponse.json({ success: true, message: "Invalid JSON but OK for probe" });
        }

        if (!process.env.NEYNAR_API_KEY) {
            console.error("miniapp_webhook:missing_neynar_key");
            return NextResponse.json({ success: true, warning: "Missing NEYNAR_API_KEY" });
        }

        let data: any;
        try {
            data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
        } catch (e: any) {
            console.log("miniapp_webhook:verify_failed_but_ok_for_probe", e?.message);
            return NextResponse.json({ success: true, warning: "Verification failed but accepted for tunnel" });
        }

        const fid = Number(data?.fid);
        const event = data?.event;

        try {
            console.log("miniapp_webhook:verified", {
                at: nowIso(),
                fid,
                type: String(event?.event || ""),
                hasNotificationDetails: Boolean(event?.notificationDetails?.token && event?.notificationDetails?.url),
            });
        } catch {
            // ignore
        }

        if (!Number.isFinite(fid) || fid <= 0) {
            return NextResponse.json({ success: false, error: "Invalid fid" }, { status: 400 });
        }

        try {
            switch (event?.event) {
                case "miniapp_added":
                    if (event.notificationDetails?.token && event.notificationDetails?.url) {
                        await setNotificationDetails(fid, event.notificationDetails);
                    }
                    break;
                case "miniapp_removed":
                    await deleteNotificationDetails(fid);
                    break;
                case "notifications_enabled":
                    if (event.notificationDetails?.token && event.notificationDetails?.url) {
                        await setNotificationDetails(fid, event.notificationDetails);
                    }
                    break;
                case "notifications_disabled":
                    await deleteNotificationDetails(fid);
                    break;
                default:
                    break;
            }
        } catch (e: any) {
            return NextResponse.json(
                { success: false, error: "Failed to persist notification details", detail: String(e?.message || e) },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("miniapp_webhook:global_error", e?.message);
        return NextResponse.json({ success: true, error: "Global catch" });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
