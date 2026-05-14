import { Scale, Droplet, FileText, ShieldCheck } from 'lucide-react';
import type { ReportDefinition } from './ReportRegistry';

export const COMPLIANCE_REPORTS: ReportDefinition[] = [
    {
        id: 'comp-01-nozzle-cal',
        title: 'Weights & Measures Calibration Log',
        description: 'Record of physical nozzle accuracy tests and government seal verification.',
        category: 'COMPLIANCE',
        module: 'FUEL',
        requiredRole: 'MANAGER',
        icon: Scale,
        dataSource: 'comp-nozzle-cal',
        columns: [
            { key: 'date', label: 'Test Date', type: 'date' },
            { key: 'nozzleId', label: 'Nozzle ID', type: 'text' },
            { key: 'testVolume', label: 'Test Vol (L)', type: 'number' },
            { key: 'actualVolume', label: 'Actual Vol (L)', type: 'number' },
            { key: 'variance', label: 'Variance %', type: 'badge' },
            { key: 'sealNumber', label: 'Govt Seal #', type: 'text' },
            { key: 'status', label: 'Status', type: 'badge' }
        ]
    },
    {
        id: 'comp-02-env-spill',
        title: 'Environmental Spill & Incident Log',
        description: 'Mandatory documentation of spillages, leakages, or environmental hazards.',
        category: 'COMPLIANCE',
        module: 'FUEL',
        requiredRole: 'MANAGER',
        icon: Droplet,
        dataSource: 'comp-env-spill',
        columns: [
            { key: 'date', label: 'Incident Date', type: 'datetime' },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'severity', label: 'Severity', type: 'badge' },
            { key: 'details', label: 'Incident Details', type: 'text' },
            { key: 'actionTaken', label: 'Remediation', type: 'text' },
            { key: 'reportedBy', label: 'Officer', type: 'user' }
        ]
    },
    {
        id: 'comp-03-license',
        title: 'Petroleum License Tracking',
        description: 'Expiry tracking and compliance status of all operational licenses.',
        category: 'COMPLIANCE',
        module: 'ALL',
        requiredRole: 'OWNER',
        icon: FileText,
        dataSource: 'comp-license',
        columns: [
            { key: 'licenseName', label: 'License Type', type: 'text' },
            { key: 'issuingAuthority', label: 'Authority', type: 'text' },
            { key: 'expiryDate', label: 'Expires On', type: 'date' },
            { key: 'daysRemaining', label: 'Days Left', type: 'number' },
            { key: 'status', label: 'Standing', type: 'badge' }
        ]
    },
    {
        id: 'comp-04-safety',
        title: 'Fire Safety & PPE Audit',
        description: 'Verification of fire extinguishers and safety equipment health.',
        category: 'COMPLIANCE',
        module: 'ALL',
        requiredRole: 'MANAGER',
        icon: ShieldCheck,
        dataSource: 'comp-safety',
        columns: [
            { key: 'equipment', label: 'Safety Asset', type: 'text' },
            { key: 'lastChecked', label: 'Last Audit', type: 'date' },
            { key: 'nextAudit', label: 'Next Due', type: 'date' },
            { key: 'condition', label: 'Condition', type: 'badge' },
            { key: 'auditedBy', label: 'Auditor', type: 'user' }
        ]
    }
];
