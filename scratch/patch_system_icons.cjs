const fs = require('fs');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/System Icons';
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

let legacyStr = 'const systemLegacySet = new Set([\n';
for (let i = 0; i < legacy.length; i += 5) {
    const chunk = legacy.slice(i, i + 5);
    legacyStr += '  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 5 < legacy.length ? ',' : '') + '\n';
}
legacyStr += ']);';

let allStr = 'const SYSTEM_ICONS: string[] = [\n';
for (let i = 0; i < all.length; i += 4) {
    const chunk = all.slice(i, i + 4);
    allStr += '  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 4 < all.length ? ',' : '') + '\n';
}
allStr += '];';

const tsxPath = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';
let content = fs.readFileSync(tsxPath, 'utf8');

const systemRegex = /const SYSTEM_ICONS: string\[\] = \[[\s\S]*?\];/;
content = content.replace(systemRegex, allStr);

const weatherRegex = /const weatherLegacySet = new Set\(\[[\s\S]*?\]\);/;
if (!content.includes('const systemLegacySet')) {
    content = content.replace(weatherRegex, match => match + '\n\n' + legacyStr);
} else {
    content = content.replace(/const systemLegacySet = new Set\(\[[\s\S]*?\]\);/, legacyStr);
}

const pathFnOld = /const systemPathFn = \(name: string, _variant\?: string\) =>\s*`\/Assets\/System Icons\/Type=\$\{name\}, Theme=White\.svg`;/;
const pathFnNew = `const systemPathFn = (name: string, _variant?: string) => {
  if (systemLegacySet.has(name)) {
    return \`/Assets/System Icons/Type=\${name}, Theme=White.svg\`;
  }
  return \`/Assets/System Icons/\${name}.svg\`;
};`;

content = content.replace(pathFnOld, pathFnNew);

fs.writeFileSync(tsxPath, content);
console.log('patched successfully');
