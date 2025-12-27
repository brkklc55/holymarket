
const fs = require('fs');
const path = require('path');

try {
    const iconPath = path.resolve('public/icon.png');
    console.log('Reading from:', iconPath);
    if (!fs.existsSync(iconPath)) {
        console.error('File does not exist:', iconPath);
        process.exit(1);
    }
    const buffer = fs.readFileSync(iconPath);
    const base64 = buffer.toString('base64');
    fs.writeFileSync('icon_base64_final.txt', base64);
    console.log('Success. Written to icon_base64_final.txt');
} catch (e) {
    console.error('Error:', e);
    process.exit(1);
}
