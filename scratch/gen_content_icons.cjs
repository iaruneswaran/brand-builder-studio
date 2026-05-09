const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Content Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const names = files.map(f => f.replace('.svg', '')).sort();

console.log('const CONTENT_ICONS: string[] = [');
for (let i = 0; i < names.length; i += 4) {
    const chunk = names.slice(i, i + 4);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < names.length ? ',' : ''));
}
console.log('];');
