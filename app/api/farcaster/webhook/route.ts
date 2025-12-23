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
    const contentType = String(request.headers.get("content-type") || "");
    const userAgent = String(request.headers.get("user-agent") || "");

    const raw = await request.text().catch(() => "");
    let requestJson: any = null;
    try {
        requestJson = raw ? JSON.parse(raw) : null;
    } catch {
        requestJson = null;
    }

    if (!requestJson) {
        try {
            console.log("miniapp_webhook:invalid_json", {
                at: nowIso(),
                contentType,
                userAgent,
                rawLength: raw.length,
                rawPreview: raw.slice(0, 200),
            });
        } catch {
            // ignore
        }

        return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    try {
        console.log("miniapp_webhook:received", {
            at: nowIso(),
            hasBody: true,
        });
    } catch {
        // ignore
    }

    if (!process.env.NEYNAR_API_KEY) {
        return NextResponse.json(
            { success: false, error: "Missing NEYNAR_API_KEY" },
            { status: 500 }
        );
    }

    let data: any;
    try {
        data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    } catch (e: unknown) {
        const error = e as ParseWebhookEvent.ErrorType;

        try {
            const jsonType = requestJson === null ? "null" : Array.isArray(requestJson) ? "array" : typeof requestJson;
            const keys = requestJson && typeof requestJson === "object" && !Array.isArray(requestJson) ? Object.keys(requestJson).slice(0, 30) : [];
            let approxSize = -1;
            try {
                approxSize = JSON.stringify(requestJson).length;
            } catch {
                approxSize = -1;
            }

            console.log("miniapp_webhook:verify_failed", {
                at: nowIso(),
                name: String((error as any)?.name || ""),
                message: String((error as any)?.message || ""),
                jsonType,
                keys,
                approxSize,
            });
        } catch {
            // ignore
        }

        if (
            error?.name === "VerifyJsonFarcasterSignature.InvalidDataError" ||
            error?.name === "VerifyJsonFarcasterSignature.InvalidEventDataError"
        ) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        if (error?.name === "VerifyJsonFarcasterSignature.InvalidAppKeyError") {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        if (error?.name === "VerifyJsonFarcasterSignature.VerifyAppKeyError") {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Webhook verification failed" }, { status: 400 });
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
}
