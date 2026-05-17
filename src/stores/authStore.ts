import { authApi, type AuthResponse, getAuthToken, removeAuthToken } from '@/api';
import { normalizeBusinessUnit, toBusinessId, type BusinessId, type BusinessUnit } from '@/lib/businessScope';
import { loginWithGoogle as firebaseLoginWithGoogle } from '@/lib/firebase';
import type { User as StaffUser } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Backend user type
interface BackendUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId: string;
    stationId: string | null;
    authMethod?: string;
}

// Local user type (for PIN auth)
interface LocalUser {
    userId: string;
    name: string;
    email?: string;
    phone: string;
    role: string;
    theme: string;
    language: string;
    businessUnit: string;
    organizationId: string;
    stationId: string | null;
    authMethod?: string;
}

interface Organization {
    id: string;
    name: string;
    subscriptionPlan: string | null;
    subscriptionStatus: string | null;
}

interface Station {
    id: string;
    name: string;
    businessType: string;
    isActive: boolean;
}

export interface AccessRequest {
    userId: string;
    email: string;
    name: string;
    businessUnit: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: string;
    requestedStationId?: string;
    stationId?: string;
    role?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    rejectionReason?: string;
}

interface Settings {
    theme: string;
    language: string;
    businessUnit: BusinessUnit;
    businessId?: BusinessId;
    // Lube Settings Extensions
    taxConfig?: {
        enabled: boolean;
        mode: 'INCLUSIVE' | 'EXCLUSIVE';
        defaultRate: number;
    };
    discountConfig?: {
        enabled: boolean;
        maxPercentage: number;
        maxAmount: number;
        requiresApproval: boolean;
        approvalThreshold: number;
    };
    businessName?: string;
    businessPhone?: string;
    businessLocation?: string;
    currency?: string;
    // CNG-specific fields
    cngMeterIds?: string[];
    easyPaisaAccount?: string;
    jazzCashAccount?: string;
}

interface AuthState {
    // State
    user: BackendUser | LocalUser | null;
    organization: Organization | null;
    stations: Station[];
    currentStation: Station | null;
    settings: Settings;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    lockoutUntil: number | null;
    failedAttempts: number;
    authMethod: 'GOOGLE' | 'PIN' | 'EMAIL' | null;

    // Security state
    sessions: any[];
    auditLogs: any[];
    accessRequests: AccessRequest[];

    // Authentication methods
    loginWithPIN: (pin: string, users: StaffUser[]) => Promise<boolean>;
    loginWithBackend: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    setError: (error: string | null) => void;

    // Role helpers
    isAdmin: () => boolean;
    isManager: () => boolean;
    isStaff: () => boolean;

    // Security actions
    fetchSessions: () => Promise<void>;
    fetchAuditLogs: () => Promise<void>;
    terminateSession: (sessionId: string) => Promise<void>;
    fetchAccessRequests: () => Promise<void>;
    approveAccessRequest: (requestId: string, decision: { stationId: string; role: string }) => Promise<void>;
    rejectAccessRequest: (requestId: string, reason?: string) => Promise<void>;

    // Legacy method for backward compatibility
    login: (emailOrPin: string, passwordOrUsers?: string | StaffUser[]) => Promise<boolean | void>;

