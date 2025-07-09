const fs = require('fs');
const path = require('path');

// IMPORTANT: Replace 'HindSiliguri-Regular.ttf' with the actual name of your downloaded font file
// and ensure the path is correct.
const fontFilePath = path.join(__dirname, 'HindSiliguri-Regular.ttf');

fs.readFile(fontFilePath, { encoding: 'base64' }, (err, data) => {
    if (err) {
        console.error("Error reading font file:", err);
        return;
    }
    // This will print the export statement directly to your console.
    console.log(`export const bengaliFontBase64 = '${data}';`);
});