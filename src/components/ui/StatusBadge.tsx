import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    icon?: LucideIcon;
    className?: string;
    pulse?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
    success: 'bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 bloomberg:bg-transparent bloomberg:text-[#00FF41] bloomberg:border-[#00FF41]',
    warning: 'bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 bloomberg:bg-transparent bloomberg:text-[#F5A623] bloomberg:border-[#F5A623]',
    danger: 'bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 bloomberg:bg-transparent bloomberg:text-[#FF4444] bloomberg:border-[#FF4444]',
    info: 'bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 bloomberg:bg-transparent bloomberg:text-[#00D4FF] bloomberg:border-[#00D4FF]',
    neutral: 'bg-slate-100/80 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 bloomberg:bg-[#111111] bloomberg:text-[#888] bloomberg:border-[#2A2A2A]'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'neutral',
    icon: Icon,
    className,
    pulse = false
}) => {
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-widest',
            variantStyles[variant],
            className
        )}>
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        variant === 'success' ? 'bg-emerald-400' :
                        variant === 'warning' ? 'bg-amber-400' :
                        variant === 'danger' ? 'bg-rose-400' :
                        variant === 'info' ? 'bg-blue-400' : 'bg-slate-400'
                    )}></span>
                    <span className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        variant === 'success' ? 'bg-emerald-500' :
                        variant === 'warning' ? 'bg-amber-500' :
                        variant === 'danger' ? 'bg-rose-500' :
                        variant === 'info' ? 'bg-blue-500' : 'bg-slate-500'
                    )}></span>
                </span>
            )}
            {Icon && <Icon size={12} strokeWidth={3} />}
            {status}
        </span>
    );
};
