const fs = require('fs');
const file = 'src/pages/tools/IconBrowser.tsx';
let content = fs.readFileSync(file, 'utf8');

// The items we want to remove are all "Style=..." inside SOCIAL_ICONS.
// Let's replace the lines from `  "Style=bold",` to `  "Style=twotone-99",\n` with nothing.
const startMarker = 'const SOCIAL_ICONS: string[] = [\n';
const startIndex = content.indexOf(startMarker);

if (startIndex !== -1) {
    const endStr = '  "Style=twotone-99",\n';
    const endIndex = content.indexOf(endStr, startIndex);
    
    if (endIndex !== -1) {
        const replaceEnd = endIndex + endStr.length;
        const targetSection = content.substring(startIndex + startMarker.length, replaceEnd);
        
        // Let's just be sure we only remove the Style= lines
        const newSection = targetSection.split('\n').filter(line => {
            return !line.includes('"Style=');
        }).join('\n');
        
        content = content.substring(0, startIndex + startMarker.length) + newSection + content.substring(replaceEnd);
        
        fs.writeFileSync(file, content);
        console.log('Successfully cleaned SOCIAL_ICONS.');
    } else {
        console.log('Could not find end string in SOCIAL_ICONS.');
    }
} else {
    console.log('Could not find SOCIAL_ICONS array.');
}
