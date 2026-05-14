import { Badge, Card, PageHeader } from '@/components/ui';
import { useStaffStore } from '@/stores/dataStores';
import {
    Award,
    ChevronRight,
    Search,
    TrendingDown,
    TrendingUp,
    User as UserIcon,
} from 'lucide-react';
import React, { useState } from 'react';

export const PerformancePage: React.FC = () => {
    const { getActiveStaff } = useStaffStore();
    const users = getActiveStaff();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(
        u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (value: number) => `₨${value.toLocaleString()}`;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Performance"
                subtitle="Analyze sales targets, variance accuracy, and rankings"
            />

            {/* Rankings Top 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {users
                    .filter(u => u.performance?.rank && u.performance.rank <= 3)
                    .sort((a, b) => (a.performance?.rank || 0) - (b.performance?.rank || 0))
                    .map((user, idx) => (
                        <Card
                            key={user.userId}
                            className={`relative overflow-hidden ${
                                idx === 0
                                    ? 'border-amber-500/50 bg-amber-500/5 shadow-amber-500/10'
                                    : idx === 1
                                      ? 'border-slate-400/50 bg-slate-400/5'
                                      : 'border-orange-500/50 bg-orange-500/5'
                            } border-2`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                                        idx === 0
                                            ? 'bg-amber-500 text-white'
                                            : idx === 1
                                              ? 'bg-slate-400 text-white'
                                              : 'bg-orange-600 text-white'
                                    }`}
                                >
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)]">
                                        {user.name}
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        {user.role}
                                    </p>
                                </div>
                                <Award
                                    className={`ml-auto w-8 h-8 ${
                                        idx === 0
                                            ? 'text-amber-500'
                                            : idx === 1
                                              ? 'text-slate-400'
                                              : 'text-orange-500'
                                    }`}
                                />
                            </div>
                            <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase">
                                        Total Sales
                                    </p>
                                    <p className="font-bold text-sm">
                                        {formatCurrency(user.performance?.totalSales || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase">
                                        Accuracy
                                    </p>
                                    <p className="font-bold text-sm text-emerald-500">
                                        {(100 - (user.performance?.avgVariance || 0) * 100).toFixed(
                                            2
                                        )}
                                        %
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
            </div>

            {/* Performance List */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search staff by name or role..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid gap-3">
                    {filteredUsers.map(user => (
                        <div
                            key={user.userId}
                            className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--text-primary)]">
                                        {user.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge color="gray">{user.role}</Badge>
                                        <span className="text-xs text-[var(--text-secondary)]">
                                            Member since {new Date(user.createdAt).getFullYear()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="hidden sm:block text-right">
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase">
                                        Relative Performance
                                    </p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{
                                                    width: `${Math.max(
                                                        0,
                                                        Math.min(
                                                            100,
                                                            (() => {
                                                                const maxSales = Math.max(
                                                                    ...filteredUsers.map(
                                                                        u =>
                                                                            u.performance
                                                                                ?.totalSales || 0
                                                                    ),
                                                                    1
                                                                );
                                                                return (
                                                                    ((user.performance
                                                                        ?.totalSales || 0) /
                                                                        maxSales) *
                                                                    100
                                                                );
                                                            })()
                                                        )
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-500">
                                            {(() => {
                                                const maxSales = Math.max(
                                                    ...filteredUsers.map(
                                                        u => u.performance?.totalSales || 0
                                                    ),
                                                    1
                                                );
                                                return (
                                                    ((user.performance?.totalSales || 0) /
                                                        maxSales) *
                                                    10
                                                ).toFixed(1);
                                            })()}
                                            /10
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right w-24">
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase">
                                        Avg. Variance
                                    </p>
                                    <div
                                        className={`flex items-center gap-1 justify-end font-semibold ${
                                            (user.performance?.avgVariance || 0) < 0.005
                                                ? 'text-emerald-500'
                                                : 'text-rose-500'
                                        }`}
                                    >
                                        {(user.performance?.avgVariance || 0) < 0.005 ? (
                                            <TrendingUp size={14} />
                                        ) : (
                                            <TrendingDown size={14} />
                                        )}
                                        {(user.performance?.avgVariance || 0 * 100).toFixed(2)}%
                                    </div>
                                </div>
                                <ChevronRight className="text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
