const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");
console.log("Checking .env at:", envPath);

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    console.log("File size:", content.length);
    console.log("Raw content (hex of first 20 chars):");
    const buffer = Buffer.from(content);
    console.log(buffer.slice(0, 20).toString('hex'));

    const lines = content.split('\n');
    console.log("Number of lines:", lines.length);
    lines.forEach((line, i) => {
        console.log(`Line ${i}: length=${line.length}, content_start='${line.substring(0, 15)}...'`);
        if (line.includes("PRIVATE_KEY")) {
            console.log("  -> Found PRIVATE_KEY in this line.");
            const parts = line.split('=');
            if (parts.length > 1) {
                const val = parts[1].trim();
                console.log("  -> Value length:", val.length);
                console.log("  -> Starts with 0x:", val.startsWith("0x"));
            }
        }
    });
} else {
    console.log("File not found.");
}
