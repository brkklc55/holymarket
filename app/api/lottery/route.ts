import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

// Cooldown: 24 hours
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Prize distribution (weighted)
const PRIZES = [
    { value: 5, weight: 25 },
    { value: 10, weight: 25 },
    { value: 15, weight: 15 },
    { value: 20, weight: 12 },
    { value: 25, weight: 10 },
    { value: 50, weight: 7 },
    { value: 75, weight: 4 },
    { value: 100, weight: 2 },
];

// In-memory fallback storage
const memoryStore: Record<string, { lastSpin: number; streak: number }> = {};

function normalizeAddress(addr: string) {
    return addr.trim().toLowerCase();
}

function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

function pickPrize(): number {
    const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const prize of PRIZES) {
        rand -= prize.weight;
        if (rand <= 0) return prize.value;
    }
    return PRIZES[0].value;
}

function isSameDay(ts1: number, ts2: number): boolean {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate();
}

function isConsecutiveDay(ts1: number, ts2: number): boolean {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    d1.setUTCHours(0, 0, 0, 0);
    d2.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
    return diffDays === 1;
}

// GET: Check if user can spin
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userRaw = url.searchParams.get("user");

    if (!userRaw) {
        return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }

    const user = normalizeAddress(userRaw);
    const now = Date.now();

    const supabase = getSupabaseClient();

    if (USE_SUPABASE && supabase) {
        try {
            const { data } = await supabase
                .from("lottery")
                .select("last_spin, streak")
                .eq("address", user)
                .maybeSingle();

            if (!data) {
                return NextResponse.json({ canSpin: true, streak: 0 });
            }

            const lastSpin = new Date(data.last_spin).getTime();
            const cooldownEnd = lastSpin + COOLDOWN_MS;
            const canSpin = now >= cooldownEnd;

            return NextResponse.json({
                canSpin,
                streak: data.streak || 0,
                cooldownEnd: canSpin ? null : cooldownEnd,
            });
        } catch (e: any) {
            console.error("Lottery GET error:", e);
        }
    }

    // Fallback to memory
    const userData = memoryStore[user];
    if (!userData) {
        return NextResponse.json({ canSpin: true, streak: 0 });
    }

    const cooldownEnd = userData.lastSpin + COOLDOWN_MS;
    const canSpin = now >= cooldownEnd;

    return NextResponse.json({
        canSpin,
        streak: userData.streak || 0,
        cooldownEnd: canSpin ? null : cooldownEnd,
    });
}

// POST: Spin the wheel
export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const userRaw = body?.user;
    if (!userRaw) {
        return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }

    const user = normalizeAddress(userRaw);
    const now = Date.now();

    const supabase = getSupabaseClient();

    if (USE_SUPABASE && supabase) {
        try {
            // Get current data
            const { data: existing } = await supabase
                .from("lottery")
                .select("last_spin, streak")
                .eq("address", user)
                .maybeSingle();

            // Check cooldown
            if (existing) {
                const lastSpin = new Date(existing.last_spin).getTime();
                const cooldownEnd = lastSpin + COOLDOWN_MS;
                if (now < cooldownEnd) {
                    return NextResponse.json({
                        ok: false,
                        error: "Cooldown active",
                        cooldownEnd,
                    });
                }
            }

            // Calculate streak
            let newStreak = 1;
            if (existing) {
                const lastSpin = new Date(existing.last_spin).getTime();
                if (isConsecutiveDay(lastSpin, now)) {
                    newStreak = (existing.streak || 0) + 1;
                }
            }

            // Pick prize (bonus for 7+ day streak)
            let prize = pickPrize();
            if (newStreak >= 7) {
                prize = Math.round(prize * 1.5); // 50% bonus
            }

            // Upsert lottery record
            const nowIso = new Date(now).toISOString();
            await supabase
                .from("lottery")
                .upsert({
                    address: user,
                    last_spin: nowIso,
                    streak: newStreak,
                    total_winnings: (existing as any)?.total_winnings ? (existing as any).total_winnings + prize : prize,
                }, { onConflict: "address" });

            // Add points to user
            const { data: userData } = await supabase
                .from("users")
                .select("points")
                .eq("address", user)
                .maybeSingle();

            if (userData) {
                await supabase
                    .from("users")
                    .update({ points: (userData.points || 0) + prize, updated_at: nowIso })
                    .eq("address", user);
            } else {
                await supabase
                    .from("users")
                    .upsert({ address: user, points: prize }, { onConflict: "address" });
            }

            return NextResponse.json({
                ok: true,
                prize,
                streak: newStreak,
                cooldownEnd: now + COOLDOWN_MS,
            });
        } catch (e: any) {
            console.error("Lottery POST error:", e);
            return NextResponse.json({ error: "Database error", detail: e?.message }, { status: 500 });
        }
    }

    // Fallback to memory
    const userData = memoryStore[user] || { lastSpin: 0, streak: 0 };
    const cooldownEnd = userData.lastSpin + COOLDOWN_MS;

    if (now < cooldownEnd) {
        return NextResponse.json({
            ok: false,
            error: "Cooldown active",
            cooldownEnd,
        });
    }

    // Calculate streak
    let newStreak = 1;
    if (userData.lastSpin > 0 && isConsecutiveDay(userData.lastSpin, now)) {
        newStreak = userData.streak + 1;
    }

    // Pick prize
    let prize = pickPrize();
    if (newStreak >= 7) {
        prize = Math.round(prize * 1.5);
    }

    // Update memory
    memoryStore[user] = {
        lastSpin: now,
        streak: newStreak,
    };

    return NextResponse.json({
        ok: true,
        prize,
        streak: newStreak,
        cooldownEnd: now + COOLDOWN_MS,
    });
}
