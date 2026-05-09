import fs from 'fs';
import path from 'path';

const SOCIAL_ICONS_FILE = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';

// Mocking the arrays to compare (I'll extract them from the file or just use the ones I saw)
// Actually I'll just read the file and extract them using regex.

const content = fs.readFileSync(SOCIAL_ICONS_FILE, 'utf8');

function extractArray(name) {
    const match = content.match(new RegExp(`const ${name}: string\\[\\] = \\[([\\s\\S]*?)\\];`));
    if (!match) return [];
    return match[1].split(',').map(s => s.trim().replace(/['"\s]/g, '')).filter(Boolean);
}

const socialIconsArray = extractArray('SOCIAL_ICONS');
const brandIconsArray = extractArray('BRAND_ICONS');

const brandIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';
const socialIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Social Icons';

const brandFiles = fs.readdirSync(brandIconsDir).filter(f => f.endsWith('.svg'));
const socialFiles = fs.readdirSync(socialIconsDir).filter(f => f.endsWith('.svg'));

console.log('--- Brand Icons Folder ---');
const brandFilesBase = brandFiles.map(f => f.replace('.svg', ''));
const missingInSocial = brandFilesBase.filter(f => !f.includes('-1') && !f.includes('-2') && !socialIconsArray.includes(f));
console.log('Missing in SOCIAL_ICONS array (from Brand Icons folder):', missingInSocial);

console.log('\n--- Social Icons Folder ---');
const socialFilesBase = socialFiles.filter(f => f.startsWith('Type=brand-')).map(f => f.match(/Type=brand-(.*?),/)[1]);
const uniqueSocialFilesBase = [...new Set(socialFilesBase)];
const missingInBrand = uniqueSocialFilesBase.filter(f => !brandIconsArray.includes('brand-' + f));
console.log('Missing in BRAND_ICONS array (from Social Icons folder):', missingInBrand);

console.log('\n--- Checking folder/array mismatch ---');
console.log('SOCIAL_ICONS count:', socialIconsArray.length);
console.log('BRAND_ICONS count:', brandIconsArray.length);
