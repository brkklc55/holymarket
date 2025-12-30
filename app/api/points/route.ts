import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { createPublicClient, http, decodeFunctionData, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from "../../constants";

export const runtime = "nodejs";

type Address = string;

type PointsUser = {
    points: number;
    volumeBnb?: number;
    referrer?: Address;
    createdAt: string;
    updatedAt: string;
};

type PointsDb = {
    users: Record<Address, PointsUser>;
    devices?: Record<string, { accounts: Address[]; firstSeenAt: string; lastSeenAt: string }>;
    admins?: Record<Address, { role: "superadmin" | "admin"; createdAt: string; updatedAt: string }>;
    shareBoosts?: Record<string, { user: Address; extra: number; createdAt: string }>;
};

const DATA_FILE = process.env.VERCEL
    ? path.join("/tmp", "points.json")
    : path.join(process.cwd(), "data", "points.json");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_KV_TABLE || "holymarket_kv";
const SUPABASE_DB_KEY = process.env.SUPABASE_POINTS_KEY || "points_db_v1";
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const ADMIN_ADDRESSES = [
    "0x33713b87bab352c46bba4953ab6cb11afe895d93",
    "0x96a445dd060efd79ab27742de12128f24b4edaec",
    "0x3DF3b1C5A77Ff85FF25727E54685b17171CC2526",
];

const rateState: Map<string, { count: number; resetAt: number }> = new Map();

function getClientIp(req: NextRequest) {
    const xf = req.headers.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
    const xr = req.headers.get("x-real-ip");
    if (xr) return xr.trim();
    return "unknown";
}

function sanitizeIsoDate(input: any): string | undefined {
    if (input === undefined || input === null || input === "") return undefined;
    if (typeof input !== "string") return undefined;
    const s = input.trim();
    if (!s) return undefined;
    const t = Date.parse(s);
    if (!Number.isFinite(t)) return undefined;
    return new Date(t).toISOString();
}

function getDeviceId(req: NextRequest) {
    return (req.headers.get("x-device-id") || "unknown").slice(0, 128);
}

function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const existing = rateState.get(key);
    if (!existing || existing.resetAt <= now) {
        rateState.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true as const, remaining: limit - 1, resetAt: now + windowMs };
    }
    if (existing.count >= limit) {
        return { ok: false as const, remaining: 0, resetAt: existing.resetAt };
    }
    existing.count += 1;
    rateState.set(key, existing);
    return { ok: true as const, remaining: limit - existing.count, resetAt: existing.resetAt };
}

function nowIso() {
    return new Date().toISOString();
}

function normalizeAddress(addr: string) {
    return addr.trim().toLowerCase();
}

function makeInitialDb(): PointsDb {
    const initial: PointsDb = { users: {}, devices: {}, admins: {}, shareBoosts: {} };
    // Bootstrap initial admins: first is superadmin, rest are admins
    ADMIN_ADDRESSES.forEach((a, idx) => {
        const addr = normalizeAddress(a);
        initial.admins![addr] = { role: idx === 0 ? "superadmin" : "admin", createdAt: nowIso(), updatedAt: nowIso() };
    });
    return initial;
}

function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

const basePublicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://base-sepolia.publicnode.com"),
});

async function getUserFromSupabase(addr: string): Promise<{ user: string; points: number; referrer: string | null; volumeBnb: number } | null> {
    const supabase = getSupabaseClient();
    if (!USE_SUPABASE || !supabase) return null;
    const address = normalizeAddress(addr);
    const { data, error } = await supabase
        .from("users")
        .select("address,points,referrer_address,volume_eth")
        .eq("address", address)
        .maybeSingle();
    if (error || !data) return null;
    return {
        user: String(data.address),
        points: Number(data.points || 0),
        referrer: (data as any).referrer_address ? String((data as any).referrer_address) : null,
        volumeBnb: Number((data as any).volume_eth || 0),
    };
}

