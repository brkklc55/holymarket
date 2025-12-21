import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createPublicClient, http, decodeFunctionData, formatEther } from "viem";
import { bscTestnet } from "viem/chains";
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

type TaskType = "link" | "follow" | "checkin";

type TaskRepeat = "none" | "daily";

type TaskRequirements = {
    minPoints?: number;
    minVolumeBnb?: number;
    minFollowTasks?: number;
};

type Task = {
    id: string;
    type: TaskType;
    repeat?: TaskRepeat;
    title: string;
    description?: string;
    url: string;
    points: number;
    active: boolean;
    startAt?: string;
    endAt?: string;
    requirements?: TaskRequirements;
    createdAt: string;
    updatedAt: string;
};

type PointsDb = {
    users: Record<Address, PointsUser>;
    devices?: Record<string, { accounts: Address[]; firstSeenAt: string; lastSeenAt: string }>;
    admins?: Record<Address, { role: "superadmin" | "admin"; createdAt: string; updatedAt: string }>;
    shareBoosts?: Record<string, { user: Address; extra: number; createdAt: string }>;
    tasks?: Task[];
    // For repeat="none": taskClaims[taskId][user] = { claimedAt, points }
    // For repeat="daily": taskClaims[taskId][user] = { [utcDayKey]: { claimedAt, points } }
    taskClaims?: Record<string, Record<Address, any>>;
};

const DATA_FILE = process.env.VERCEL
    ? path.join("/tmp", "points.json")
    : path.join(process.cwd(), "data", "points.json");

const ADMIN_ADDRESSES = [
    "0x33713b87bab352c46bba4953ab6cb11afe895d93",
    "0x96a445dd060efd79ab27742de12128f24b4edaec",
];

// In-memory rate limiter (good enough for beta; resets on server restart)
const rateState: Map<string, { count: number; resetAt: number }> = new Map();

function getClientIp(req: NextRequest) {
    const xf = req.headers.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
    const xr = req.headers.get("x-real-ip");
    if (xr) return xr.trim();
    return "unknown";
}

