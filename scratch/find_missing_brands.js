import fs from 'fs';

const content = fs.readFileSync('c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx', 'utf8');

function extractArray(name) {
    const regex = new RegExp(`const ${name}: string\\[\\] = \\[([\\s\\S]*?)\\];`);
    const match = content.match(regex);
    if (!match) return [];
    return match[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
}

const brandIconsArray = extractArray('BRAND_ICONS');
const socialIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Social Icons';

const socialFiles = fs.readdirSync(socialIconsDir);
const brandTypeFiles = socialFiles.filter(f => f.startsWith('Type=brand-'));

const brandNamesInFolder = brandTypeFiles.map(f => {
    const match = f.match(/Type=brand-(.*?),/);
    return match ? 'brand-' + match[1] : null;
}).filter(Boolean);

const uniqueBrandNamesInFolder = [...new Set(brandNamesInFolder)];

const missingInArray = uniqueBrandNamesInFolder.filter(n => !brandIconsArray.includes(n));

console.log('Icons in folder but NOT in BRAND_ICONS array:');
console.log(missingInArray);

console.log('\nTotal brand icons in folder:', uniqueBrandNamesInFolder.length);
console.log('Total brand icons in array:', brandIconsArray.length);
