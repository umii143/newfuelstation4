import { create } from 'zustand';
import { COLLECTIONS } from '@/lib/db';
import { canManageReportSchedules } from '@/lib/roleHelpers';
import { fsDelete, fsSet, fsUpdate } from '@/services/firestoreService';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

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
    stationId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ScheduleRunLog {
    id: string;
    scheduleId: string;
    reportName: string;
    module: ScheduledReport['module'];
    format: ScheduledReport['format'];
    recipients: string[];
    status: 'SUCCESS' | 'QUEUED' | 'FAILED';
    triggeredAt: string;
    triggeredBy: 'AUTO' | 'MANUAL';
    stationId: string;
    errorMessage?: string;
}

interface ScheduleState {
    schedules: ScheduledReport[];
    runLogs: ScheduleRunLog[];
    setSchedules: (schedules: ScheduledReport[]) => void;
    setRunLogs: (runLogs: ScheduleRunLog[]) => void;
    addSchedule: (schedule: Omit<ScheduledReport, 'id' | 'status' | 'stationId'>) => Promise<boolean>;
    toggleScheduleStatus: (id: string) => Promise<boolean>;
    deleteSchedule: (id: string) => Promise<boolean>;
    runScheduleNow: (id: string) => Promise<boolean>;
    getSchedulesForModule: (module: ScheduledReport['module']) => ScheduledReport[];
    getRunLogsForModule: (module: ScheduledReport['module']) => ScheduleRunLog[];
}

const calculateNextRunAt = (frequency: ScheduleFrequency, from = new Date()) => {
    const nextRunAt = new Date(from);

    switch (frequency) {
        case 'DAILY':
            nextRunAt.setDate(nextRunAt.getDate() + 1);
            break;
        case 'WEEKLY':
            nextRunAt.setDate(nextRunAt.getDate() + 7);
            break;
        case 'MONTHLY':
            nextRunAt.setMonth(nextRunAt.getMonth() + 1);
            break;
        case 'END_OF_SHIFT':
            nextRunAt.setHours(23, 59, 59, 999);
            break;
    }

    return nextRunAt.toISOString();
};

const getScheduleContext = () => {
    const { user } = useAuthStore.getState();
    const toast = useToastStore.getState();

    if (!user?.stationId) {
        toast.error('Station context missing', 'Sign in again before managing report automation.');
        return null;
    }

    if (!canManageReportSchedules(user.role)) {
        toast.error(
            'Access denied',
            'Only authorized management roles can manage automated report delivery.'
        );
        return null;
    }

    return { stationId: user.stationId };
};

export const useScheduleStore = create<ScheduleState>()((set, get) => ({
    schedules: [],
    runLogs: [],
    setSchedules: schedules => set({ schedules }),
    setRunLogs: runLogs =>
        set({
            runLogs: [...runLogs].sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt)),
        }),
    addSchedule: async schedule => {
        const context = getScheduleContext();
        if (!context) return false;

        const timestamp = new Date().toISOString();
        const newSchedule: ScheduledReport = {
            ...schedule,
            id: `SCH-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
            status: 'ACTIVE',
            stationId: context.stationId,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const previousSchedules = get().schedules;
        set({ schedules: [...previousSchedules, newSchedule] });

        const saved = await fsSet(
            context.stationId,
            COLLECTIONS.REPORT_SCHEDULES,
            newSchedule.id,
            newSchedule
        );

        if (!saved) {
            set({ schedules: previousSchedules });
        }

        return saved;
    },
    toggleScheduleStatus: async id => {
        const context = getScheduleContext();
        if (!context) return false;

        const schedule = get().schedules.find(item => item.id === id);
        if (!schedule) return false;

        const updatedSchedule: ScheduledReport = {
            ...schedule,
            status: schedule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
            updatedAt: new Date().toISOString(),
        };

        const previousSchedules = get().schedules;
        set({
            schedules: previousSchedules.map(item => (item.id === id ? updatedSchedule : item)),
        });

        const saved = await fsUpdate(context.stationId, COLLECTIONS.REPORT_SCHEDULES, id, {
            status: updatedSchedule.status,
            updatedAt: updatedSchedule.updatedAt,
        });

        if (!saved) {
            set({ schedules: previousSchedules });
        }

        return saved;
    },
    deleteSchedule: async id => {
        const context = getScheduleContext();
        if (!context) return false;

        const previousSchedules = get().schedules;
        set({ schedules: previousSchedules.filter(schedule => schedule.id !== id) });

        const deleted = await fsDelete(context.stationId, COLLECTIONS.REPORT_SCHEDULES, id);
        if (!deleted) {
            set({ schedules: previousSchedules });
        }

        return deleted;
    },
    runScheduleNow: async id => {
        const context = getScheduleContext();
        if (!context) return false;

        const schedule = get().schedules.find(item => item.id === id);
        if (!schedule) return false;

        const now = new Date();
        const nextRunAt = calculateNextRunAt(schedule.frequency, now);
        const updatedSchedule: ScheduledReport = {
            ...schedule,
            nextRunAt,
            updatedAt: now.toISOString(),
        };
        const runLog: ScheduleRunLog = {
            id: `RUN-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
            scheduleId: schedule.id,
            reportName: schedule.reportName,
            module: schedule.module,
            format: schedule.format,
            recipients: schedule.recipients,
            status: 'QUEUED',
            triggeredAt: now.toISOString(),
            triggeredBy: 'MANUAL',
            stationId: context.stationId,
        };

        const previousSchedules = get().schedules;
        const previousRunLogs = get().runLogs;

        set({
            schedules: previousSchedules.map(item => (item.id === id ? updatedSchedule : item)),
            runLogs: [runLog, ...previousRunLogs].slice(0, 40),
        });

        const scheduleSaved = await fsUpdate(context.stationId, COLLECTIONS.REPORT_SCHEDULES, id, {
            nextRunAt,
            updatedAt: updatedSchedule.updatedAt,
        });

        if (!scheduleSaved) {
            set({ schedules: previousSchedules, runLogs: previousRunLogs });
            return false;
        }

        const runLogSaved = await fsSet(
            context.stationId,
            COLLECTIONS.REPORT_RUN_LOGS,
            runLog.id,
            runLog
        );

        if (!runLogSaved) {
            set({ runLogs: previousRunLogs });
            return false;
        }

        return true;
    },
    getSchedulesForModule: module =>
        get()
            .schedules
            .filter(schedule => schedule.module === module || schedule.module === 'ENTERPRISE')
            .sort((a, b) => a.nextRunAt.localeCompare(b.nextRunAt)),
    getRunLogsForModule: module =>
        get()
            .runLogs
            .filter(log => log.module === module || log.module === 'ENTERPRISE')
            .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt)),
}));
