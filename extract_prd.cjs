const fs = require('fs');
const cp = require('child_process');

try {
    cp.execSync('tar -xf "shift detailed plan/MotorwayOil_v4_UIUX_PRD.docx" word/document.xml');
    const xml = fs.readFileSync('word/document.xml', 'utf8');
    const text = xml.replace(/<w:p [^>]*>/g, '\n').replace(/<[^>]+>/g, '');
    fs.writeFileSync('prd.txt', text);
    fs.rmSync('word', { recursive: true, force: true });
    console.log("Successfully extracted to prd.txt");
} catch (e) {
    console.error(e);
}
