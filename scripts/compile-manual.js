import fs from 'fs';
import path from 'path';
import solc from 'solc';

const contractPath = path.resolve('backend', 'contracts', 'PredictionMarket.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'PredictionMarket.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

console.log('Compiling...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach((err) => {
        console.error(err.formattedMessage);
    });
}

const contract = output.contracts['PredictionMarket.sol']['PredictionMarket'];

fs.writeFileSync('prediction-market-artifact-v6.json', JSON.stringify({
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
}, null, 2));

console.log('Compiled successfully! Output saved to prediction-market-artifact-v6.json');
