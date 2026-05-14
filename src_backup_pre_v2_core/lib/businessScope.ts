export type BusinessUnit = 'FUEL' | 'CNG' | 'LUBE';
export type BusinessId = 'fuel_station' | 'cng' | 'lube';

export interface BusinessMeta {
    unit: BusinessUnit;
    id: BusinessId;
    label: string;
    shortLabel: string;
    invoicePrefix: string;
    reportSlug: string;
}

const BUSINESS_META: Record<BusinessUnit, BusinessMeta> = {
    FUEL: {
        unit: 'FUEL',
        id: 'fuel_station',
        label: 'Fuel Station',
        shortLabel: 'Fuel',
        invoicePrefix: 'FS',
        reportSlug: 'fuel_station',
    },
    CNG: {
        unit: 'CNG',
        id: 'cng',
        label: 'CNG',
        shortLabel: 'CNG',
        invoicePrefix: 'CNG',
        reportSlug: 'cng',
    },
    LUBE: {
        unit: 'LUBE',
        id: 'lube',
        label: 'Lube',
        shortLabel: 'Lube',
        invoicePrefix: 'LB',
        reportSlug: 'lube',
    },
};

export const DEFAULT_BUSINESS_UNIT: BusinessUnit = 'FUEL';

export const normalizeBusinessUnit = (value?: string | null): BusinessUnit => {
    const normalized = (value || '').trim().toUpperCase();

    if (normalized === 'FUEL' || normalized === 'FUEL_STATION' || normalized === 'FUEL-STATION') {
        return 'FUEL';
    }

    if (normalized === 'CNG') {
        return 'CNG';
    }

    if (normalized === 'LUBE') {
        return 'LUBE';
    }

    if (normalized === 'FUEL_STATION' || normalized === 'FUELSTATION') {
        return 'FUEL';
    }

    if (normalized === 'FUEL STATION') {
        return 'FUEL';
    }

    return DEFAULT_BUSINESS_UNIT;
};

export const fromBusinessId = (value?: string | null): BusinessUnit => {
    const normalized = (value || '').trim().toLowerCase();

    if (normalized === 'fuel_station' || normalized === 'fuel-station' || normalized === 'fuel') {
        return 'FUEL';
    }

    if (normalized === 'cng') {
        return 'CNG';
    }

    if (normalized === 'lube') {
        return 'LUBE';
    }

    return DEFAULT_BUSINESS_UNIT;
};

export const toBusinessId = (value?: string | null): BusinessId => {
    const unit = normalizeBusinessUnit(value);
    return BUSINESS_META[unit].id;
};

export const getBusinessMeta = (value?: string | null): BusinessMeta => {
    const unit = normalizeBusinessUnit(value);
    return BUSINESS_META[unit];
};

export const resolveBusinessUnit = (
    record: Record<string, any> | null | undefined,
    fallbackUnit?: BusinessUnit
): BusinessUnit => {
    if (!record) {
        return fallbackUnit || DEFAULT_BUSINESS_UNIT;
    }

    if (typeof record.businessUnit === 'string' && record.businessUnit.trim()) {
        return normalizeBusinessUnit(record.businessUnit);
    }

    if (typeof record.business_id === 'string' && record.business_id.trim()) {
        return fromBusinessId(record.business_id);
    }

    return fallbackUnit || DEFAULT_BUSINESS_UNIT;
};

export const stampBusinessScope = <T extends Record<string, any>>(
    record: T,
    businessUnit?: string | null
): T => {
    const resolvedUnit = normalizeBusinessUnit(
        businessUnit || record.businessUnit || fromBusinessId(record.business_id)
    );

    return {
        ...record,
        businessUnit: resolvedUnit,
        business_id: BUSINESS_META[resolvedUnit].id,
    } as T;
};

export const matchesBusinessScope = (
    record: Record<string, any> | null | undefined,
    businessUnit: string | null | undefined,
    fallbackUnit?: BusinessUnit
): boolean => {
    const activeUnit = normalizeBusinessUnit(businessUnit);
    return resolveBusinessUnit(record, fallbackUnit) === activeUnit;
};

export const filterByBusinessScope = <T extends Record<string, any>>(
    records: T[] | null | undefined,
    businessUnit: string | null | undefined,
    fallbackUnit?: BusinessUnit
): T[] => {
    if (!Array.isArray(records)) {
        return [];
    }

    return records
        .filter(record => matchesBusinessScope(record, businessUnit, fallbackUnit))
        .map(record => stampBusinessScope(record, fallbackUnit || businessUnit));
};

export const buildBusinessFilename = (
    baseName: string,
    businessUnit: string | null | undefined,
    extension: string
): string => {
    const meta = getBusinessMeta(businessUnit);
    const normalizedBase = baseName.trim().replace(/\s+/g, '_');
    const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;
    return `${normalizedBase}_${meta.reportSlug}${normalizedExt}`;
};
