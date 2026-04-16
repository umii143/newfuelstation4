import { authApi, type AuthResponse, getAuthToken, removeAuthToken } from '@/api';
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

interface Settings {
    theme: string;
    language: string;
    businessUnit: string;
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
    resetSettings: () => void;
    setCurrentStation: (station: Station) => void;
    
    // System wipe
    clearAllData: () => void;
}

const defaultSettings: Settings = {
    theme: 'glassy-white',
    language: 'en',
    businessUnit: 'LUBE',
    taxConfig: {
        enabled: true,
        mode: 'EXCLUSIVE',
        defaultRate: 17,
    },
    currency: 'PKR',
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

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
                        businessUnit: foundUser.businessUnit,
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
                    const response = await authApi.loginWithGoogle();

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
            isAdmin: () => get().user?.role === 'admin',
            isManager: () => ['admin', 'manager'].includes(get().user?.role || ''),
            isStaff: () =>
                ['admin', 'manager', 'operator', 'staff'].includes(get().user?.role || ''),

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
                    // First check if we have a Firebase user
                    const { auth } = await import('@/lib/firebase');
                    const firebaseUser = auth.currentUser;

                    if (firebaseUser) {
                        // User is authenticated with Firebase
                        set({
                            isAuthenticated: true,
                            user: {
                                userId: firebaseUser.uid,
                                name: firebaseUser.displayName || firebaseUser.email || 'User',
                                email: firebaseUser.email || '',
                                phone: firebaseUser.phoneNumber || '',
                                role: 'admin',
                                theme: 'glassy-white',
                                language: 'en',
                                businessUnit: localStorage.getItem('businessUnit') || 'FUEL',
                            } as LocalUser,
                            isLoading: false,
                        });
                        return;
                    }

                    // Fallback: check for JWT token or local auth
                    const token = getAuthToken();
                    const state = get();

                    // Check for backend token
                    if (token && state.user && 'email' in state.user) {
                        set({ isAuthenticated: true });
                        return;
                    }

                    // Check for local PIN auth (no token needed)
                    if (state.user && 'userId' in state.user) {
                        set({ isAuthenticated: true });
                        return;
                    }

                    // No authentication found
                    set({ isAuthenticated: false });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    set({ isAuthenticated: false });
                }
            },

            // Update settings
            updateSettings: (newSettings: Partial<Settings>) => {
                set(state => ({
                    settings: { ...state.settings, ...newSettings },
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
