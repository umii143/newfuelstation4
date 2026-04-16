import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { useStaffStore } from '@/stores/dataStores';
import { format } from 'date-fns';
import {
    Calendar,
    CheckCircle,
    Clock,
    Filter,
    LogIn,
    LogOut,
    Search,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

const formatTime = (dateString?: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-PK', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const AttendancePage: React.FC = () => {
    const { users, attendance, recordClockIn, recordClockOut, isLoading } = useStaffStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [showAllDates, setShowAllDates] = useState(false);

    // Clock-in modal
    const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusOverride, setStatusOverride] = useState<'PRESENT' | 'LATE'>('PRESENT');

    const activeStaff = users.filter(u => u.status === 'ACTIVE');
    const today = new Date().toISOString().split('T')[0];

    // Find who is currently clocked in (no clockOut) today
    const clockedInToday = useMemo(
        () => attendance.filter(a => a.date === today && !a.clockOut).map(a => a.userId),
        [attendance, today]
    );

    const filteredAttendance = useMemo(() => {
        let records = attendance;
        if (!showAllDates) {
            records = records.filter(a => a.date === dateFilter);
        }
        if (searchQuery) {
            records = records.filter(
                a =>
                    a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.date.includes(searchQuery)
            );
        }
        return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, dateFilter, showAllDates, searchQuery]);

    const todayStats = useMemo(() => {
        const todayRecords = attendance.filter(a => a.date === today);
        return {
            present: todayRecords.length,
            onTime: todayRecords.filter(a => a.status === 'PRESENT').length,
            late: todayRecords.filter(a => a.status === 'LATE').length,
            totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
            overtimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
        };
    }, [attendance, today]);

    const handleClockIn = async () => {
        if (!selectedStaffId) return;
        await recordClockIn(selectedStaffId);
        setIsClockInModalOpen(false);
        setSelectedStaffId('');
    };

    const handleClockOut = async (userId: string) => {
        await recordClockOut(userId);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return 'emerald';
            case 'LATE':
                return 'amber';
            case 'ABSENT':
            case 'LEAVE':
                return 'rose';
            case 'HALF_DAY':
                return 'amber';
            default:
                return 'blue';
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Attendance"
                subtitle="Track daily clock-ins, hours worked, and overtime"
                actions={
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                /* export */
                            }}
                        >
                            <Calendar size={18} className="mr-2" /> Export
                        </Button>
                        <Button
                            onClick={() => setIsClockInModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                        >
                            <LogIn size={18} className="mr-2" /> Clock In Staff
                        </Button>
                    </div>
                }
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20 p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Present Today</p>
                    <p className="text-3xl font-bold text-blue-500">{todayStats.present}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                        of {activeStaff.length} active staff
                    </p>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20 p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">On Time</p>
                    <p className="text-3xl font-bold text-emerald-500">{todayStats.onTime}</p>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20 p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Late Today</p>
                    <p className="text-3xl font-bold text-amber-500">{todayStats.late}</p>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20 p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Total Hours</p>
                    <p className="text-3xl font-bold text-purple-500">
                        {todayStats.totalHours.toFixed(1)}h
                    </p>
                </Card>
                <Card className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 border-rose-500/20 p-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-1">Overtime</p>
                    <p className="text-3xl font-bold text-rose-500">
                        {todayStats.overtimeHours.toFixed(1)}h
                    </p>
                </Card>
            </div>

            {/* Currently Clocked In */}
            {clockedInToday.length > 0 && (
                <Card className="border-emerald-500/30 bg-emerald-500/5 p-4">
                    <h3 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} /> Currently On Shift ({clockedInToday.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {clockedInToday.map(uid => {
                            const staff = users.find(u => u.userId === uid);
                            const record = attendance.find(a => a.userId === uid && !a.clockOut);
                            return (
                                <div
                                    key={uid}
                                    className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-emerald-500/30 rounded-xl px-3 py-2"
                                >
                                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-sm">
                                        {staff?.name.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                                            {staff?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Since {formatTime(record?.clockIn)}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="ml-2 h-7 text-xs text-rose-500 border-rose-300 hover:bg-rose-50"
                                        onClick={() => handleClockOut(uid)}
                                        disabled={isLoading}
                                    >
                                        <LogOut size={12} className="mr-1" /> Out
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search by staff name or date..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => {
                            setDateFilter(e.target.value);
                            setShowAllDates(false);
                        }}
                        className="px-3 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                        disabled={showAllDates}
                    />
                    <Button
                        variant={showAllDates ? 'primary' : 'secondary'}
                        onClick={() => setShowAllDates(!showAllDates)}
                    >
                        <Filter size={18} className="mr-2" />
                        {showAllDates ? 'Filtered' : 'All Records'}
                    </Button>
                </div>
            </div>

            {/* Attendance Table */}
            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[var(--bg-elevated)]">
                            <tr>
                                {[
                                    'Date',
                                    'Staff Member',
                                    'Status',
                                    'Clock In',
                                    'Clock Out',
                                    'Hours',
                                    'Action',
                                ].map(col => (
                                    <th
                                        key={col}
                                        className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredAttendance.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-[var(--text-secondary)]"
                                    >
                                        <Clock size={32} className="mx-auto mb-2 opacity-30" />
                                        <p>No attendance records found</p>
                                        <Button
                                            size="sm"
                                            className="mt-3 bg-emerald-600"
                                            onClick={() => setIsClockInModalOpen(true)}
                                        >
                                            <LogIn size={14} className="mr-1" /> Clock In First
                                            Staff
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map(entry => (
                                    <tr
                                        key={entry.attendanceId}
                                        className="hover:bg-[var(--bg-elevated)] transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            {formatDate(entry.date)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <UserIcon size={16} />
                                                </div>
                                                <span className="font-medium text-[var(--text-primary)]">
                                                    {entry.userName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge color={getStatusColor(entry.status) as any}>
                                                {entry.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono">
                                            {formatTime(entry.clockIn)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono">
                                            {entry.clockOut ? (
                                                formatTime(entry.clockOut)
                                            ) : (
                                                <span className="text-emerald-500 font-semibold text-xs animate-pulse">
                                                    ● ON DUTY
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[var(--text-primary)]">
                                                    {entry.totalHours > 0
                                                        ? `${entry.totalHours.toFixed(1)}h`
                                                        : '—'}
                                                </span>
                                                {entry.overtimeHours > 0 && (
                                                    <span className="text-xs text-amber-500">
                                                        +{entry.overtimeHours.toFixed(1)} OT
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!entry.clockOut && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-8 text-xs text-rose-500 border-rose-300"
                                                    onClick={() => handleClockOut(entry.userId)}
                                                    disabled={isLoading}
                                                >
                                                    <LogOut size={12} className="mr-1" />
                                                    Clock Out
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Clock-In Modal */}
            {isClockInModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <div className="p-6 border-b flex items-center justify-between bg-[var(--bg-elevated)]">
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    Clock In Staff
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Record shift start for a staff member
                                </p>
                            </div>
                            <button
                                onClick={() => setIsClockInModalOpen(false)}
                                className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Select Staff Member *
                                </label>
                                <select
                                    className="w-full p-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    value={selectedStaffId}
                                    onChange={e => setSelectedStaffId(e.target.value)}
                                >
                                    <option value="">-- Choose Staff Member --</option>
                                    {activeStaff
                                        .filter(s => !clockedInToday.includes(s.userId))
                                        .map(s => (
                                            <option key={s.userId} value={s.userId}>
                                                {s.name} — {s.role.replace('_', ' ')}
                                            </option>
                                        ))}
                                </select>
                                {clockedInToday.length === activeStaff.length &&
                                    activeStaff.length > 0 && (
                                        <p className="text-xs text-emerald-600 mt-1">
                                            ✓ All active staff are already clocked in today
                                        </p>
                                    )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Attendance Status
                                </label>
                                <select
                                    className="w-full p-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    value={statusOverride}
                                    onChange={e =>
                                        setStatusOverride(e.target.value as 'PRESENT' | 'LATE')
                                    }
                                >
                                    <option value="PRESENT">On Time (Present)</option>
                                    <option value="LATE">Late</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={manualDate}
                                    onChange={e => setManualDate(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-[var(--text-secondary)]">
                                <Clock size={14} className="inline mr-1 text-emerald-500" />
                                Clock-in time will be recorded as:{' '}
                                <strong className="text-[var(--text-primary)]">
                                    {format(new Date(), 'hh:mm a')}
                                </strong>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-[var(--bg-elevated)] flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setIsClockInModalOpen(false);
                                    setSelectedStaffId('');
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                onClick={handleClockIn}
                                disabled={isLoading || !selectedStaffId}
                            >
                                {isLoading ? (
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                ) : (
                                    <LogIn size={16} className="mr-2" />
                                )}
                                {isLoading ? 'Recording...' : 'Clock In'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
