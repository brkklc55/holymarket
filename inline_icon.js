import fs from 'fs';
import path from 'path';

const buf = fs.readFileSync('public/icon.png');
const b64 = buf.toString('base64');
const routePath = 'app/api/og/route.tsx';
let content = fs.readFileSync(routePath, 'utf8');

const startTag = '// Optimized image loading for Satori';
const endTag = 'const { searchParams }';

const newSnippet = `${startTag}\n    const iconDataUri = "data:image/png;base64,${b64}";\n\n    `;

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + newSnippet + content.substring(endIndex);
    fs.writeFileSync(routePath, newContent);
    console.log('Successfully inlined base64 icon');
} else {
    console.error('Markers not found');
    process.exit(1);
}
