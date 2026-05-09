const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Social Icons';
const files = fs.readdirSync(dir);

const icons = new Set();

files.forEach(f => {
    if (!f.endsWith('.svg')) return;
    
    // Pattern 1: Style=...
    if (f.startsWith('Style=')) {
        const name = f.replace('.svg', '');
        icons.add(name);
    }
    // Pattern 2: Type=..., Theme=White...
    else if (f.startsWith('Type=')) {
        // Extract the name between "Type=" and ", Theme=White"
        // e.g. "Type=brand-adobe, Theme=White.svg" -> "brand-adobe"
        const match = f.match(/Type=([^,]+), Theme=White/);
        if (match) {
            icons.add(match[1]);
        }
    }
    // Pattern 3: Simple name (if any)
    else {
        icons.add(f.replace('.svg', ''));
    }
});

const sortedIcons = Array.from(icons).sort();
const content = 'const SOCIAL_ICONS: string[] = ' + JSON.stringify(sortedIcons, null, 2) + ';';
fs.writeFileSync('c:/Users/xarun/brand-builder-studio/scratch/social_icons_list.txt', content, 'utf8');
console.log('Done writing to scratch/social_icons_list.txt');
