import fs from 'fs';

const content = fs.readFileSync('c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx', 'utf8');

function extractArray(name) {
    const regex = new RegExp(`const ${name}: string\\[\\] = \\[([\\s\\S]*?)\\];`);
    const match = content.match(regex);
    if (!match) return [];
    return match[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
}

const socialIconsArray = extractArray('SOCIAL_ICONS');
const brandIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';

const brandFiles = fs.readdirSync(brandIconsDir).filter(f => f.endsWith('.svg'));
const brandNamesInFolder = brandFiles.map(f => f.replace('.svg', '').replace(/-[12]$/, ''));
const uniqueBrandNamesInFolder = [...new Set(brandNamesInFolder)];

const missingInArray = uniqueBrandNamesInFolder.filter(n => !socialIconsArray.includes(n));

console.log('Icons in Brand Icons folder but NOT in SOCIAL_ICONS array:');
console.log(missingInArray);

console.log('\nTotal brand names in folder:', uniqueBrandNamesInFolder.length);
console.log('Total brand icons in SOCIAL_ICONS array:', socialIconsArray.length);
