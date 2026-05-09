const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Media Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const legacy = [];
const all = [];

files.forEach(f => {
    if (f.startsWith('Type=')) {
        const name = f.split(',')[0].replace('Type=', '');
        legacy.push(name);
        all.push(name);
    } else {
        const name = f.replace('.svg', '');
        all.push(name);
    }
});

legacy.sort();
all.sort();

console.log('--- legacy ---');
console.log('const mediaLegacySet = new Set([');
for (let i = 0; i < legacy.length; i += 5) {
    const chunk = legacy.slice(i, i + 5);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 5 < legacy.length ? ',' : ''));
}
console.log(']);');

console.log('\n--- all ---');
console.log('const MEDIA_ICONS: string[] = [');
for (let i = 0; i < all.length; i += 4) {
    const chunk = all.slice(i, i + 4);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < all.length ? ',' : ''));
}
console.log('];');