function utcDayKey(nowMs: number) {
    const d = new Date(nowMs);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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

function isWithinTaskWindow(task: Task, nowMs: number) {
    const startMs = task.startAt ? Date.parse(task.startAt) : NaN;
    const endMs = task.endAt ? Date.parse(task.endAt) : NaN;
    if (task.startAt && Number.isFinite(startMs) && nowMs < startMs) return { ok: false as const, reason: "not_started" };
    if (task.endAt && Number.isFinite(endMs) && nowMs > endMs) return { ok: false as const, reason: "ended" };
    return { ok: true as const };
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

const bscPublicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(process.env.BSC_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545"),
});

async function validateShareBoostTx(params: { txHash: string; user: string }) {
    const nowSec = Math.floor(Date.now() / 1000);
    const user = normalizeAddress(params.user);
    const txHash = params.txHash as `0x${string}`;

    const tx = await bscPublicClient.getTransaction({ hash: txHash });
    if (!tx.to) return { ok: false as const, error: "Invalid tx" };
    if (normalizeAddress(tx.to) !== normalizeAddress(PREDICTION_MARKET_ADDRESS)) {
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
    const receipt = await bscPublicClient.getTransactionReceipt({ hash: txHash });
    const block = await bscPublicClient.getBlock({ blockNumber: receipt.blockNumber });
    const ageSec = nowSec - Number(block.timestamp);
    if (ageSec > 10 * 60) {
        return { ok: false as const, error: "Bet is too old to claim a boost" };
    }

    return { ok: true as const, valueBnb: Number(formatEther(tx.value)), ageSec };
}

function ensureDb(): PointsDb {
    if (process.env.VERCEL && !fs.existsSync(DATA_FILE)) {
        try {
            const seedFile = path.join(process.cwd(), "data", "points.json");
            if (fs.existsSync(seedFile)) {
                fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
                fs.copyFileSync(seedFile, DATA_FILE);
            }
        } catch {
            // ignore bootstrap failures
        }
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        const initial: PointsDb = { users: {}, devices: {}, admins: {}, shareBoosts: {}, tasks: [], taskClaims: {} };
        // Bootstrap initial admins: first is superadmin, rest are admins
        ADMIN_ADDRESSES.forEach((a, idx) => {
            const addr = normalizeAddress(a);
            initial.admins![addr] = { role: idx === 0 ? "superadmin" : "admin", createdAt: nowIso(), updatedAt: nowIso() };
        });
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
        return initial;
    }
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!parsed.devices || typeof parsed.devices !== "object" || Array.isArray(parsed.devices)) parsed.devices = {};
    if (!parsed.admins || typeof parsed.admins !== "object" || Array.isArray(parsed.admins)) parsed.admins = {};
    if (!parsed.shareBoosts || typeof parsed.shareBoosts !== "object" || Array.isArray(parsed.shareBoosts)) parsed.shareBoosts = {};
    if (!Array.isArray(parsed.tasks)) parsed.tasks = [];
    if (!parsed.taskClaims || typeof parsed.taskClaims !== "object" || Array.isArray(parsed.taskClaims)) parsed.taskClaims = {};
    // Ensure bootstrap admins exist even if file pre-dates this feature
    if (Object.keys(parsed.admins).length === 0 && ADMIN_ADDRESSES.length > 0) {
        ADMIN_ADDRESSES.forEach((a: string, idx: number) => {
            const addr = normalizeAddress(a);
            parsed.admins[addr] = { role: idx === 0 ? "superadmin" : "admin", createdAt: nowIso(), updatedAt: nowIso() };
        });
        writeDb(parsed);
    }
    return parsed;
}

function writeDb(db: PointsDb) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function getOrCreateUser(db: PointsDb, address: Address): PointsUser {
    const addr = normalizeAddress(address);
    const existing = db.users[addr];
    if (existing) return existing;
    const created: PointsUser = { points: 0, volumeBnb: 0, createdAt: nowIso(), updatedAt: nowIso() };
    db.users[addr] = created;
    return created;
}

function sanitizeTaskRequirements(input: any): TaskRequirements | undefined {
    if (!input || typeof input !== "object") return undefined;
    const req: TaskRequirements = {};
    if (input.minPoints !== undefined && input.minPoints !== null) {
        const v = Number(input.minPoints);
        if (Number.isFinite(v) && v >= 0) req.minPoints = Math.floor(v);
    }
    if (input.minVolumeBnb !== undefined && input.minVolumeBnb !== null) {
        const v = Number(input.minVolumeBnb);
        if (Number.isFinite(v) && v >= 0) req.minVolumeBnb = v;
    }
    if (input.minFollowTasks !== undefined && input.minFollowTasks !== null) {
        const v = Number(input.minFollowTasks);
        if (Number.isFinite(v) && v >= 0) req.minFollowTasks = Math.floor(v);
    }
    return Object.keys(req).length ? req : undefined;
}

function countUserFollowClaims(db: PointsDb, user: string) {
    const u = normalizeAddress(user);
    const tasks = db.tasks || [];
    const claims = db.taskClaims || {};
    let count = 0;
    for (const t of tasks) {
        if (t.type !== "follow") continue;
        const c = claims[t.id]?.[u];
        if (c) count += 1;
    }
    return count;
}

function checkRequirements(db: PointsDb, user: string, req?: TaskRequirements) {
    if (!req) return { ok: true as const };
    const u = getOrCreateUser(db, user);
    if (req.minPoints !== undefined && u.points < req.minPoints) {
        return { ok: false as const, error: `Requires at least ${req.minPoints} points` };
    }
    const volume = Number(u.volumeBnb || 0);
    if (req.minVolumeBnb !== undefined && volume < req.minVolumeBnb) {
        return { ok: false as const, error: `Requires at least ${req.minVolumeBnb} BNB volume` };
    }
    if (req.minFollowTasks !== undefined) {
        const follows = countUserFollowClaims(db, user);
        if (follows < req.minFollowTasks) {
            return { ok: false as const, error: `Requires completing ${req.minFollowTasks} follow tasks` };
        }
    }
    return { ok: true as const };
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

function computeLeaderboard(db: PointsDb) {
    return Object.entries(db.users)
        .map(([user, u]) => ({ user, points: u.points }))
        .sort((a, b) => b.points - a.points)
        .slice(0, 50);
}

function getBnbUsdRate() {
    const raw = process.env.NEXT_PUBLIC_BNB_USD || process.env.BNB_USD || "300";
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 300;
}

export async function GET(req: NextRequest) {
    const db = ensureDb();
    const url = new URL(req.url);
    const user = url.searchParams.get("user");
    const whoami = url.searchParams.get("whoami");
    const tasks = url.searchParams.get("tasks");

    if (whoami) {
        const role = getAdminRole(db, whoami);
        return NextResponse.json({ role });
    }

    if (tasks) {
        const u = user ? normalizeAddress(user) : null;
        const list = (db.tasks || []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const claims = db.taskClaims || {};
        const todayKey = utcDayKey(Date.now());
        const userClaims = u
            ? Object.fromEntries(
                  list.map((t) => {
                      const byUser = claims[t.id];
                      const entry = byUser?.[u];
                      if (t.repeat === "daily") {
                          return [t.id, Boolean(entry?.[todayKey])];
                      }
                      return [t.id, Boolean(entry)];
                  })
              )
            : {};
        const stats = u ? { points: db.users?.[u]?.points || 0, volumeBnb: db.users?.[u]?.volumeBnb || 0, followTasks: countUserFollowClaims(db, u) } : null;
        return NextResponse.json({ tasks: list, claims: userClaims, stats });
    }

    if (user) {
        const addr = normalizeAddress(user);
        const u = db.users[addr];
        return NextResponse.json({
            user: u ? { user: addr, points: u.points, referrer: u.referrer || null } : null,
            leaderboard: computeLeaderboard(db),
        });
    }

    return NextResponse.json({ leaderboard: computeLeaderboard(db) });
}

export async function POST(req: NextRequest) {
    const db = ensureDb();
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

        // Track device and limit multi-account referral abuse
        const deviceEntry = trackDeviceAccount(db, deviceId, user);
        // Beta rule: max 3 accounts per device
        if (deviceEntry.accounts.length > 3) {
            writeDb(db);
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

        writeDb(db);
        return NextResponse.json({ ok: true, awarded: 50 });
    }

    if (action === "earn") {
        const userRaw = body?.user;
        const amountUsdRaw = body?.amountUsd;
        const amountBnbRaw = body?.amountBnb;

        if (!userRaw) return NextResponse.json({ error: "Missing user" }, { status: 400 });

        const user = normalizeAddress(userRaw);
        const deviceEntry = trackDeviceAccount(db, deviceId, user);
        if (deviceEntry.accounts.length > 3) {
            writeDb(db);
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

        writeDb(db);
        return NextResponse.json({ ok: true, earned, bonus, leaderboard: computeLeaderboard(db) });
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
            writeDb(db);
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
        writeDb(db);

        return NextResponse.json({ ok: true, extra, leaderboard: computeLeaderboard(db) });
    }

    if (action === "taskClaim") {
        const userRaw = body?.user;
        const taskIdRaw = body?.taskId;
        if (!userRaw || !taskIdRaw) return NextResponse.json({ error: "Missing user/taskId" }, { status: 400 });
        const user = normalizeAddress(userRaw);
        const taskId = String(taskIdRaw).slice(0, 64);

        const deviceEntry = trackDeviceAccount(db, deviceId, user);
        if (deviceEntry.accounts.length > 3) {
            writeDb(db);
            return NextResponse.json({ error: "Device account limit reached" }, { status: 403 });
        }

        const task = (db.tasks || []).find((t) => t.id === taskId);
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
        if (!task.active) return NextResponse.json({ error: "Task inactive" }, { status: 400 });

        const windowCheck = isWithinTaskWindow(task, Date.now());
        if (!windowCheck.ok) {
            return NextResponse.json({ error: windowCheck.reason === "not_started" ? "Task not started" : "Task ended" }, { status: 400 });
        }

        const reqCheck = checkRequirements(db, user, task.requirements);
        if (!reqCheck.ok) return NextResponse.json({ error: reqCheck.error }, { status: 400 });

        if (!db.taskClaims) db.taskClaims = {};
        if (!db.taskClaims[taskId]) db.taskClaims[taskId] = {};

        const repeat: TaskRepeat = task.repeat === "daily" ? "daily" : "none";
        const dayKey = utcDayKey(Date.now());
        const existing = db.taskClaims[taskId][user];
        if (repeat === "daily") {
            if (existing && typeof existing === "object" && Boolean(existing?.[dayKey])) {
                return NextResponse.json({ ok: true, skipped: true, reason: "already_claimed_today" });
            }
        } else {
            if (existing) {
                return NextResponse.json({ ok: true, skipped: true, reason: "already_claimed" });
            }
        }

        const u = getOrCreateUser(db, user);
        u.points += Math.max(0, Math.floor(Number(task.points) || 0));
        u.updatedAt = nowIso();

        const claimEntry = { claimedAt: nowIso(), points: Math.max(0, Math.floor(Number(task.points) || 0)) };
        if (repeat === "daily") {
            const next = existing && typeof existing === "object" ? existing : {};
            next[dayKey] = claimEntry;
            db.taskClaims[taskId][user] = next;
        } else {
            db.taskClaims[taskId][user] = claimEntry;
        }
        writeDb(db);

        return NextResponse.json({ ok: true, awarded: Math.max(0, Math.floor(Number(task.points) || 0)), leaderboard: computeLeaderboard(db) });
    }

    if (action === "adminTaskList") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "admin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        const tasks = (db.tasks || []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return NextResponse.json({ ok: true, tasks });
    }

    if (action === "adminTaskUpsert") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "admin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

        const idRaw = body?.id;
        const typeRaw = body?.type;
        const titleRaw = body?.title;
        const urlRaw = body?.url;
        const pointsRaw = body?.points;
        const activeRaw = body?.active;

        if (typeRaw !== "link" && typeRaw !== "follow" && typeRaw !== "checkin") return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        if (!titleRaw) return NextResponse.json({ error: "Missing title" }, { status: 400 });
        if (typeRaw !== "checkin" && !urlRaw) return NextResponse.json({ error: "Missing url" }, { status: 400 });

        const id = (idRaw ? String(idRaw) : `task_${Date.now()}_${Math.random().toString(16).slice(2)}`).slice(0, 64);
        const title = String(titleRaw).slice(0, 80);
        const description = body?.description ? String(body.description).slice(0, 240) : "";
        const url = typeRaw === "checkin" ? "" : String(urlRaw).slice(0, 500);
        const points = Math.max(0, Math.floor(Number(pointsRaw) || 0));
        const active = Boolean(activeRaw);
        const requirements = sanitizeTaskRequirements(body?.requirements);
        const startAt = sanitizeIsoDate(body?.startAt);
        const endAt = sanitizeIsoDate(body?.endAt);
        const repeatRaw = body?.repeat;
        const repeat: TaskRepeat = repeatRaw === "daily" ? "daily" : "none";
        if (startAt && endAt) {
            const s = Date.parse(startAt);
            const e = Date.parse(endAt);
            if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
                return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
            }
        }

        if (!db.tasks) db.tasks = [];
        const now = nowIso();
        const existingIdx = db.tasks.findIndex((t) => t.id === id);
        const entry: Task = {
            id,
            type: typeRaw,
            repeat,
            title,
            description,
            url,
            points,
            active,
            startAt,
            endAt,
            requirements,
            createdAt: existingIdx >= 0 ? db.tasks[existingIdx].createdAt : now,
            updatedAt: now,
        };
        if (existingIdx >= 0) db.tasks[existingIdx] = entry;
        else db.tasks.unshift(entry);
        writeDb(db);
        return NextResponse.json({ ok: true, task: entry });
    }

    if (action === "adminTaskRemove") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "admin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        const idRaw = body?.id;
        if (!idRaw) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        const id = String(idRaw).slice(0, 64);
        db.tasks = (db.tasks || []).filter((t) => t.id !== id);
        if (db.taskClaims) delete db.taskClaims[id];
        writeDb(db);
        return NextResponse.json({ ok: true });
    }

    if (action === "adminResetAll") {
        const adminAddress = body?.adminAddress;
        const auth = requireAdmin(db, adminAddress, "superadmin");
        if (!auth.ok) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

        db.users = {};
        db.devices = {};
        writeDb(db);
        return NextResponse.json({ ok: true });
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
        writeDb(db);
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
        writeDb(db);
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
        writeDb(db);
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
