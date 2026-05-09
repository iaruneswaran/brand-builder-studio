const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';
const files = fs.readdirSync(dir);

const names = files
  .filter(f => f.endsWith('.svg'))
  .map(f => f.replace('.svg', ''));

console.log(JSON.stringify(names, null, 2));
