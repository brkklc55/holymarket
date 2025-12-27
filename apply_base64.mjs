
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const iconPath = path.join(__dirname, 'public', 'icon.png');
    const routePath = path.join(__dirname, 'app', 'api', 'og', 'route.tsx');

    console.log('Reading icon from:', iconPath);
    const iconBuffer = fs.readFileSync(iconPath);
    const base64 = iconBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    console.log('Reading route file from:', routePath);
    let routeContent = fs.readFileSync(routePath, 'utf8');

    const placeholderRegex = /const iconDataUri = ""; \/\/ Will be replaced by script/;

    if (placeholderRegex.test(routeContent)) {
        console.log('Placeholder found. Replacing...');
        const updatedContent = routeContent.replace(placeholderRegex, `const iconDataUri = "${dataUri}";`);
        fs.writeFileSync(routePath, updatedContent);
        console.log('Success! Inlined Base64 icon.');
    } else {
        console.error('Placeholder NOT found in route file!');
        process.exit(1);
    }
} catch (e) {
    console.error('Fatal Error:', e);
    process.exit(1);
}
