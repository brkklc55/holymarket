const fs = require("fs");
const path = require("path");
const solc = require("solc");

function main() {
    const contractPath = path.resolve(__dirname, "../contracts/SimplePredictionMarket.sol");
    const source = fs.readFileSync(contractPath, "utf8");

    const input = {
        language: "Solidity",
        sources: {
            "SimplePredictionMarket.sol": {
                content: source,
            },
        },
        settings: {
            evmVersion: "paris",
            outputSelection: {
                "*": {
                    "*": ["*"],
                },
            },
        },
    };

    console.log("Compiling SimplePredictionMarket.sol...");
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        if (output.errors.some(e => e.severity === 'error')) {
            throw new Error("Compilation failed");
        }
    }

    const contract = output.contracts["SimplePredictionMarket.sol"]["SimplePredictionMarket"];
    const artifact = {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
    };

    const artifactPath = path.resolve(__dirname, "../../simple-prediction-market-artifact.json");
    fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
    console.log("✅ Compilation successful!");
    console.log("Artifact saved to:", artifactPath);
}

main();