async function getLeaderboardFromSupabase(params?: { offset?: number; limit?: number }): Promise<Array<{ user: string; points: number }> | null> {
    const supabase = getSupabaseClient();
    if (!USE_SUPABASE || !supabase) return null;
    const offset = Math.max(0, Math.floor(params?.offset ?? 0));
    const limit = Math.max(1, Math.floor(params?.limit ?? 50));
    const from = offset;
    const to = offset + limit - 1;

    const { data, error } = await supabase
        .from("users")
        .select("address,points")
        .order("points", { ascending: false })
        .range(from, to);
    if (error || !data) return null;
    return data.map((r: any) => ({ user: String(r.address), points: Number(r.points || 0) }));
}

async function ensureUserExistsSupabase(addressRaw: string) {
    const supabase = getSupabaseClient();
    if (!USE_SUPABASE || !supabase) return;
    const address = normalizeAddress(addressRaw);

    const { error } = await supabase.from("users").upsert({ address }, { onConflict: "address" });
    if (error) throw error;
}

async function trackDeviceAccountSupabase(params: { deviceId: string; address: string }): Promise<{ accountsCount: number } | null> {
    const supabase = getSupabaseClient();
    if (!USE_SUPABASE || !supabase) return null;
    const deviceId = (params.deviceId || "unknown").slice(0, 128);
    const address = normalizeAddress(params.address);
    const now = nowIso();

    await ensureUserExistsSupabase(address);

    const upsertDevice = await supabase.from("devices").upsert({ device_id: deviceId, last_seen_at: now }, { onConflict: "device_id" });
    if (upsertDevice.error) throw upsertDevice.error;

    const upsertDeviceAccount = await supabase
        .from("device_accounts")
        .upsert({ device_id: deviceId, address, last_seen_at: now }, { onConflict: "device_id,address" });
    if (upsertDeviceAccount.error) throw upsertDeviceAccount.error;

    const { count, error } = await supabase
        .from("device_accounts")
        .select("address", { count: "exact", head: true })
        .eq("device_id", deviceId);

    if (error) throw error;

    return { accountsCount: count || 0 };
}

async function incrementUserSupabase(params: { address: string; pointsDelta?: number; volumeDelta?: number }) {
    const supabase = getSupabaseClient();
    if (!USE_SUPABASE || !supabase) return null;
    const address = normalizeAddress(params.address);
    const pointsDelta = Math.floor(Number(params.pointsDelta || 0));
    const volumeDelta = Number(params.volumeDelta || 0);

    await ensureUserExistsSupabase(address);
    const current = await getUserFromSupabase(address);
    const nextPoints = Math.max(0, Math.floor(Number(current?.points || 0) + pointsDelta));
    const nextVol = Number(current?.volumeBnb || 0) + (Number.isFinite(volumeDelta) && volumeDelta > 0 ? volumeDelta : 0);

    const { error } = await supabase
        .from("users")
        .update({ points: nextPoints, volume_eth: nextVol, updated_at: nowIso() })
        .eq("address", address);

    if (error) throw error;

    return { points: nextPoints, volumeBnb: nextVol, referrer: current?.referrer || null };
}

