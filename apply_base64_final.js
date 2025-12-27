
const fs = require('fs');
const path = require('path');

const iconPath = path.resolve('public/icon.png');
const routePath = path.resolve('app/api/og/route.tsx');

console.log('Reading icon from:', iconPath);
const iconBuffer = fs.readFileSync(iconPath);
const base64 = iconBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64}`;

console.log('Reading route file from:', routePath);
let routeContent = fs.readFileSync(routePath, 'utf8');

// Use a regex to find the line regardless of indentation
const placeholderRegex = /const iconDataUri = ""; \/\/ Will be replaced by script/;

if (placeholderRegex.test(routeContent)) {
    console.log('Placeholder found with regex. Replacing...');
    const updatedContent = routeContent.replace(placeholderRegex, `const iconDataUri = "${dataUri}";`);
    fs.writeFileSync(routePath, updatedContent);
    console.log('Success! Inlined Base64 icon.');
} else {
    console.error('Placeholder NOT found in route file even with regex!');
    process.exit(1);
}
