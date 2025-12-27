
const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, 'public', 'icon.png');
const routePath = path.join(__dirname, 'app', 'api', 'og', 'route.tsx');

console.log('Reading icon from:', iconPath);
const iconBuffer = fs.readFileSync(iconPath);
const base64 = iconBuffer.toString('base64');
const dataUri = `data:image/png;base64,${base64}`;

console.log('Reading route file from:', routePath);
let routeContent = fs.readFileSync(routePath, 'utf8');

// The block to replace. We look for the start marker and the end of the data uri assignment.
// We will replace the entire fs reading block with the simple const assignment.

const targetBlockStart = '// 1. Load the icon safely using fs';
// We need to find where the `const iconDataUri = ...` line ends.
const targetBlockEndMarker = 'const iconDataUri = `data:image/png;base64,${iconBase64}`;';

const startIndex = routeContent.indexOf(targetBlockStart);
const endIndex = routeContent.indexOf(targetBlockEndMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find target block to replace.');
    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);
    process.exit(1);
}

const finalEndIndex = endIndex + targetBlockEndMarker.length;

const newContent = `// 1. Inlined Base64 Icon (fs bypass)
        const iconDataUri = "${dataUri}";`;

const updatedRouteContent = routeContent.slice(0, startIndex) + newContent + routeContent.slice(finalEndIndex);

// Also remove the imports if they exist, to be clean
const cleanRouteContent = updatedRouteContent
    .replace("import fs from 'fs';", "")
    .replace("import path from 'path';", "");

fs.writeFileSync(routePath, cleanRouteContent);
console.log('Successfully updated app/api/og/route.tsx with inlined Base64 icon.');
