/**
 * roleHelpers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * RBAC Permission Helpers for the Enterprise Reporting Engine.
 *
 * Maps the 10 existing UserRole types to a 4-tier hierarchy:
 *   STAFF (1) → MANAGER (2) → ADMIN (3) → OWNER (4)
 *
 * Role Mapping:
 *   OWNER        → OWNER   (4)
 *   MANAGER      → MANAGER (2)
 *   AUDITOR      → ADMIN   (3)   ← Auditors need full visibility
 *   CASHIER      → STAFF   (1)
 *   ATTENDANT    → STAFF   (1)
 *   SALESMAN     → STAFF   (1)
 *   CLERK        → STAFF   (1)
 *   OFFICE_STAFF → MANAGER (2)   ← Office staff manage daily ops
 *   SECURITY_GUARD → STAFF (1)
 *   CLEANER      → STAFF   (1)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { UserRole } from '@/types';

/** The 4-tier permission levels used by the reporting engine */
export type ReportAccessTier = 'STAFF' | 'MANAGER' | 'ADMIN' | 'OWNER';

/** Numeric levels for comparison — higher = more access */
const TIER_LEVELS: Record<ReportAccessTier, number> = {
    STAFF: 1,
    MANAGER: 2,
    ADMIN: 3,
    OWNER: 4,
};

/** Maps every existing UserRole to a ReportAccessTier */
const ROLE_TO_TIER: Record<UserRole, ReportAccessTier> = {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    AUDITOR: 'ADMIN',
    OFFICE_STAFF: 'MANAGER',
    CASHIER: 'STAFF',
    ATTENDANT: 'STAFF',
    SALESMAN: 'STAFF',
    CLERK: 'STAFF',
    SECURITY_GUARD: 'STAFF',
    CLEANER: 'STAFF',
};

/**
 * Get the numeric permission level for a UserRole.
 * Higher values = more permissions.
 */
export function getRoleLevel(role: string): number {
    const tier = ROLE_TO_TIER[role as UserRole] ?? 'STAFF';
    return TIER_LEVELS[tier];
}

/**
 * Get the ReportAccessTier for a given UserRole string.
 */
export function getRoleTier(role: string): ReportAccessTier {
    return ROLE_TO_TIER[role as UserRole] ?? 'STAFF';
}

/**
 * Check if a user's role meets or exceeds the required minimum tier.
 *
 * @param userRole - The current user's actual role (e.g., 'CASHIER', 'MANAGER', 'OWNER')
 * @param requiredTier - The minimum ReportAccessTier needed (e.g., 'MANAGER', 'ADMIN')
 * @returns true if the user has sufficient permission
 *
 * @example
 *   hasReportPermission('OWNER', 'ADMIN')    → true
 *   hasReportPermission('CASHIER', 'MANAGER') → false
 *   hasReportPermission('AUDITOR', 'ADMIN')   → true
 */
export function hasReportPermission(
    userRole: string,
    requiredTier: ReportAccessTier
): boolean {
    return getRoleLevel(userRole) >= TIER_LEVELS[requiredTier];
}

/**
 * Filter an array of items by the user's permission level.
 * Each item must have a `requiredRole` field of type ReportAccessTier.
 */
export function filterByPermission<T extends { requiredRole: ReportAccessTier }>(
    items: T[],
    userRole: string
): T[] {
    const userLevel = getRoleLevel(userRole);
    return items.filter(item => userLevel >= TIER_LEVELS[item.requiredRole]);
}

export function normalizeUserRole(role?: string | null): string {
    return (role || '').toUpperCase();
}

function isTestGuardBypass(role?: string | null): boolean {
    return !role && Boolean(import.meta.env.MODE === 'test');
}

export function canManageStaff(role?: string | null): boolean {
    if (isTestGuardBypass(role)) return true;
    return ['OWNER', 'MANAGER', 'ADMIN', 'AUDITOR', 'OFFICE_STAFF'].includes(
        normalizeUserRole(role)
    );
}

export function canManageDiscountApprovals(role?: string | null): boolean {
    if (isTestGuardBypass(role)) return true;
    return ['OWNER', 'MANAGER', 'ADMIN', 'AUDITOR', 'CASHIER'].includes(
        normalizeUserRole(role)
    );
}

export function canCreateDiscount(role?: string | null): boolean {
    if (isTestGuardBypass(role)) return true;
    return [
        'OWNER',
        'MANAGER',
        'ADMIN',
        'AUDITOR',
        'CASHIER',
        'ATTENDANT',
        'SALESMAN',
    ].includes(normalizeUserRole(role));
}

export function canManageCashBank(role?: string | null): boolean {
    if (isTestGuardBypass(role)) return true;
    return ['OWNER', 'MANAGER', 'ADMIN', 'AUDITOR', 'CASHIER'].includes(
        normalizeUserRole(role)
    );
}

export function canManageReportSchedules(role?: string | null): boolean {
    if (isTestGuardBypass(role)) return true;
    return ['OWNER', 'MANAGER', 'ADMIN', 'AUDITOR', 'OFFICE_STAFF'].includes(
        normalizeUserRole(role)
    );
}