    register: (data: {
        email: string;
        password: string;
        fullName: string;
        organizationName: string;
        stationName?: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearLockout: () => void;

    // Settings methods
    updateSettings: (settings: Partial<Settings>) => void;
    switchBusinessUnit: (businessUnit: BusinessUnit) => void;
    resetSettings: () => void;
    setCurrentStation: (station: Station) => void;
    
    // System wipe
    clearAllData: () => void;
}

const defaultSettings: Settings = {
    theme: 'glassy-white',
    language: 'en',
    businessUnit: 'LUBE',
    businessId: 'lube',
    taxConfig: {
        enabled: true,
        mode: 'EXCLUSIVE',
        defaultRate: 17,
    },
    currency: 'PKR',
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const normalizeRole = (role?: string | null): string => (role || '').toUpperCase();

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            organization: null,
            stations: [],
            currentStation: null,
            settings: defaultSettings,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            lockoutUntil: null,
            failedAttempts: 0,
            authMethod: null,
            sessions: [],
            auditLogs: [],
            accessRequests: [],

            // PIN-based login (local authentication)
            loginWithPIN: async (pin: string, users: StaffUser[]) => {
                const state = get();

                // Check lockout
                if (state.lockoutUntil && Date.now() < state.lockoutUntil) {
                    set({ error: 'Account temporarily locked. Please try again later.' });
                    return false;
                }

                // Find user by PIN
                const foundUser = users.find(u => u.pin === pin && u.status === 'ACTIVE');

                if (!foundUser) {
                    const newFailedAttempts = state.failedAttempts + 1;
                    const lockout =
                        newFailedAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_DURATION : null;

                    set({
                        error: 'Invalid PIN. Please try again.',
                        failedAttempts: newFailedAttempts,
                        lockoutUntil: lockout,
                    });
                    return false;
                }

                // Successful PIN login
                set({
                    user: {
                        userId: foundUser.userId,
                        name: foundUser.name,
                        email: foundUser.email,
                        phone: foundUser.phone,
                        role: foundUser.role,
                        theme: foundUser.theme,
                        language: foundUser.language,
                        businessUnit: foundUser.businessUnit,
                        organizationId:
                            foundUser.organizationId ||
                            state.organization?.id ||
                            (localStorage.getItem('organizationId') as string),
                        stationId:
                            foundUser.stationId ||
                            state.currentStation?.id ||
                            (localStorage.getItem('currentStationId') as string),
                    } as LocalUser,
                    organization: state.organization || {
                        id:
                            foundUser.organizationId ||
                            (localStorage.getItem('organizationId') as string),
                        name: 'My Organization',
                        subscriptionPlan: null,
                        subscriptionStatus: 'ACTIVE',
                    },
                    currentStation: state.currentStation || {
                        id:
                            foundUser.stationId ||
                            (localStorage.getItem('currentStationId') as string),
                        name: 'Default Station',
                        businessType: foundUser.businessUnit,
                        isActive: true,
                    },
                        settings: {
                            theme: foundUser.theme,
                            language: foundUser.language,
                            businessUnit: normalizeBusinessUnit(foundUser.businessUnit),
                            businessId: toBusinessId(foundUser.businessUnit),
                        },
                    isAuthenticated: true,
                    error: null,
                    failedAttempts: 0,
                    lockoutUntil: null,
                    authMethod: 'PIN',
                });

                return true;
            },

            // Backend email/password login
            loginWithBackend: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const response: AuthResponse = await authApi.login({ email, password });

                    set({
                        user: response.user as BackendUser,
                        organization: response.organization,
                        stations: response.stations || [],
                        currentStation: response.stations?.[0] || null,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        failedAttempts: 0,
                        authMethod: 'EMAIL',
                    });
                } catch (error: any) {
                    const newFailedAttempts = get().failedAttempts + 1;
                    const lockout =
                        newFailedAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_DURATION : null;

                    set({
                        error: error.message || 'Login failed',
                        isLoading: false,
                        isAuthenticated: false,
                        failedAttempts: newFailedAttempts,
                        lockoutUntil: lockout,
                    });
                    throw error;
                }
            },

