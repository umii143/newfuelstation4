// API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Token management
export const AUTH_TOKEN_KEY = 'fuel_station_auth_token';

export const getAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

// API Client class
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // 1. Try to get legacy auth token
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            return headers;
        }

        // 2. Try to get Firebase ID token
        try {
            const { auth } = await import('@/lib/firebase');
            const user = auth.currentUser;
            if (user) {
                const idToken = await user.getIdToken();
                headers['Authorization'] = `Bearer ${idToken}`;
            }
        } catch (error) {
            console.error('Error getting Firebase token:', error);
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        const headers = await this.getHeaders();
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers,
        });

        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getHeaders();
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        const headers = await this.getHeaders();
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string): Promise<T> {
        const headers = await this.getHeaders();
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
