const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Arrow Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

// Extract base names
const names = files.map(f => {
    if (f.startsWith('Type=')) {
        return f.replace('Type=', '').replace(', Theme=White.svg', '');
    }
    return f.replace('.svg', '');
}).sort();

// Unique names
const uniqueNames = [...new Set(names)];

console.log('const ARROW_ICONS: string[] = [');
for (let i = 0; i < uniqueNames.length; i += 4) {
    const chunk = uniqueNames.slice(i, i + 4);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < uniqueNames.length ? ',' : ''));
}
console.log('];');
