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
    isForensic?: boolean;
    showSignature?: boolean;
}

export const exportToPDF = (options: PDFExportOptions) => {
    const { 
        title, subtitle, filename, columns, data, 
        orientation = 'landscape',
        isForensic = false,
        showSignature = false
    } = options;

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
        margin: { top: 40, right: 40, bottom: 60, left: 40 },
        didDrawPage: function () {
	            // Forensic Watermark
	            if (isForensic) {
	                const centerY = doc.internal.pageSize.getHeight() / 2;
	                const watermarkText = 'AUDIT-GRADE FORENSIC';

	                try {
	                    // jsPDF opacity APIs can vary by version/build; guard to avoid runtime crashes.
	                    (doc as any).saveGraphicsState?.();
	                    if ((doc as any).GState && (doc as any).setGState) {
	                        (doc as any).setGState(new (doc as any).GState({ opacity: 0.1 }));
	                    }
	                    doc.setFontSize(60);
	                    doc.setTextColor(220, 38, 38); // Red-600
	                    doc.setFont('helvetica', 'bold');
	                    doc.text(watermarkText, pageWidth / 2, centerY, { align: 'center', angle: 45 });
	                    (doc as any).restoreGraphicsState?.();
	                } catch {
	                    // Fallback: draw a light watermark without opacity features.
	                    doc.setFontSize(60);
	                    doc.setTextColor(255, 200, 200);
	                    doc.setFont('helvetica', 'bold');
	                    doc.text(watermarkText, pageWidth / 2, centerY, { align: 'center', angle: 45 });
	                }
	            }

            // Footer
            const str = 'Page ' + (doc as any).internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // Slate-400
            doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
            doc.text('Motorway Oil Enterprise - Proprietary Forensic Intelligence', 40, doc.internal.pageSize.getHeight() - 20);
        },
    });

	    // Signature Zone
	    if (showSignature) {
	        const finalY = (doc as any).lastAutoTable.finalY || 80;
	        const pageHeight = doc.internal.pageSize.getHeight();
	        
	        // Add new page if space is limited
	        const needsNewPage = finalY > pageHeight - 100;
	        if (needsNewPage) doc.addPage();
	        
	        const sigY = needsNewPage ? 80 : finalY + 40;
	        doc.setDrawColor(148, 163, 184);
	        doc.line(40, sigY, 240, sigY);
	        doc.line(pageWidth - 240, sigY, pageWidth - 40, sigY);
        
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text('Field Inspector Signature', 40, sigY + 15);
        doc.text('Station Owner Approval', pageWidth - 40, sigY + 15, { align: 'right' });
    }

    // Save the PDF
    doc.save(filename);
};
