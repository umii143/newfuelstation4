const fs = require('fs');

function fixRegistry(file, isCNG) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix accessLevel -> requiredRole
    content = content.replace(/accessLevel: 'MANAGER'/g, "requiredRole: 'MANAGER'");

    if (isCNG) {
        content = content.replace(/category: 'MACHINERY'/g, "category: 'CNG_OPERATIONS'");
        content = content.replace(/category: 'DECANTING'/g, "category: 'CNG_OPERATIONS'");
        content = content.replace(/category: 'FINANCIAL'/g, "category: 'CNG_FINANCIAL'");
        content = content.replace(/category: 'SHIFT'/g, "category: 'CNG_OPERATIONS'");
        content = content.replace(/category: 'UTILITIES'/g, "category: 'CNG_EXPENSE'");
        content = content.replace(/category: 'COMPLIANCE'/g, "category: 'CNG_AUDIT'");
        content = content.replace(/category: 'PERFORMANCE'/g, "category: 'CNG_OPERATIONS'");
        content = content.replace(/category: 'AUDIT'/g, "category: 'CNG_AUDIT'");
    } else {
        content = content.replace(/category: 'INVENTORY'/g, "category: 'LUBE_INVENTORY'");
        content = content.replace(/category: 'PERFORMANCE'/g, "category: 'LUBE_OPERATIONS'");
        content = content.replace(/category: 'SUPPLIER'/g, "category: 'LUBE_SUPPLIER'");
        content = content.replace(/category: 'CUSTOMER'/g, "category: 'LUBE_CUSTOMER'");
        content = content.replace(/category: 'FINANCIAL'/g, "category: 'LUBE_FINANCIAL'");
        content = content.replace(/category: 'AUDIT'/g, "category: 'LUBE_AUDIT'");
        content = content.replace(/category: 'MAINTENANCE'/g, "category: 'LUBE_OPERATIONS'");
        content = content.replace(/category: 'SHIFT'/g, "category: 'LUBE_OPERATIONS'");
    }

    fs.writeFileSync(file, content);
}

fixRegistry('src/pages/reports/ReportRegistryCNG.ts', true);
fixRegistry('src/pages/reports/ReportRegistryLube.ts', false);
