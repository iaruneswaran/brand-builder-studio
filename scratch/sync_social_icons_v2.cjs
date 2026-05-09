const fs = require('fs');

const brandIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';
const socialIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Social Icons';

const brandFiles = fs.readdirSync(brandIconsDir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', '').replace(/-[12]$/, ''));
const uniqueBrandIcons = [...new Set(brandFiles)].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

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

const allIcons = [...uniqueBrandIcons, ...uniqueStyleIcons];

let output = 'const SOCIAL_ICONS: string[] = [\n  ';
allIcons.forEach((icon, i) => {
    // Clean up potential encoding issues like non-breaking spaces
    const cleanIcon = icon.replace(/\s+/g, ' ').trim();
    output += `'${cleanIcon}', `;
    if ((i + 1) % 6 === 0) output += '\n  ';
});
output += '\n];';

// Use a known encoding
fs.writeFileSync('c:/Users/xarun/brand-builder-studio/scratch/social_icons_final.txt', output, 'utf8');
