import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from "./app/constants.ts";

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

async function checkStatus() {
    const admin = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: "admin",
    });
    console.log("Contract Admin:", admin);

    const marketId = 1n;
    const market = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: "markets",
        args: [marketId],
    });

    console.log(`Market ${marketId} Info:`);
    console.log("Question:", market[0]);
    console.log("End Time (sec):", market[1]);
    console.log("Current Time (sec):", Math.floor(Date.now() / 1000));
    console.log("Is Resolved:", market[4]);
}

checkStatus();
