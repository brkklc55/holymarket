import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase client (fallback to memory if not configured)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Memory fallback for lottery data
const memoryLottery: Record<string, { lastSpin: number; streak: number }> = {};

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");

    if (!user) {
        return NextResponse.json({ error: "User required" }, { status: 400 });
    }

    let lastSpin = 0;
    let streak = 0;

    if (supabase) {
        const { data } = await supabase
            .from("lottery")
            .select("*")
            .eq("user_address", user.toLowerCase())
            .single();

        if (data) {
            lastSpin = new Date(data.last_spin).getTime();
            streak = data.streak || 0;
        }
    } else {
        const entry = memoryLottery[user.toLowerCase()];
        if (entry) {
            lastSpin = entry.lastSpin;
            streak = entry.streak;
        }
    }

    const now = Date.now();
    const canSpin = now - lastSpin >= COOLDOWN_MS;
    const cooldownEnd = lastSpin + COOLDOWN_MS;

    return NextResponse.json({
        canSpin,
        cooldownEnd: canSpin ? null : cooldownEnd,
        streak
    });
}

export async function POST(req: NextRequest) {
    const { user } = await req.json();

    if (!user) {
        return NextResponse.json({ error: "User required" }, { status: 400 });
    }

    let lastSpin = 0;
    let streak = 0;

    if (supabase) {
        const { data } = await supabase
            .from("lottery")
            .select("*")
            .eq("user_address", user.toLowerCase())
            .single();

        if (data) {
            lastSpin = new Date(data.last_spin).getTime();
            streak = data.streak || 0;
        }
    } else {
        const entry = memoryLottery[user.toLowerCase()];
        if (entry) {
            lastSpin = entry.lastSpin;
            streak = entry.streak;
        }
    }

    const now = Date.now();
    if (now - lastSpin < COOLDOWN_MS) {
        return NextResponse.json({ error: "On cooldown" }, { status: 400 });
    }

    // Determine prize (weighted random)
    // 5-10: 50%
    // 15-25: 37%
    // 50-75: 11%
    // 100: 2%
    const rand = Math.random() * 100;
    let prize = 5;
    if (rand < 2) prize = 100;
    else if (rand < 13) prize = 50 + Math.floor(Math.random() * 26); // 50-75
    else if (rand < 50) prize = 15 + Math.floor(Math.random() * 11); // 15-25
    else prize = 5 + Math.floor(Math.random() * 6); // 5-10

    // Round prize to nearest segment value for simplicity
    const segments = [5, 10, 15, 20, 25, 50, 75, 100];
    prize = segments.reduce((prev, curr) =>
        Math.abs(curr - prize) < Math.abs(prev - prize) ? curr : prev
    );

    // Update streak (reset if more than 48h since last spin)
    const newStreak = (now - lastSpin < 2 * COOLDOWN_MS) ? streak + 1 : 1;

    // Apply streak bonus (e.g., +50% for 7+ days)
    let finalPrize = prize;
    if (newStreak >= 7) {
        finalPrize = Math.floor(prize * 1.5);
    }

    if (supabase) {
        // First try to award points in the points table
        const { data: pointsData } = await supabase
            .from("user_points")
            .select("points")
            .eq("user_address", user.toLowerCase())
            .single();

        if (pointsData) {
            await supabase
                .from("user_points")
                .update({ points: pointsData.points + finalPrize })
                .eq("user_address", user.toLowerCase());
        }

        // Update lottery table
        const { error } = await supabase
            .from("lottery")
            .upsert({
                user_address: user.toLowerCase(),
                last_spin: new Date().toISOString(),
                streak: newStreak
            }, { onConflict: 'user_address' });

        if (error) console.error("Lottery update error:", error);
    } else {
        memoryLottery[user.toLowerCase()] = { lastSpin: now, streak: newStreak };
    }

    return NextResponse.json({
        ok: true,
        prize: finalPrize,
        streak: newStreak,
        cooldownEnd: now + COOLDOWN_MS
    });
}
