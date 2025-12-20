import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

const PREDICTION_MARKET_ADDRESS = "0x9a76506493a84940989fAec4c82D7b26c71fB744";
const PREDICTION_MARKET_ABI = [
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

async function main() {
    const adminAddress = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'admin',
    });
    console.log('Current Admin Address (Tax destination):', adminAddress);
}

main().catch(console.error);
