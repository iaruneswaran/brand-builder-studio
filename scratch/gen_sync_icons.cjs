const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/xarun/brand-builder-studio/public/Assets';

function processDir(dirName) {
    const dir = path.join(baseDir, dirName);
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

    return { legacy: legacy.sort(), all: [...new Set(all)].sort() };
}

const media = processDir('Media Icons');
const comms = processDir('Communication Icons');

console.log('--- Media ---');
console.log('const mediaLegacySet = new Set([');
for (let i = 0; i < media.legacy.length; i += 5) {
    const chunk = media.legacy.slice(i, i + 5);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 5 < media.legacy.length ? ',' : ''));
}
console.log(']);');
console.log('const MEDIA_ICONS: string[] = [');
for (let i = 0; i < media.all.length; i += 4) {
    const chunk = media.all.slice(i, i + 4);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < media.all.length ? ',' : ''));
}
console.log('];');

console.log('\n--- Communication ---');
console.log('const communicationLegacySet = new Set([');
for (let i = 0; i < comms.legacy.length; i += 5) {
    const chunk = comms.legacy.slice(i, i + 5);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 5 < comms.legacy.length ? ',' : ''));
}
console.log(']);');
console.log('const COMMUNICATION_ICONS: string[] = [');
for (let i = 0; i < comms.all.length; i += 4) {
    const chunk = comms.all.slice(i, i + 4);
    console.log('  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < comms.all.length ? ',' : ''));
}
console.log('];');