async function validateShareBoostTx(params: { txHash: string; user: string }) {
    const nowSec = Math.floor(Date.now() / 1000);
    const user = normalizeAddress(params.user);
    const txHash = params.txHash as `0x${string}`;
    const marketAddress = normalizeAddress(
        (process.env.PREDICTION_MARKET_ADDRESS || process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || PREDICTION_MARKET_ADDRESS) as string
    );

    const tx = await basePublicClient.getTransaction({ hash: txHash });
    if (!tx.to) return { ok: false as const, error: "Invalid tx" };
    if (normalizeAddress(tx.to) !== marketAddress) {
        return { ok: false as const, error: "Tx not sent to market contract" };
    }
    if (normalizeAddress(tx.from) !== user) {
        return { ok: false as const, error: "Tx not sent from this wallet" };
    }

    let decoded: { functionName: string; args?: readonly unknown[] };
    try {
        decoded = decodeFunctionData({
            abi: PREDICTION_MARKET_ABI,
            data: tx.input,
        }) as any;
    } catch {
        return { ok: false as const, error: "Tx is not a valid contract call" };
    }
    if (decoded.functionName !== "bet") {
        return { ok: false as const, error: "Tx is not a bet()" };
    }
    if (!tx.value || tx.value <= 0n) {
        return { ok: false as const, error: "Bet value is zero" };
    }

    // Require tx is recent (last 10 minutes)
    const receipt = await basePublicClient.getTransactionReceipt({ hash: txHash });
    const block = await basePublicClient.getBlock({ blockNumber: receipt.blockNumber });
    const ageSec = nowSec - Number(block.timestamp);
    if (ageSec > 10 * 60) {
        return { ok: false as const, error: "Bet is too old to claim a boost" };
    }

    return { ok: true as const, valueBnb: Number(formatEther(tx.value)), ageSec };
}

async function loadDbFromFile(): Promise<PointsDb> {
    if (process.env.VERCEL) {
        try {
            const seedFile = path.join(process.cwd(), "data", "points.json");
            if (!fs.existsSync(DATA_FILE) && fs.existsSync(seedFile)) {
                fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
                fs.copyFileSync(seedFile, DATA_FILE);
            }
        } catch {
            // ignore bootstrap failures
        }
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        const initial = makeInitialDb();
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
        return initial;
    }

    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!parsed.devices || typeof parsed.devices !== "object" || Array.isArray(parsed.devices)) parsed.devices = {};
    if (!parsed.admins || typeof parsed.admins !== "object" || Array.isArray(parsed.admins)) parsed.admins = {};
    if (!parsed.shareBoosts || typeof parsed.shareBoosts !== "object" || Array.isArray(parsed.shareBoosts)) parsed.shareBoosts = {};

    let adminChanged = false;
    ADMIN_ADDRESSES.forEach((a, idx) => {
        const addr = normalizeAddress(a);
        if (!parsed.admins[addr]) {
            parsed.admins[addr] = { role: idx === 0 ? "superadmin" : "admin", createdAt: nowIso(), updatedAt: nowIso() };
            adminChanged = true;
        }
    });

    if (adminChanged) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
}

async function saveDbToFile(db: PointsDb) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

async function loadDb(): Promise<PointsDb> {
    if (!USE_SUPABASE) return loadDbFromFile();

    const supabase = getSupabaseClient();
    if (!supabase) return loadDbFromFile();

    const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("value")
        .eq("key", SUPABASE_DB_KEY)
        .maybeSingle();

    if (error) {
        return loadDbFromFile();
    }

    if (!data?.value) {
        const initial = makeInitialDb();
        await supabase.from(SUPABASE_TABLE).upsert({ key: SUPABASE_DB_KEY, value: initial });
        return initial;
    }

    const parsed = data.value as any;
    if (!parsed.devices || typeof parsed.devices !== "object" || Array.isArray(parsed.devices)) parsed.devices = {};
    if (!parsed.admins || typeof parsed.admins !== "object" || Array.isArray(parsed.admins)) parsed.admins = {};
    if (!parsed.shareBoosts || typeof parsed.shareBoosts !== "object" || Array.isArray(parsed.shareBoosts)) parsed.shareBoosts = {};

    let adminChanged = false;
    ADMIN_ADDRESSES.forEach((a, idx) => {
        const addr = normalizeAddress(a);
        if (!parsed.admins[addr]) {
            parsed.admins[addr] = { role: idx === 0 ? "superadmin" : "admin", createdAt: nowIso(), updatedAt: nowIso() };
            adminChanged = true;
        }
    });

    if (adminChanged) {
        await supabase.from(SUPABASE_TABLE).upsert({ key: SUPABASE_DB_KEY, value: parsed });
    }

    return parsed as PointsDb;
}