            // Google OAuth login
            loginWithGoogle: async () => {
                try {
                    set({ isLoading: true, error: null });

                    // 1. First login with Firebase to get the ID token
                    await firebaseLoginWithGoogle();

                    // 2. Then call our backend to sync/get system token
                    // The App.tsx listener will automatically set isAuthenticated to true.
                    set({
                        isLoading: false,
                        error: null,
                        authMethod: 'GOOGLE',
                    });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.message || 'Google login failed',
                    });
                    throw error;
                }
            },

            setError: error => set({ error }),

            // Legacy login method (auto-detects PIN vs email/password)
            login: async (emailOrPin: string, passwordOrUsers?: string | StaffUser[]) => {
                // If second param is an array, it's PIN login
                if (Array.isArray(passwordOrUsers)) {
                    return get().loginWithPIN(emailOrPin, passwordOrUsers);
                }

                // Otherwise, it's backend email/password login
                if (typeof passwordOrUsers === 'string') {
                    await get().loginWithBackend(emailOrPin, passwordOrUsers);
                    return true;
                }

                // Invalid usage
                set({ error: 'Invalid login parameters' });
                return false;
            },

            // Register with backend
            register: async data => {
                try {
                    set({ isLoading: true, error: null });

                    const response: AuthResponse = await authApi.register(data);

                    set({
                        user: response.user as BackendUser,
                        organization: response.organization,
                        stations: response.stations || [],
                        currentStation: response.stations?.[0] || null,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        error: error.message || 'Registration failed',
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            // Logout
            logout: async () => {
                try {
                    // Sign out from Firebase first
                    const { logout: firebaseLogout } = await import('@/lib/firebase');
                    await firebaseLogout();
                } catch (error) {
                    console.error('Firebase logout error:', error);
                }

                // Clear backend token
                removeAuthToken();

                // Clear auth state
                set({
                    user: null,
                    organization: null,
                    stations: [],
                    currentStation: null,
                    isAuthenticated: false,
                    error: null,
                    failedAttempts: 0,
                    lockoutUntil: null,
                });

                // Redirect to login
                window.location.href = '/';
            },

            // Role helpers
            isAdmin: () => normalizeRole(get().user?.role) === 'ADMIN',
            isManager: () => ['ADMIN', 'MANAGER'].includes(normalizeRole(get().user?.role)),
            isStaff: () =>
                ['ADMIN', 'MANAGER', 'OPERATOR', 'STAFF'].includes(
                    normalizeRole(get().user?.role)
                ),

            // Security actions
            fetchSessions: async () => {
                try {
                    const response = await authApi.getSessions();
                    set({ sessions: response });
                } catch (error) {
                    console.error('Failed to fetch sessions:', error);
                }
            },

            fetchAuditLogs: async () => {
                try {
                    const response = await authApi.getAuditLogs();
                    set({ auditLogs: response });
                } catch (error) {
                    console.error('Failed to fetch audit logs:', error);
                }
            },

            terminateSession: async (sessionId: string) => {
                try {
                    await authApi.terminateSession(sessionId);
                    await get().fetchSessions();
                } catch (error) {
                    console.error('Failed to terminate session:', error);
                }
            },

            fetchAccessRequests: async () => {
                try {
                    const [{ collection, getDocs, orderBy, query }, { COLLECTIONS, db }] =
                        await Promise.all([
                            import('firebase/firestore'),
                            import('@/lib/db'),
                        ]);

                    const snapshot = await getDocs(
                        query(collection(db, COLLECTIONS.ACCESS_REQUESTS), orderBy('requestedAt', 'desc'))
                    );

                    set({
                        accessRequests: snapshot.docs.map(doc => {
                            const data = doc.data() as AccessRequest;
                            return {
                                ...data,
                                userId: data.userId || doc.id,
                            };
                        }),
                    });
                } catch (error) {
                    console.error('Failed to fetch access requests:', error);
                }
            },

            approveAccessRequest: async (requestId, decision) => {
                try {
                    const [{ doc, getDoc, serverTimestamp, setDoc, updateDoc }, { COLLECTIONS, db }] =
                        await Promise.all([
                            import('firebase/firestore'),
                            import('@/lib/db'),
                        ]);

                    const state = get();
                    const requestRef = doc(db, COLLECTIONS.ACCESS_REQUESTS, requestId);
                    const requestSnap = await getDoc(requestRef);
                    if (!requestSnap.exists()) {
                        throw new Error('Access request no longer exists.');
                    }

                    const request = requestSnap.data() as AccessRequest;
                    const approverId =
                        (state.user &&
                        ('userId' in state.user ? state.user.userId : state.user.id)) ||
                        'SYSTEM';

                    await setDoc(
                        doc(db, 'users', requestId),
                        {
                            email: request.email,
                            name: request.name,
                            role: decision.role,
                            stationId: decision.stationId,
                            businessUnit: request.businessUnit,
                            approvedAt: new Date().toISOString(),
                            approvedBy: approverId,
                            updatedAt: new Date().toISOString(),
                        },
                        { merge: true }
                    );

                    await updateDoc(requestRef, {
                        status: 'APPROVED',
                        stationId: decision.stationId,
                        role: decision.role,
                        resolvedBy: approverId,
                        resolvedAt: new Date().toISOString(),
                        updatedAt: serverTimestamp(),
                    });

                    await get().fetchAccessRequests();
                } catch (error) {
                    console.error('Failed to approve access request:', error);
                    throw error;
                }
            },

            rejectAccessRequest: async (requestId, reason) => {
                try {
                    const [{ doc, serverTimestamp, updateDoc }, { COLLECTIONS, db }] =
                        await Promise.all([
                            import('firebase/firestore'),
                            import('@/lib/db'),
                        ]);

                    const state = get();
                    const approverId =
                        (state.user &&
                        ('userId' in state.user ? state.user.userId : state.user.id)) ||
                        'SYSTEM';

                    await updateDoc(doc(db, COLLECTIONS.ACCESS_REQUESTS, requestId), {
                        status: 'REJECTED',
                        rejectionReason: reason || 'Rejected by administrator',
                        resolvedBy: approverId,
                        resolvedAt: new Date().toISOString(),
                        updatedAt: serverTimestamp(),
                    });

                    await get().fetchAccessRequests();
                } catch (error) {
                    console.error('Failed to reject access request:', error);
                    throw error;
                }
            },

            // Clear lockout
            clearLockout: () => {
                set({
                    lockoutUntil: null,
                    failedAttempts: 0,
                    error: null,
                });
            },

            // Check authentication on app load
            checkAuth: async () => {
                try {
                    const { auth } = await import('@/lib/firebase');
                    const firebaseUser = auth.currentUser;
                    const state = get();

                    if (firebaseUser) {
                        const stateUser = state.user;
                        const currentUserId =
                            stateUser && 'userId' in stateUser ? stateUser.userId : undefined;

                        if (currentUserId === firebaseUser.uid && state.isAuthenticated) {
                            set({ isLoading: false });
                        } else {
                            set({
                                isAuthenticated: false,
                                user: null,
                                isLoading: false,
                            });
                        }
                        return;
                    }

                    const token = getAuthToken();

                    if (token && state.user && 'email' in state.user) {
                        set({ isAuthenticated: true, isLoading: false });
                        return;
                    }

                    if (state.user && 'userId' in state.user) {
                        set({ isAuthenticated: true, isLoading: false });
                        return;
                    }

                    set({ isAuthenticated: false, isLoading: false });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    set({ isAuthenticated: false, isLoading: false });
                }
            },

            // Update settings
            updateSettings: (newSettings: Partial<Settings>) => {
                const nextBusinessUnit = newSettings.businessUnit
                    ? normalizeBusinessUnit(newSettings.businessUnit)
                    : undefined;

                set(state => ({
                    settings: {
                        ...state.settings,
                        ...newSettings,
                        ...(nextBusinessUnit
                            ? {
                                  businessUnit: nextBusinessUnit,
                                  businessId: toBusinessId(nextBusinessUnit),
                              }
                            : {}),
                    },
                }));
            },

            switchBusinessUnit: (businessUnit: BusinessUnit) => {
                const nextBusinessUnit = normalizeBusinessUnit(businessUnit);

                set(state => ({
                    settings: {
                        ...state.settings,
                        businessUnit: nextBusinessUnit,
                        businessId: toBusinessId(nextBusinessUnit),
                    },
                }));
            },

            // Reset settings
            resetSettings: () => {
                set({ settings: defaultSettings });
            },

            // Set current station
            setCurrentStation: (station: Station) => {
                set({ currentStation: station });
            },

            // Clear all data (System Wipe)
            clearAllData: () => {
                localStorage.clear();
                // Optionally clear specific stores if needed, but localStorage.clear() handles persisted Zustand stores
            },
        }),
        {
            name: 'fuel-station-auth',
            partialize: state => ({
                user: state.user,
                organization: state.organization,
                stations: state.stations,
                currentStation: state.currentStation,
                settings: state.settings,
                isAuthenticated: state.isAuthenticated,
                lockoutUntil: state.lockoutUntil,
                failedAttempts: state.failedAttempts,
                authMethod: state.authMethod,
            }),
        }
    )
);

// Backward compatibility export
export const useSettingsStore = useAuthStore;


