const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use adm-zip or just unzip the docx
const AdmZip = require('adm-zip');

try {
  const zip = new AdmZip(path.join(__dirname, 'shift detailed plan', 'MotorwayOil_v4_UIUX_PRD.docx'));
  const entry = zip.getEntry('word/document.xml');
  if (entry) {
    let content = entry.getData().toString('utf8');
    // Strip XML tags, keep text
    content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    fs.writeFileSync(path.join(__dirname, 'shift detailed plan', 'prd_content.txt'), content, 'utf8');
    console.log('Extracted successfully, length:', content.length);
  } else {
    console.log('No document.xml found');
  }
} catch(e) {
  // Fallback: manual zip extraction
  const { createReadStream } = require('fs');
  const zlib = require('zlib');
  console.error('Error:', e.message);
  
  // Try using PowerShell's Expand-Archive
  console.log('Trying manual extraction...');
}
