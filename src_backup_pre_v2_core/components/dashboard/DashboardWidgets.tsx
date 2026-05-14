import { useCNGStore } from '@/stores/cngStore';
import { useFuelStore } from '@/stores/fuelStore';
import { useCustomerLedgerStore } from '@/stores/ledgerStore';
import { motion } from 'framer-motion';
import { Activity, Clock, Package, TrendingUp, Users, Zap } from 'lucide-react';

export function QuickActions() {
    const actions = [
        {
            icon: Zap,
            label: 'Start Shift',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
        },
        {
            icon: TrendingUp,
            label: 'View Reports',
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'from-emerald-50 to-emerald-100',
        },
        {
            icon: Users,
            label: 'Manage Staff',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100',
        },
        {
            icon: Package,
            label: 'Inventory',
            color: 'from-amber-500 to-amber-600',
            bgColor: 'from-amber-50 to-amber-100',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${action.bgColor} border-2 border-white/60 hover:border-white/80 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                    <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 shadow-md`}
                    >
                        <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{action.label}</p>
                </motion.button>
            ))}
        </div>
    );
}

export function ActivityFeed() {
    const fuelShifts = useFuelStore(state => state.shifts);
    const cngShifts = useCNGStore(state => state.shifts);
    const customerLedger = useCustomerLedgerStore(state => state.entries);

    const shiftActivities = [...fuelShifts, ...cngShifts]
        .filter(s => s.status === 'CLOSED')
        .map(s => ({
            type: 'shift',
            message: `${s.businessUnit} Shift Closed: Rs ${s.totalRevenue.toLocaleString()}`,
            time: new Date(s.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            timestamp: new Date(s.createdAt).getTime(),
            color: s.businessUnit === 'FUEL' ? 'blue' : 'emerald',
        }));

    const salesActivities = customerLedger
        .filter(e => e.type === 'CREDIT_SALE' || e.type === 'RECOVERY')
        .map(e => ({
            type: 'sale',
            message: `${e.type === 'RECOVERY' ? 'Recovery' : 'Credit Sale'}: Rs ${(e.debit || e.credit).toLocaleString()}`,
            time: new Date(e.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            timestamp: new Date(e.timestamp).getTime(),
            color: e.type === 'RECOVERY' ? 'emerald' : 'amber',
        }));

    const activities = [...shiftActivities, ...salesActivities]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

    if (activities.length === 0) {
        activities.push({
            type: 'alert',
            message: 'No recent activity recorded',
            time: 'Just now',
            timestamp: Date.now(),
            color: 'amber',
        });
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'sale':
                return TrendingUp;
            case 'shift':
                return Clock;
            case 'alert':
                return Package;
            default:
                return Activity;
        }
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; icon: string }> = {
            emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-600' },
            amber: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'text-amber-600' },
            purple: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-600' },
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-3">
            {activities.map((activity, index) => {
                const Icon = getIcon(activity.type);
                const colors = getColorClasses(activity.color);

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/60 to-white/40 border border-white/50 hover:border-blue-300/50 transition-all"
                    >
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                            <Icon className={`w-4 h-4 ${colors.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {activity.message}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export function PerformanceMetrics() {
    const metrics = [
        { label: 'Daily Target', value: '85%', trend: 'up', color: 'emerald' },
        { label: 'Efficiency', value: '92%', trend: 'up', color: 'blue' },
        { label: 'Variance', value: '-2.5%', trend: 'down', color: 'rose' },
    ];

    return (
        <div className="space-y-4">
            {metrics.map((metric, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-white/60 to-white/40 border border-white/50"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {metric.label}
                        </span>
                        <span
                            className={`text-xs font-bold ${
                                metric.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                        >
                            {metric.trend === 'up' ? '↑' : '↓'}
                        </span>
                    </div>
                    <p
                        className={`text-2xl font-black ${
                            metric.color === 'emerald'
                                ? 'text-emerald-600'
                                : metric.color === 'blue'
                                  ? 'text-blue-600'
                                  : 'text-rose-600'
                        }`}
                    >
                        {metric.value}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
