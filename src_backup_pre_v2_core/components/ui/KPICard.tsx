import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number;
    format?: 'number' | 'currency' | 'percent';
    icon: LucideIcon;
    trend?: number; // percentage e.g. 5.2 or -2.1
    trendLabel?: string;
    className?: string;
    color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
    prefix?: string;
    suffix?: string;
}

const colorMap = {
    blue: 'from-blue-500 to-cyan-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 bloomberg:text-[#00D4FF]',
    emerald: 'from-emerald-500 to-teal-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 bloomberg:text-[#00FF41]',
    amber: 'from-amber-500 to-orange-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 bloomberg:text-[#F5A623]',
    rose: 'from-rose-500 to-pink-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 bloomberg:text-[#FF4444]',
    purple: 'from-purple-500 to-indigo-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 bloomberg:text-[#B142FF]',
};

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    format = 'number',
    icon: Icon,
    trend,
    trendLabel,
    className,
    color = 'blue',
    prefix,
    suffix
}) => {
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;

    return (
        <GlassCard hover className={cn('p-5 flex flex-col justify-between overflow-hidden relative group', className)}>
            {/* Top right decorative gradient blob */}
            <div className={cn(
                'absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 dark:opacity-20 blur-2xl group-hover:opacity-20 transition-opacity bloomberg:hidden',
                `bg-gradient-to-br ${colorMap[color].split(' ')[0]}`
            )} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 bloomberg:text-[#888] tracking-tight">
                    {title}
                </p>
                <div className={cn(
                    'p-2 rounded-xl flex items-center justify-center transition-colors',
                    colorMap[color].split(' ').slice(1).join(' '),
                    'bloomberg:bg-transparent bloomberg:p-0'
                )}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-1">
                <div className={cn(
                    "text-3xl font-data font-black tracking-tighter text-slate-900 dark:text-white bloomberg:text-white",
                    // Apply subtle glow in dark mode
                    "dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                )}>
                    <AnimatedCounter value={value} format={format} prefix={prefix} suffix={suffix} />
                </div>

                {trend !== undefined && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn(
                            "flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md border",
                            isPositive && "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 bloomberg:bg-transparent bloomberg:border-transparent bloomberg:text-[#00FF41] bloomberg:p-0",
                            isNegative && "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 bloomberg:bg-transparent bloomberg:border-transparent bloomberg:text-[#FF4444] bloomberg:p-0",
                            !isPositive && !isNegative && "text-slate-500 bg-slate-50 border-slate-200 bloomberg:text-[#888] bloomberg:border-transparent bloomberg:bg-transparent"
                        )}>
                            {isPositive ? <TrendingUp size={12} strokeWidth={3} /> : isNegative ? <TrendingDown size={12} strokeWidth={3} /> : null}
                            {Math.abs(trend)}%
                        </span>
                        {trendLabel && (
                            <span className="text-xs font-medium text-slate-400 bloomberg:text-[#666] truncate">
                                {trendLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
