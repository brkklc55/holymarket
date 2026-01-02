import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "markets.json");

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify({ markets: [], nextId: 1 }));
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeData(data: any) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
    const data = readData();
    return NextResponse.json(data.markets);
}

export async function POST(req: NextRequest) {
    const { question, category, duration, adminAddress } = await req.json();

    // Simple admin check (in production, use proper auth)
    const ADMIN_ADDRESSES = [
        "0x33713B87baB352C46BBa4953ab6Cb11aFe895d93".toLowerCase(),
        "0x96a445dd060efd79ab27742de12128f24b4edaec".toLowerCase()
    ];

    if (!ADMIN_ADDRESSES.includes(adminAddress?.toLowerCase())) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const data = readData();
    const newMarket = {
        id: data.nextId,
        question,
        category: category || "CRYPTO",
        endTime: new Date(Date.now() + duration * 1000).toISOString(),
        resolved: false,
        outcome: null,
        createdAt: new Date().toISOString(),
        createdBy: adminAddress
    };

    data.markets.push(newMarket);
    data.nextId++;
    writeData(data);

    return NextResponse.json(newMarket);
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
