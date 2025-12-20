const { createPublicClient, http } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    const address = "0xe28f1f928148be54f7ced68599ef0da2df5810e3";
    console.log("Target:", address);

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    try {
        const code = await client.getBytecode({ address });
        console.log("Code:", code);
        console.log("Length:", code ? code.length : 0);

        if (!code || code === "0x") {
            console.error("CRITICAL: No contract code at this address!");
        } else {
            console.log("Contract exists.");
        }
    } catch (e) {
        console.error("Error fetching code:", e);
    }
}

main();
