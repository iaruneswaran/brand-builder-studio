const fs = require('fs');

const brandIconsDir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';
const socialIconsFile = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';

const folderIcons = fs.readdirSync(brandIconsDir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', '').replace(/-[12]$/, ''));
const uniqueFolderIcons = new Set(folderIcons);

const fileContent = fs.readFileSync(socialIconsFile, 'utf8');
const match = fileContent.match(/const SOCIAL_ICONS: string\[\] = \[([\s\S]*?)\];/);

if (match) {
    const arrayStr = match[1];
    const arrayIcons = arrayStr.split(',')
        .map(s => s.trim().replace(/'/g, '').replace(/"/g, ''))
        .filter(s => s && !s.startsWith('Style='));
    
    console.log('--- AUDIT REPORT ---');
    console.log('Icons in code but NOT in folder:');
    arrayIcons.forEach(icon => {
        if (!uniqueFolderIcons.has(icon)) {
            console.log(`- ${icon}`);
        }
    });

    console.log('\nIcons in folder but NOT in code:');
    [...uniqueFolderIcons].sort().forEach(icon => {
        if (!arrayIcons.includes(icon)) {
            console.log(`+ ${icon}`);
        }
    });
} else {
    console.log('Could not find SOCIAL_ICONS array in file.');
}
