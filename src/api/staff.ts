import { apiClient } from './client';

export interface StaffMember {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    pin: string | null;
    organizationId: string;
    stationId: string | null;
    businessUnit: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    stationId: string;
    date: string;
    clockIn: string;
    clockOut: string | null;
    status: string;
    totalHours: number;
    overtimeHours: number;
    businessUnit: string | null;
    user?: {
        fullName: string;
        role: string;
    };
    station?: {
        name: string;
    };
}

export const staffApi = {
    async getStaff(organizationId: string, businessUnit?: string): Promise<StaffMember[]> {
        const query = businessUnit ? `?businessUnit=${businessUnit}` : '';
        return apiClient.get<StaffMember[]>(`/staff/organizations/${organizationId}${query}`);
    },

    async addStaff(organizationId: string, data: Partial<StaffMember>): Promise<StaffMember> {
        return apiClient.post<StaffMember>(`/staff/organizations/${organizationId}`, data);
    },

    async updateStaff(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
        return apiClient.put<StaffMember>(`/staff/port/${id}`, data);
    },

    async deleteStaff(id: string): Promise<void> {
        return apiClient.delete<void>(`/staff/${id}`);
    },

    async getAttendance(
        organizationId: string,
        filters: {
            startDate?: string;
            endDate?: string;
            userId?: string;
            stationId?: string;
        }
    ): Promise<AttendanceRecord[]> {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.stationId) params.append('stationId', filters.stationId);

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiClient.get<AttendanceRecord[]>(
            `/staff/organizations/${organizationId}/attendance${query}`
        );
    },

    async clockIn(data: {
        userId: string;
        stationId: string;
        businessUnit: string;
    }): Promise<AttendanceRecord> {
        return apiClient.post<AttendanceRecord>('/staff/clock-in', data);
    },

    async clockOut(id: string): Promise<AttendanceRecord> {
        return apiClient.post<AttendanceRecord>(`/staff/clock-out/${id}`, {});
    },
};