async function saveDb(db: PointsDb) {
    if (!USE_SUPABASE) return saveDbToFile(db);
    const supabase = getSupabaseClient();
    if (!supabase) return saveDbToFile(db);
    await supabase.from(SUPABASE_TABLE).upsert({ key: SUPABASE_DB_KEY, value: db });
}

function getOrCreateUser(db: PointsDb, address: Address): PointsUser {
    const addr = normalizeAddress(address);
    const existing = db.users[addr];
    if (existing) return existing;
    const created: PointsUser = { points: 0, volumeBnb: 0, createdAt: nowIso(), updatedAt: nowIso() };
    db.users[addr] = created;
    return created;
}

function trackDeviceAccount(db: PointsDb, deviceId: string, address: Address) {
    const did = deviceId || "unknown";
    if (!db.devices) db.devices = {};
    const addr = normalizeAddress(address);
    const now = nowIso();
    const entry = db.devices[did] || { accounts: [], firstSeenAt: now, lastSeenAt: now };
    entry.lastSeenAt = now;
    if (!entry.accounts.includes(addr)) entry.accounts.push(addr);
    db.devices[did] = entry;
    return entry;
}

function getAdminRole(db: PointsDb, addr?: string | null) {
    if (!addr) return null;
    const a = normalizeAddress(addr);
    const entry = db.admins?.[a];
    return entry?.role || null;
}

function requireAdmin(db: PointsDb, addr?: string | null, minimum: "admin" | "superadmin" = "admin") {
    const role = getAdminRole(db, addr);
    if (!role) return { ok: false as const, role: null as null };
    if (minimum === "superadmin" && role !== "superadmin") return { ok: false as const, role };
    return { ok: true as const, role };
}

function computeLeaderboard(db: PointsDb, params?: { offset?: number; limit?: number }) {
    const offset = Math.max(0, Math.floor(params?.offset ?? 0));
    const limit = Math.max(1, Math.floor(params?.limit ?? 50));
    return Object.entries(db.users)
        .map(([user, u]) => ({ user, points: u.points }))
        .sort((a, b) => b.points - a.points)
        .slice(offset, offset + limit);
}

function getBnbUsdRate() {
    const raw = process.env.NEXT_PUBLIC_BNB_USD || process.env.BNB_USD || "300";
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 300;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const user = url.searchParams.get("user");
    const whoami = url.searchParams.get("whoami");

    const pageRaw = url.searchParams.get("page");
    const limitRaw = url.searchParams.get("limit");
    const page = Math.max(1, Math.floor(Number(pageRaw || "1")));
    const limit = Math.min(200, Math.max(1, Math.floor(Number(limitRaw || "50"))));
    const offset = (page - 1) * limit;

    if (whoami) {
        const db = await loadDb();
        const role = getAdminRole(db, whoami);
        return NextResponse.json({ role });
    }

    if (user) {
        const addr = normalizeAddress(user);
        const supaUser = await getUserFromSupabase(addr);
        const supaLb = await getLeaderboardFromSupabase({ offset, limit: limit + 1 });
        if (supaUser || supaLb) {
            const slice = (supaLb || []).slice(0, limit);
            const hasMore = (supaLb || []).length > limit;
            return NextResponse.json({
                user: supaUser ? { user: supaUser.user, points: supaUser.points, referrer: supaUser.referrer } : null,
                leaderboard: slice,
                page,
                limit,
                hasMore,
            });
        }

        const db = await loadDb();
        const u = db.users[addr];
        const full = Object.keys(db.users).length;
        const leaderboard = computeLeaderboard(db, { offset, limit });
        const hasMore = offset + leaderboard.length < full;
        return NextResponse.json({
            user: u ? { user: addr, points: u.points, referrer: u.referrer || null } : null,
            leaderboard,
            page,
            limit,
            hasMore,
        });
    }

    const supaLb = await getLeaderboardFromSupabase({ offset, limit: limit + 1 });
    if (supaLb) {
        const slice = supaLb.slice(0, limit);
        const hasMore = supaLb.length > limit;
        return NextResponse.json({ leaderboard: slice, page, limit, hasMore });
    }

    const db = await loadDb();
    const full = Object.keys(db.users).length;
    const leaderboard = computeLeaderboard(db, { offset, limit });
    const hasMore = offset + leaderboard.length < full;
    return NextResponse.json({ leaderboard, page, limit, hasMore });
}

