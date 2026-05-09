const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/xarun/brand-builder-studio/public/Assets/Brand Icons';
const files = fs.readdirSync(dir);

files.forEach(file => {
    // Replace non-breaking spaces and multiple spaces with a single space
    // or just remove trailing spaces before the extension
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const cleanBase = base.replace(/[\u00A0\s]+/g, ' ').trim();
    const newFile = cleanBase + ext;

    if (file !== newFile) {
        console.log(`Renaming: "${file}" -> "${newFile}"`);
        fs.renameSync(path.join(dir, file), path.join(dir, newFile));
    }
});
