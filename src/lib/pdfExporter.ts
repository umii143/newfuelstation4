import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type PDFOrientation = 'portrait' | 'landscape';
type PDFConfidentiality = 'STANDARD' | 'INTERNAL' | 'CONFIDENTIAL' | 'FORENSIC';
type PDFAccentTheme = 'blue' | 'emerald' | 'slate' | 'rose';

interface PDFSummaryItem {
    label: string;
    value: string | number;
}

export interface PDFExportOptions {
    title: string;
    subtitle?: string;
    filename: string;
    columns: string[];
    data: Array<Array<string | number>>;
    orientation?: PDFOrientation;
    isForensic?: boolean;
    showSignature?: boolean;
    generatedAt?: Date;
    generatedBy?: string;
    businessLabel?: string;
    reportPeriod?: string;
    confidentiality?: PDFConfidentiality;
    accentTheme?: PDFAccentTheme;
    summaryItems?: PDFSummaryItem[];
    includeSummary?: boolean;
    includeTimestamp?: boolean;
    footerNote?: string;
}

const THEME_COLORS: Record<PDFAccentTheme, [number, number, number]> = {
    blue: [37, 99, 235],
    emerald: [5, 150, 105],
    slate: [51, 65, 85],
    rose: [225, 29, 72],
};

const CONFIDENTIALITY_COLORS: Record<PDFConfidentiality, [number, number, number]> = {
    STANDARD: [100, 116, 139],
    INTERNAL: [37, 99, 235],
    CONFIDENTIAL: [217, 119, 6],
    FORENSIC: [220, 38, 38],
};

const formatSummaryValue = (value: string | number): string =>
    typeof value === 'number' ? value.toLocaleString() : value;

export const exportToPDF = (options: PDFExportOptions) => {
    const {
        title,
        subtitle,
        filename,
        columns,
        data,
        orientation = 'landscape',
        isForensic = false,
        showSignature = false,
        generatedAt = new Date(),
        generatedBy,
        businessLabel,
        reportPeriod,
        confidentiality = isForensic ? 'FORENSIC' : 'INTERNAL',
        accentTheme = isForensic ? 'rose' : 'blue',
        summaryItems = [],
        includeSummary = true,
        includeTimestamp = true,
        footerNote,
    } = options;

    const doc = new jsPDF(orientation, 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const accentColor = THEME_COLORS[accentTheme];
    const confidentialityColor = CONFIDENTIALITY_COLORS[confidentiality];
    const timestamp = `Generated: ${format(generatedAt, 'PPpp')}`;

    doc.setFillColor(...accentColor);
    doc.rect(0, 0, pageWidth, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(15, 23, 42);
    doc.text('MOTORWAY OIL ENTERPRISE', 40, 42);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(businessLabel || 'Enterprise Operations Intelligence', 40, 58);

    doc.setFontSize(15);
    doc.setTextColor(...accentColor);
    doc.text(title, 40, 84);

    let infoY = 102;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    if (subtitle) {
        doc.text(subtitle, 40, infoY);
        infoY += 14;
    }

    if (reportPeriod) {
        doc.text(`Period: ${reportPeriod}`, 40, infoY);
        infoY += 14;
    }

    if (generatedBy) {
        doc.text(`Prepared by: ${generatedBy}`, 40, infoY);
        infoY += 14;
    }

    if (includeTimestamp) {
        doc.text(timestamp, pageWidth - 40, 42, { align: 'right' });
    }

    doc.setFillColor(...confidentialityColor);
    doc.roundedRect(pageWidth - 160, 62, 120, 22, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(confidentiality, pageWidth - 100, 76, { align: 'center' });

    let startY = Math.max(120, infoY + 10);

    if (includeSummary && summaryItems.length > 0) {
        const metrics = summaryItems.slice(0, 4);
        const gap = 12;
        const cardWidth = (pageWidth - 80 - gap * (metrics.length - 1)) / metrics.length;

        metrics.forEach((item, index) => {
            const x = 40 + index * (cardWidth + gap);
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(x, startY, cardWidth, 58, 10, 10, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(item.label.toUpperCase(), x + 12, startY + 17);

            doc.setFontSize(15);
            doc.setTextColor(15, 23, 42);
            doc.text(formatSummaryValue(item.value), x + 12, startY + 40, {
                maxWidth: cardWidth - 24,
            });
        });

        startY += 76;
    }

    autoTable(doc, {
        head: [columns],
        body: data,
        startY,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 4,
            font: 'helvetica',
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
        },
        headStyles: {
            fillColor: accentColor,
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { top: 40, right: 40, bottom: 68, left: 40 },
        didDrawPage: () => {
            if (isForensic) {
                const centerY = pageHeight / 2;
                const watermarkText = 'AUDIT-GRADE FORENSIC';

                try {
                    (doc as any).saveGraphicsState?.();
                    if ((doc as any).GState && (doc as any).setGState) {
                        (doc as any).setGState(new (doc as any).GState({ opacity: 0.08 }));
                    }
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(58);
                    doc.setTextColor(...CONFIDENTIALITY_COLORS.FORENSIC);
                    doc.text(watermarkText, pageWidth / 2, centerY, {
                        align: 'center',
                        angle: 45,
                    });
                    (doc as any).restoreGraphicsState?.();
                } catch {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(58);
                    doc.setTextColor(254, 202, 202);
                    doc.text(watermarkText, pageWidth / 2, centerY, {
                        align: 'center',
                        angle: 45,
                    });
                }
            }

            doc.setDrawColor(226, 232, 240);
            doc.line(40, pageHeight - 34, pageWidth - 40, pageHeight - 34);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(
                footerNote ||
                    'Motorway Oil Enterprise - Controlled distribution. Do not circulate externally without approval.',
                40,
                pageHeight - 20
            );
            doc.text(`Page ${(doc as any).internal.getNumberOfPages()}`, pageWidth - 40, pageHeight - 20, {
                align: 'right',
            });
        },
    });

    if (showSignature) {
        const finalY = (doc as any).lastAutoTable.finalY || startY;
        const needsNewPage = finalY > pageHeight - 120;

        if (needsNewPage) {
            doc.addPage();
        }

        const signatureY = needsNewPage ? 90 : finalY + 42;
        doc.setDrawColor(148, 163, 184);
        doc.line(40, signatureY, 240, signatureY);
        doc.line(pageWidth - 240, signatureY, pageWidth - 40, signatureY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text('Field Inspector Signature', 40, signatureY + 15);
        doc.text('Station Owner Approval', pageWidth - 40, signatureY + 15, {
            align: 'right',
        });
    }

    doc.save(filename);
};
