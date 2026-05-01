const fs = require('fs');

['src/pages/reports/ReportRegistryCNG.ts', 'src/pages/reports/ReportRegistryLube.ts'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/requiredRole: 'MANAGER'/g, "requiredRole: 'STAFF'");
    fs.writeFileSync(file, content);
});
