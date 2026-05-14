import { apiClient, removeAuthToken, setAuthToken } from './client';

// Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
    stationName?: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        organizationId: string;
        stationId: string | null;
    };
    organization: {
        id: string;
        name: string;
        subscriptionPlan: string | null;
        subscriptionStatus: string | null;
    };
    stations?: Array<{
        id: string;
        name: string;
        businessType: string;
        isActive: boolean;
    }>;
    token: string;
}

// Authentication API
export const authApi = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

        // Store token
        if (response.token) {
            setAuthToken(response.token);
        }

        return response;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);

        // Store token
        if (response.token) {
            setAuthToken(response.token);
        }

        return response;
    },

    logout(): void {
        removeAuthToken();
    },

    // Security & Sessions
    async getSessions(): Promise<any[]> {
        return await apiClient.get<any[]>('/sessions');
    },

    async terminateSession(sessionId: string): Promise<void> {
        await apiClient.delete(`/sessions/${sessionId}`);
    },

    async getAuditLogs(params?: {
        email?: string;
        action?: string;
        limit?: number;
        offset?: number;
    }): Promise<any[]> {
        // If query params are provided, it's likely an admin request
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        const endpoint = params ? `/admin/security/logs${queryString}` : '/auth-verify/me'; // Fallback to profile for non-admins if needed, or implement a user log endpoint

        const response = await apiClient.get<any>(endpoint);

        // If it's the verify endpoint, we extract user info (audit logs not yet in verify response, but for now we'll mock or return empty if not admin)
        if (endpoint === '/auth-verify/me') {
            return []; // User-level audit logs coming soon
        }

        return response;
    },

    async getSecurityStats(): Promise<any> {
        return await apiClient.get<any>('/admin/security/stats');
    },

    async loginWithGoogle(): Promise<AuthResponse> {
        // The apiClient will automatically pick up the Firebase token
        // if user is signed into Firebase but hasn't linked to our backend yet.
        const response = await apiClient.post<AuthResponse>('/auth/google');

        if (response.token) {
            setAuthToken(response.token);
        }

        return response;
    },
};
