const { createPublicClient, createWalletClient, http, parseEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { bscTestnet } = require("viem/chains");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "backend/.env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

async function main() {
    console.log("Deploying contract with account:", account.address);

    const artifactPath = path.join(process.cwd(), "prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

    const hash = await walletClient.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
    });

    console.log("Transaction hash:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const contractAddress = receipt.contractAddress;
    console.log("Contract deployed to:", contractAddress);

    // Update constants.ts
    const constantsPath = path.join(process.cwd(), "app/constants.ts");
    let content = fs.readFileSync(constantsPath, "utf-8");
    content = content.replace(/export const PREDICTION_MARKET_ADDRESS = "0x[a-fA-F0-9]{40}";/, `export const PREDICTION_MARKET_ADDRESS = "${contractAddress}";`);
    fs.writeFileSync(constantsPath, content);
    console.log("Updated app/constants.ts");
}

main().catch(console.error);
