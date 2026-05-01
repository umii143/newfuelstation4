import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export interface PDFExportOptions {
    title: string;
    subtitle?: string;
    filename: string;
    columns: string[];
    data: any[][];
    orientation?: 'portrait' | 'landscape';
}

export const exportToPDF = (options: PDFExportOptions) => {
    const { title, subtitle, filename, columns, data, orientation = 'landscape' } = options;

    const doc = new jsPDF(orientation, 'pt', 'a4');
    
    // Corporate Header
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Primary Title
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('MOTORWAY OIL ENTERPRISE', 40, 40);
    
    // Document Title
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // Blue-500
    doc.text(title, 40, 60);

    // Subtitle / Date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    if (subtitle) {
        doc.text(subtitle, 40, 75);
    }
    
    const timestamp = `Generated: ${format(new Date(), 'PPpp')}`;
    doc.text(timestamp, pageWidth - 40, 40, { align: 'right' });

    // Table Generation
    autoTable(doc, {
        head: [columns],
        body: data,
        startY: subtitle ? 90 : 80,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 4,
            font: 'helvetica',
        },
        headStyles: {
            fillColor: [30, 41, 59], // Slate-800
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Slate-50
        },
        margin: { top: 40, right: 40, bottom: 40, left: 40 },
        didDrawPage: function () {
            // Footer
            const str = 'Page ' + (doc as any).internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
        },
    });

    // Save the PDF
    doc.save(filename);
};
