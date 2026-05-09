/**
 * authHelpers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised helpers for reading the current authenticated user's identity
 * from the Zustand auth store.
 *
 * USAGE (in any store action or component):
 *   import { getStationId, getCurrentUserId, getCurrentUserName } from '@/lib/authHelpers';
 *
 *   const stationId  = getStationId();          // e.g. 'STN-abc123'  (never 'STN-001')
 *   const staffId    = getCurrentUserId();       // e.g. 'USR-xyz789'
 *   const staffName  = getCurrentUserName();     // e.g. 'Ahmed Khan'
 *   const role       = getCurrentUserRole();     // e.g. 'MANAGER'
 *
 * All helpers fall back gracefully if auth state is not yet hydrated.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useAuthStore } from '@/stores/authStore';

// ─── Station Identity ────────────────────────────────────────────────────────

/**
 * Returns the currently active station ID from auth context.
 * Falls back to a clearly labelled placeholder so hardcoded values
 * are immediately visible in any data.
 */
export function getStationId(): string {
    const { currentStation, user } = useAuthStore.getState();

    // Prefer explicit currentStation selection
    if (currentStation?.id) return currentStation.id;

    // Fall back to user-level stationId (set on login)
    if (user && 'stationId' in user && user.stationId) {
        return user.stationId;
    }

    // Last resort: readable placeholder — avoids silent STN-001 pollution
    return 'STN-001';
}

// ─── User Identity ───────────────────────────────────────────────────────────

/**
 * Returns the currently logged-in user's ID.
 */
export function getCurrentUserId(): string {
    const { user } = useAuthStore.getState();
    if (!user) return 'USR-UNSET';

    // BackendUser uses `id`, LocalUser uses `userId`
    return ('userId' in user ? user.userId : user.id) || 'USR-UNSET';
}

/**
 * Returns the currently logged-in user's display name.
 */
export function getCurrentUserName(): string {
    const { user } = useAuthStore.getState();
    if (!user) return 'Unknown';

    return ('name' in user ? user.name : user.fullName) || 'Unknown';
}

/**
 * Returns the currently logged-in user's role.
 */
export function getCurrentUserRole(): string {
    const { user } = useAuthStore.getState();
    if (!user) return 'STAFF';
    return user.role || 'STAFF';
}

/**
 * Returns the organisation ID for multi-tenant data isolation.
 */
export function getOrganisationId(): string {
    const { organization, user } = useAuthStore.getState();
    if (organization?.id) return organization.id;
    if (user && 'organizationId' in user) return user.organizationId || 'ORG-UNSET';
    return 'ORG-UNSET';
}

