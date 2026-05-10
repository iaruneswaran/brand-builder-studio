const fs = require('fs');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Device Icons';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

const legacy = [];
files.forEach(f => {
    if (f.startsWith('Type=White, Theme=')) {
        legacy.push(f.replace('Type=White, Theme=', '').replace('.svg', ''));
    }
});

legacy.sort();

let legacyStr = 'const deviceLegacySet = new Set([\n';
for (let i = 0; i < legacy.length; i += 5) {
    const chunk = legacy.slice(i, i + 5);
    legacyStr += '  ' + chunk.map(n => `'${n}'`).join(', ') + (i + 5 < legacy.length ? ',' : '') + '\n';
}
legacyStr += ']);';

const pathFnStr = `const devicePathFn = (name: string, _variant?: string) => {
  if (deviceLegacySet.has(name)) {
    return \`/Assets/Device Icons/Type=White, Theme=\${name}.svg\`;
  }
  return \`/Assets/Device Icons/\${name}.svg\`;
};`;

const fileToModify = 'c:/Users/xarun/brand-builder-studio/src/pages/tools/IconBrowser.tsx';
let content = fs.readFileSync(fileToModify, 'utf8');

const regex = /\/\/ Device icons use: "Type=White, Theme=<name>\.svg"\s*const devicePathFn = \(name: string, _variant\?: string\) =>\s*`\/Assets\/Device Icons\/Type=White, Theme=\$\{name\}\.svg`;/;

content = content.replace(regex, `// Device icons use: "Type=White, Theme=<name>.svg" for legacy ones, or simple "<name>.svg" for new ones\n${legacyStr}\n\n${pathFnStr}`);

fs.writeFileSync(fileToModify, content);
console.log('deviceLegacySet and devicePathFn updated successfully.');
