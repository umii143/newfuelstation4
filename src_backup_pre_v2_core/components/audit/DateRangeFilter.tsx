
import { Calendar } from 'lucide-react';
import React, { useState } from 'react';

export type DatePreset =
    | 'TODAY'
    | 'YESTERDAY'
    | 'LAST_7_DAYS'
    | 'LAST_30_DAYS'
    | 'THIS_MONTH'
    | 'LAST_MONTH'
    | 'THIS_YEAR'
    | 'LAST_YEAR'
    | 'CUSTOM';

export interface DateRange {
    startDate: string;
    endDate: string;
    preset: DatePreset;
}

interface DateRangeFilterProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

const getDateRangeForPreset = (preset: DatePreset): { startDate: string; endDate: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case 'TODAY':
            return {
                startDate: today.toISOString(),
                endDate: new Date(today.getTime() + 86400000).toISOString(),
            };
        case 'YESTERDAY':
            const yesterday = new Date(today.getTime() - 86400000);
            return {
                startDate: yesterday.toISOString(),
                endDate: today.toISOString(),
            };
        case 'LAST_7_DAYS':
            return {
                startDate: new Date(today.getTime() - 7 * 86400000).toISOString(),
                endDate: now.toISOString(),
            };
        case 'LAST_30_DAYS':
            return {
                startDate: new Date(today.getTime() - 30 * 86400000).toISOString(),
                endDate: now.toISOString(),
            };
        case 'THIS_MONTH':
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
                endDate: now.toISOString(),
            };
        case 'LAST_MONTH':
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            return {
                startDate: lastMonthStart.toISOString(),
                endDate: lastMonthEnd.toISOString(),
            };
        case 'THIS_YEAR':
            return {
                startDate: new Date(now.getFullYear(), 0, 1).toISOString(),
                endDate: now.toISOString(),
            };
        case 'LAST_YEAR':
            return {
                startDate: new Date(now.getFullYear() - 1, 0, 1).toISOString(),
                endDate: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59).toISOString(),
            };
        case 'CUSTOM':
            return { startDate: '', endDate: '' };
    }
};

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    const presets: { label: string; value: DatePreset }[] = [
        { label: 'Today', value: 'TODAY' },
        { label: 'Yesterday', value: 'YESTERDAY' },
        { label: 'Last 7 Days', value: 'LAST_7_DAYS' },
        { label: 'Last 30 Days', value: 'LAST_30_DAYS' },
        { label: 'This Month', value: 'THIS_MONTH' },
        { label: 'Last Month', value: 'LAST_MONTH' },
        { label: 'This Year', value: 'THIS_YEAR' },
        { label: 'Last Year', value: 'LAST_YEAR' },
        { label: 'Custom', value: 'CUSTOM' },
    ];

    const handlePresetClick = (preset: DatePreset) => {
        if (preset === 'CUSTOM') {
            setShowCustomPicker(true);
            return;
        }

        const { startDate, endDate } = getDateRangeForPreset(preset);
        onChange({ startDate, endDate, preset });
        setShowCustomPicker(false);
    };

    const handleCustomDateChange = (start: string, end: string) => {
        onChange({
            startDate: new Date(start).toISOString(),
            endDate: new Date(end).toISOString(),
            preset: 'CUSTOM',
        });
    };

    const formatDisplayDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-4">
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                    <button
                        key={preset.value}
                        onClick={() => handlePresetClick(preset.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            value.preset === preset.value
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border)]'
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Custom Date Picker */}
            {showCustomPicker && (
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <h4 className="font-bold text-[var(--text-primary)]">Custom Date Range</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                defaultValue={
                                    value.startDate
                                        ? new Date(value.startDate).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={e => {
                                    if (value.endDate) {
                                        handleCustomDateChange(e.target.value, value.endDate);
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                defaultValue={
                                    value.endDate
                                        ? new Date(value.endDate).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={e => {
                                    if (value.startDate) {
                                        handleCustomDateChange(value.startDate, e.target.value);
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Range Display */}
            {value.startDate && value.endDate && (
                <div className="text-sm text-[var(--text-secondary)]">
                    <span className="font-medium">Selected Range: </span>
                    <span className="font-bold text-[var(--text-primary)]">
                        {formatDisplayDate(value.startDate)} - {formatDisplayDate(value.endDate)}
                    </span>
                </div>
            )}
        </div>
    );
};