export async function POST(req: NextRequest) {
    const db = await loadDb();
    const ip = getClientIp(req);
    const deviceId = getDeviceId(req);

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const action = body?.action;
    if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

    // Basic anti-abuse
    // - bindReferral: 10 / day / ip+device
    // - earn: 120 / hour / ip+device
    // - shareBoost: 30 / day / ip+device
    // - admin actions: no rate limit
    if (action === "bindReferral") {
        const rl = rateLimit(`bind:${ip}:${deviceId}`, 10, 24 * 60 * 60 * 1000);
        if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    if (action === "earn") {
        const rl = rateLimit(`earn:${ip}:${deviceId}`, 120, 60 * 60 * 1000);
        if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    if (action === "shareBoost") {
        const rl = rateLimit(`share:${ip}:${deviceId}`, 30, 24 * 60 * 60 * 1000);
        if (!rl.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    if (action === "bindReferral") {
        const userRaw = body?.user;
        const referrerRaw = body?.referrer;
        if (!userRaw || !referrerRaw) return NextResponse.json({ error: "Missing user/referrer" }, { status: 400 });

        const user = normalizeAddress(userRaw);
        const referrer = normalizeAddress(referrerRaw);
        if (user === referrer) return NextResponse.json({ ok: true, skipped: true });

        const supaDevice = await trackDeviceAccountSupabase({ deviceId, address: user });
        if (supaDevice) {
            // Beta rule: max 3 accounts per device
            if (supaDevice.accountsCount > 3) {
                return NextResponse.json({ error: "Device account limit reached" }, { status: 403 });
            }

            await ensureUserExistsSupabase(referrer);
            try {
                const supabase = getSupabaseClient();
                if (!USE_SUPABASE || !supabase) {
                    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
                }

                const current = await getUserFromSupabase(user);
                if (current?.referrer) {
                    return NextResponse.json({ ok: true, skipped: true, reason: "already_bound", storage: "supabase" });
                }

                // Only bind if referrer is not already set (atomic)
                const { data: boundRows, error: refErr } = await supabase
                    .from("users")
                    .update({ referrer_address: referrer, updated_at: nowIso() })
                    .eq("address", user)
                    .is("referrer_address", null)
                    .select("address");
                if (refErr) throw refErr;

                if (!boundRows || boundRows.length === 0) {
                    return NextResponse.json({ ok: true, skipped: true, reason: "already_bound", storage: "supabase" });
                }

                await incrementUserSupabase({ address: user, pointsDelta: 50 });
                await incrementUserSupabase({ address: referrer, pointsDelta: 50 });

                return NextResponse.json({ ok: true, awarded: 50, storage: "supabase" });
            } catch (e: any) {
                return NextResponse.json(
                    { error: "Supabase write failed", detail: String(e?.message || e) },
                    { status: 500 }
                );
            }
        }

        // Track device and limit multi-account referral abuse
        const deviceEntry = trackDeviceAccount(db, deviceId, user);
        // Beta rule: max 3 accounts per device
        if (deviceEntry.accounts.length > 3) {
            await saveDb(db);
            return NextResponse.json({ error: "Device account limit reached" }, { status: 403 });
        }

        const u = getOrCreateUser(db, user);
        getOrCreateUser(db, referrer);

        if (u.referrer) {
            return NextResponse.json({ ok: true, skipped: true, reason: "already_bound" });
        }

        u.referrer = referrer;
        u.points += 50;
        u.updatedAt = nowIso();

        const r = db.users[referrer];
        r.points += 50;
        r.updatedAt = nowIso();

        await saveDb(db);
        return NextResponse.json({ ok: true, awarded: 50, storage: "fallback" });
    }

    if (action === "earn") {
        const userRaw = body?.user;
        const amountUsdRaw = body?.amountUsd;
        const amountBnbRaw = body?.amountBnb;

        if (!userRaw) return NextResponse.json({ error: "Missing user" }, { status: 400 });

        const user = normalizeAddress(userRaw);

        const supaDevice = await trackDeviceAccountSupabase({ deviceId, address: user });
        if (supaDevice) {
            if (supaDevice.accountsCount > 3) {
                return NextResponse.json({ error: "Device account limit reached" }, { status: 403 });
            }

            let usdAmount: number | null = null;
            if (amountUsdRaw !== undefined && amountUsdRaw !== null) {
                const n = Number(amountUsdRaw);
                usdAmount = Number.isFinite(n) && n > 0 ? n : null;
            } else if (amountBnbRaw !== undefined && amountBnbRaw !== null) {
                const bnb = Number(amountBnbRaw);
                if (Number.isFinite(bnb) && bnb > 0) {
                    usdAmount = bnb * getBnbUsdRate();
                }
            }
            if (!usdAmount) return NextResponse.json({ error: "Missing/invalid amountUsd or amountBnb" }, { status: 400 });

            try {
                const earned = Math.floor(usdAmount * 10);
                if (earned <= 0) return NextResponse.json({ ok: true, earned: 0, bonus: 0 });

                const volume = amountBnbRaw !== undefined && amountBnbRaw !== null ? Number(amountBnbRaw) : 0;
                const updated = await incrementUserSupabase({ address: user, pointsDelta: earned, volumeDelta: volume });

                let bonus = 0;
                if (updated?.referrer) {
                    bonus = Math.floor(earned * 0.1);
                    if (bonus > 0) {
                        await incrementUserSupabase({ address: updated.referrer, pointsDelta: bonus });
                    }
                }

                const leaderboard = await getLeaderboardFromSupabase();
                return NextResponse.json({ ok: true, earned, bonus, leaderboard: leaderboard || [], storage: "supabase" });
            } catch (e: any) {
                return NextResponse.json(
                    { error: "Supabase write failed", detail: String(e?.message || e) },
                    { status: 500 }
                );
            }
        }

        const deviceEntry = trackDeviceAccount(db, deviceId, user);
        if (deviceEntry.accounts.length > 3) {
            await saveDb(db);
            return NextResponse.json({ error: "Device account limit reached" }, { status: 403 });
        }
        const u = getOrCreateUser(db, user);

        let usdAmount: number | null = null;
        if (amountUsdRaw !== undefined && amountUsdRaw !== null) {
            const n = Number(amountUsdRaw);
            usdAmount = Number.isFinite(n) && n > 0 ? n : null;
        } else if (amountBnbRaw !== undefined && amountBnbRaw !== null) {
            const bnb = Number(amountBnbRaw);
            if (Number.isFinite(bnb) && bnb > 0) {
                usdAmount = bnb * getBnbUsdRate();
            }
        }

        if (!usdAmount) return NextResponse.json({ error: "Missing/invalid amountUsd or amountBnb" }, { status: 400 });

        // Track cumulative bet volume (best-effort)
        if (amountBnbRaw !== undefined && amountBnbRaw !== null) {
            const bnb = Number(amountBnbRaw);
            if (Number.isFinite(bnb) && bnb > 0) {
                u.volumeBnb = Number(u.volumeBnb || 0) + bnb;
            }
        }

        const earned = Math.floor(usdAmount * 10);
        if (earned <= 0) return NextResponse.json({ ok: true, earned: 0, bonus: 0 });

        u.points += earned;
        u.updatedAt = nowIso();

        let bonus = 0;
        if (u.referrer) {
            const ref = getOrCreateUser(db, u.referrer);
            bonus = Math.floor(earned * 0.1);
            if (bonus > 0) {
                ref.points += bonus;
                ref.updatedAt = nowIso();
            }
        }

        await saveDb(db);
        return NextResponse.json({ ok: true, earned, bonus, leaderboard: computeLeaderboard(db), storage: "fallback" });
    }

    if (action === "shareBoost") {
        const userRaw = body?.user;
        const txHashRaw = body?.txHash;
        const amountUsdRaw = body?.amountUsd;
        const amountBnbRaw = body?.amountBnb;

        if (!userRaw) return NextResponse.json({ error: "Missing user" }, { status: 400 });
        if (!txHashRaw || typeof txHashRaw !== "string") return NextResponse.json({ error: "Missing txHash" }, { status: 400 });

        const txHash = txHashRaw.trim();
        if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return NextResponse.json({ error: "Invalid txHash" }, { status: 400 });

        const user = normalizeAddress(userRaw);

        // Validate txHash is a real bet tx from this user (anti-abuse)
        try {
            const valid = await validateShareBoostTx({ txHash, user });
            if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 });

            // Prefer on-chain value over client-provided amount
            if (valid.valueBnb > 0) {
                // eslint-disable-next-line no-param-reassign
                body.amountBnb = valid.valueBnb;
            }
        } catch {
            return NextResponse.json({ error: "Failed to validate bet tx" }, { status: 400 });
        }

        const deviceEntry = trackDeviceAccount(db, deviceId, user);
        if (deviceEntry.accounts.length > 3) {
            await saveDb(db);
            return NextResponse.json({ error: "Device account limit reached" }, { status: 403 });
        }

        if (!db.shareBoosts) db.shareBoosts = {};
        if (db.shareBoosts[txHash]) {
            return NextResponse.json({ ok: true, skipped: true, reason: "already_boosted" });
        }

        let usdAmount: number | null = null;
        if (amountUsdRaw !== undefined && amountUsdRaw !== null) {
            const n = Number(amountUsdRaw);
            usdAmount = Number.isFinite(n) && n > 0 ? n : null;
        } else if (amountBnbRaw !== undefined && amountBnbRaw !== null) {
            const bnb = Number(amountBnbRaw);
            if (Number.isFinite(bnb) && bnb > 0) {
                usdAmount = bnb * getBnbUsdRate();
            }
        }
        if (!usdAmount) return NextResponse.json({ error: "Missing/invalid amountUsd or amountBnb" }, { status: 400 });

        const extra = Math.floor(usdAmount * 10);
        if (extra <= 0) return NextResponse.json({ ok: true, extra: 0, skipped: true });

        const u = getOrCreateUser(db, user);
        u.points += extra;
        // Track cumulative volume from validated tx value
        if (body.amountBnb !== undefined && body.amountBnb !== null) {
            const bnb = Number(body.amountBnb);
            if (Number.isFinite(bnb) && bnb > 0) {
                u.volumeBnb = Number(u.volumeBnb || 0) + bnb;
            }
        }
        u.updatedAt = nowIso();

        db.shareBoosts[txHash] = { user, extra, createdAt: nowIso() };
        await saveDb(db);

        return NextResponse.json({ ok: true, extra, leaderboard: computeLeaderboard(db) });
    }


    if (action === "adminResetAll") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "superadmin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

        // Reset local DB state
        db.users = {};
        db.devices = {};
        if (db.shareBoosts) db.shareBoosts = {};

        let supabaseStats: any = {};

        // Deep reset Supabase if enabled
        if (USE_SUPABASE) {
            const supabase = getSupabaseClient();
            if (supabase) {
                try {
                    // Try to delete everything from core tables
                    const { count: uDel } = await supabase.from("users").delete({ count: 'exact' }).gt("points", -999999);
                    const { count: dDel } = await supabase.from("devices").delete({ count: 'exact' }).not("device_id", "is", null);
                    const { count: aDel } = await supabase.from("device_accounts").delete({ count: 'exact' }).not("device_id", "is", null);

                    const { data: allKeys } = await supabase.from(SUPABASE_TABLE).select("key");
                    if (allKeys) {
                        for (const k of allKeys) {
                            if (k.key.startsWith("points_db_") || k.key === "points_db_v1") {
                                await supabase.from(SUPABASE_TABLE).delete().eq("key", k.key);
                            }
                        }
                    }

                    supabaseStats = {
                        usersDeleted: uDel,
                        devicesDeleted: dDel,
                        accountsDeleted: aDel,
                        keysFound: allKeys?.map(k => k.key) || []
                    };
                } catch (e) {
                    console.error("Supabase nuke failed:", e);
                    supabaseStats = { error: String(e) };
                }
            }
        }

        await saveDb(db);
        return NextResponse.json({
            ok: true,
            message: "Global Nuke completed.",
            stats: supabaseStats,
            env: { kvTable: SUPABASE_TABLE, dbKey: SUPABASE_DB_KEY }
        });
    }

    if (action === "adminAdjust") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "admin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

        const userRaw = body?.user;
        const deltaRaw = body?.delta;
        if (!userRaw || deltaRaw === undefined || deltaRaw === null) {
            return NextResponse.json({ error: "Missing user/delta" }, { status: 400 });
        }

        const user = normalizeAddress(userRaw);
        const delta = Number(deltaRaw);
        if (!Number.isFinite(delta)) return NextResponse.json({ error: "Invalid delta" }, { status: 400 });

        const u = getOrCreateUser(db, user);
        u.points = Math.max(0, Math.floor(u.points + delta));
        u.updatedAt = nowIso();
        await saveDb(db);
        return NextResponse.json({ ok: true, user: { user, points: u.points }, leaderboard: computeLeaderboard(db) });
    }

    if (action === "adminList") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "admin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        const admins = Object.entries(db.admins || {}).map(([address, a]) => ({ address, role: a.role, createdAt: a.createdAt, updatedAt: a.updatedAt }));
        admins.sort((x, y) => (x.role === y.role ? x.address.localeCompare(y.address) : x.role === "superadmin" ? -1 : 1));
        return NextResponse.json({ ok: true, role: auth.role, admins });
    }

    if (action === "adminUpsert") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "superadmin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

        const targetRaw = body?.target;
        const roleRaw = body?.role;
        if (!targetRaw || (roleRaw !== "admin" && roleRaw !== "superadmin")) {
            return NextResponse.json({ error: "Missing/invalid target/role" }, { status: 400 });
        }

        const target = normalizeAddress(targetRaw);
        const now = nowIso();
        if (!db.admins) db.admins = {};
        const existing = db.admins[target];
        db.admins[target] = {
            role: roleRaw,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
        };
        await saveDb(db);
        return NextResponse.json({ ok: true });
    }

    if (action === "adminRemove") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "superadmin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

        const targetRaw = body?.target;
        if (!targetRaw) return NextResponse.json({ error: "Missing target" }, { status: 400 });
        const target = normalizeAddress(targetRaw);

        const current = db.admins?.[target];
        if (!current) return NextResponse.json({ ok: true, skipped: true });

        if (current.role === "superadmin") {
            const superadminCount = Object.values(db.admins || {}).filter((a) => a.role === "superadmin").length;
            if (superadminCount <= 1) {
                return NextResponse.json({ error: "Cannot remove last superadmin" }, { status: 400 });
            }
        }

        delete db.admins![target];
        await saveDb(db);
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
