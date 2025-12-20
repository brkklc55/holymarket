const fs = require('fs');
try {
    const address = fs.readFileSync('deployed_address.txt', 'utf8');
    console.log("CLEAN_ADDRESS:" + address.trim());
} catch (e) {
    console.error(e);
}
