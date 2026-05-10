const fs = require('fs');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Device Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const all = [];
files.forEach(f => {
    if (f.startsWith('Style=')) {
        all.push(f.replace('.svg', ''));
    } else if (f.startsWith('Type=White, Theme=')) {
        all.push(f.replace('Type=White, Theme=', '').replace('.svg', ''));
    } else {
        all.push(f.replace('.svg', ''));
    }
});

all.sort();

let allStr = 'const DEVICE_ICONS: string[] = [\n';
for (let i = 0; i < all.length; i += 4) {
    const chunk = all.slice(i, i + 4);
    allStr += '  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < all.length ? ',' : '') + '\n';
}
allStr += '];';

const fileToModify = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';
let content = fs.readFileSync(fileToModify, 'utf8');

const regex = /const DEVICE_ICONS: string\[\] = \[[\s\S]*?\];/;
content = content.replace(regex, allStr);

fs.writeFileSync(fileToModify, content);
console.log('DEVICE_ICONS updated successfully.');
