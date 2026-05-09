const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Currencies Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const legacyIcons = files
    .filter(f => f.startsWith('Type='))
    .map(f => f.replace('Type=', '').replace(', Theme=White.svg', ''))
    .sort();

console.log('const currencyLegacySet = new Set([');
for (let i = 0; i < legacyIcons.length; i += 8) {
    const chunk = legacyIcons.slice(i, i + 8);
    console.log('  ' + chunk.map(n => `'${n}'`).join(',') + (i + 8 < legacyIcons.length ? ',' : ''));
}
console.log(']);');
