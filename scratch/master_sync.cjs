const fs = require('fs');
const path = require('path');

const brandIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';
const socialIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Social Icons';
const targetFile = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';

// 1. Get Brand Icons (for SOCIAL_ICONS)
const brandFiles = fs.readdirSync(brandIconsDir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', '').replace(/[ -][12]$/, '').trim());
const uniqueBrandIcons = [...new Set(brandFiles)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

// 2. Get Style Icons (for SOCIAL_ICONS)
const styleFiles = fs.readdirSync(socialIconsDir)
    .filter(f => f.endsWith('.svg') && f.startsWith('Style='))
    .map(f => f.replace('.svg', ''));

const uniqueStyleIcons = [...new Set(styleFiles)].sort((a, b) => {
    const parse = (s) => {
        const m = s.match(/(.*?)(?:-(\d+))?$/);
        return [m[1], parseInt(m[2] || '0', 10)];
    };
    const [nameA, numA] = parse(a);
    const [nameB, numB] = parse(b);
    if (nameA !== nameB) return nameA.localeCompare(nameB);
    return numA - numB;
});

const socialIconsArray = [...uniqueBrandIcons, ...uniqueStyleIcons];

// 3. Get Brand-Type Icons (for BRAND_ICONS)
const brandTypeFiles = fs.readdirSync(socialIconsDir)
    .filter(f => f.startsWith('Type=brand-') && f.endsWith('.svg'));

const brandTypeNames = brandTypeFiles.map(f => {
    const match = f.match(/Type=brand-(.*?),/);
    return match ? 'brand-' + match[1] : null;
}).filter(Boolean);

const uniqueBrandTypeNames = [...new Set(brandTypeNames)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

// 4. Update File
let fileContent = fs.readFileSync(targetFile, 'utf8');

// Replace SOCIAL_ICONS
const socialIconsStr = 'const SOCIAL_ICONS: string[] = [\n  ' + 
    socialIconsArray.map(icon => `'${icon}'`).join(', ').replace(/(.{1,100}, )/g, '$1\n  ') + 
    '\n];';
fileContent = fileContent.replace(/const SOCIAL_ICONS: string\[\] = \[[\s\S]*?\];/, socialIconsStr);

// Replace BRAND_ICONS
const brandIconsStr = 'const BRAND_ICONS: string[] = [\n  ' + 
    uniqueBrandTypeNames.map(icon => `'${icon}'`).join(', ').replace(/(.{1,100}, )/g, '$1\n  ') + 
    '\n];';
fileContent = fileContent.replace(/const BRAND_ICONS: string\[\] = \[[\s\S]*?\];/, brandIconsStr);

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log('Successfully synchronized IconBrowser.tsx with folder contents.');
