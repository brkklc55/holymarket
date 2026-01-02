import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "markets.json");

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data: any) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
    const { marketId, outcome, adminAddress } = await req.json();

    const ADMIN_ADDRESSES = [
        "0x33713B87baB352C46BBa4953ab6Cb11aFe895d93".toLowerCase(),
        "0x96a445dd060efd79ab27742de12128f24b4edaec".toLowerCase()
    ];

    if (!ADMIN_ADDRESSES.includes(adminAddress?.toLowerCase())) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const data = readData();
    const market = data.markets.find((m: any) => m.id === marketId);

    if (!market) {
        return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (market.resolved) {
        return NextResponse.json({ error: "Already resolved" }, { status: 400 });
    }

    market.resolved = true;
    market.outcome = outcome;
    market.resolvedAt = new Date().toISOString();

    writeData(data);

    return NextResponse.json(market);
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
