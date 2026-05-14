import { create } from 'zustand';

export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'END_OF_SHIFT';

export interface ScheduledReport {
    id: string;
    reportId: string;
    reportName: string;
    module: 'FUEL' | 'CNG' | 'LUBE' | 'ENTERPRISE';
    frequency: ScheduleFrequency;
    recipients: string[];
    nextRunAt: string;
    status: 'ACTIVE' | 'PAUSED';
    format: 'PDF' | 'CSV' | 'EXCEL';
}

interface ScheduleState {
    schedules: ScheduledReport[];
    addSchedule: (schedule: Omit<ScheduledReport, 'id' | 'status'>) => void;
    toggleScheduleStatus: (id: string) => void;
    deleteSchedule: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
    schedules: [
        {
            id: 'SCH-001',
            reportId: 'rep_fuel_shift_z',
            reportName: 'End of Shift Z-Report (Fuel)',
            module: 'FUEL',
            frequency: 'END_OF_SHIFT',
            recipients: ['manager@motorwayoil.com'],
            nextRunAt: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
            status: 'ACTIVE',
            format: 'PDF',
        }
    ],
    addSchedule: (schedule) => set((state) => ({
        schedules: [
            ...state.schedules,
            {
                ...schedule,
                id: `SCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                status: 'ACTIVE',
            }
        ]
    })),
    toggleScheduleStatus: (id) => set((state) => ({
        schedules: state.schedules.map(s => 
            s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : s
        )
    })),
    deleteSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter(s => s.id !== id)
    })),
}));
