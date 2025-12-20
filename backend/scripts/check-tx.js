const { createPublicClient, http } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    const txHash = "0x711d5b248f1fe643e687f30926513423f4627c92cdc7c180e691c58c51b13c66";
    console.log("Checking Tx:", txHash);

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    try {
        const receipt = await client.getTransactionReceipt({ hash: txHash });
        console.log("Status:", receipt.status); // success or reverted
        console.log("Block:", receipt.blockNumber);
        console.log("Gas Used:", receipt.gasUsed);
        console.log("Contract Address:", receipt.contractAddress);

        if (receipt.status === "reverted") {
            console.error("TRANSACTION REVERTED");
        } else {
            console.log("Transaction Success");
            // Check code again
            const code = await client.getBytecode({ address: receipt.contractAddress });
            console.log("Code at address:", code ? code.length : 0);
        }

    } catch (e) {
        console.error("Error fetching receipt:", e);
    }
}

main();
