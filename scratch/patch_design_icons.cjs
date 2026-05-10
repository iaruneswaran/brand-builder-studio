const fs = require('fs');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Design Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const all = [];
const legacy = [];

files.forEach(f => {
    if (f.startsWith('Type=')) {
        // Legacy format: Type=<name>, Theme=White.svg
        const name = f.split(',')[0].replace('Type=', '');
        legacy.push(name);
        all.push(name);
    } else {
        // New format: <name>.svg (includes Style=..., etc.)
        const name = f.replace('.svg', '');
        all.push(name);
    }
});

// Remove duplicates and sort
const uniqueAll = [...new Set(all)].sort();
const uniqueLegacy = [...new Set(legacy)].sort();

// Generate DESIGN_ICONS string
let allStr = 'const DESIGN_ICONS: string[] = [\n';
for (let i = 0; i < uniqueAll.length; i += 8) {
    const chunk = uniqueAll.slice(i, i + 8);
    allStr += '  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 8 < uniqueAll.length ? ',' : '') + '\n';
}
allStr += '];';

// Generate designLegacySet string
let legacyStr = 'const designLegacySet = new Set([\n';
for (let i = 0; i < uniqueLegacy.length; i += 8) {
    const chunk = uniqueLegacy.slice(i, i + 8);
    legacyStr += '  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 8 < uniqueLegacy.length ? ',' : '') + '\n';
}
legacyStr += ']);';

const fileToModify = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';
let content = fs.readFileSync(fileToModify, 'utf8');

// Update DESIGN_ICONS
const designIconsRegex = /const DESIGN_ICONS: string\[\] = \[[\s\S]*?\];/;
content = content.replace(designIconsRegex, allStr);

// Update designLegacySet
const designLegacySetRegex = /const designLegacySet = new Set\(\[[\s\S]*?\]\);/;
content = content.replace(designLegacySetRegex, legacyStr);

fs.writeFileSync(fileToModify, content);
console.log('DESIGN_ICONS and designLegacySet updated successfully.');
console.log(`Total icons: ${uniqueAll.length}`);
console.log(`Legacy icons: ${uniqueLegacy.length}`);
