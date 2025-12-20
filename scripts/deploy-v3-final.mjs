import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bscTestnet } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error("PRIVATE_KEY not found in .env");
    process.exit(1);
}

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

    // Replace PREDICTION_MARKET_ADDRESS
    content = content.replace(/export const PREDICTION_MARKET_ADDRESS = "0x[a-fA-F0-9]{40}";/, `export const PREDICTION_MARKET_ADDRESS = "${contractAddress}";`);

    // Replace PREDICTION_MARKET_ABI with the new one
    const newAbiString = JSON.stringify(artifact.abi, null, 2);
    content = content.replace(/export const PREDICTION_MARKET_ABI = \[[\s\S]*?\] as const;/, `export const PREDICTION_MARKET_ABI = ${newAbiString} as const;`);

    fs.writeFileSync(constantsPath, content);
    console.log("Updated app/constants.ts with new address and ABI");
}

main().catch(console.error);
