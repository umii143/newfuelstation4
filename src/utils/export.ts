import { getBusinessMeta } from '@/lib/businessScope';
import { useSettingsStore } from '@/stores/authStore';

export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    // Extract headers
    const headers = Object.keys(data[0]);
    
    // Convert to CSV
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => {
                const cell = row[header] === null || row[header] === undefined ? '' : row[header];
                // Escape quotes and commas
                const cellString = String(cell).replace(/"/g, '""');
                return `"${cellString}"`;
            }).join(',')
        )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const activeBusiness = getBusinessMeta(useSettingsStore.getState().settings.businessUnit);
    const finalFilename = filename.includes(activeBusiness.reportSlug)
        ? filename
        : filename.replace(/\.csv$/i, `_${activeBusiness.reportSlug}.csv`);

    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
