const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Social Icons';
const files = fs.readdirSync(dir);

const icons = files
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''))
    .sort();

const content = 'const SOCIAL_ICONS: string[] = ' + JSON.stringify(icons, null, 2) + ';';
fs.writeFileSync('c:/Users/xarun/brand-builder-studio/scratch/social_icons_full_list.txt', content, 'utf8');
console.log('Done writing 987 icons to scratch/social_icons_full_list.txt');
