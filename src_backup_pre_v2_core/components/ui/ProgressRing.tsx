import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
    className?: string;
    showLabel?: boolean;
}

const strokeColors = {
    blue: 'stroke-blue-500 dark:stroke-blue-400 bloomberg:stroke-[#00D4FF]',
    emerald: 'stroke-emerald-500 dark:stroke-emerald-400 bloomberg:stroke-[#00FF41]',
    amber: 'stroke-amber-500 dark:stroke-amber-400 bloomberg:stroke-[#F5A623]',
    rose: 'stroke-rose-500 dark:stroke-rose-400 bloomberg:stroke-[#FF4444]',
    purple: 'stroke-purple-500 dark:stroke-purple-400 bloomberg:stroke-[#B142FF]',
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = 'blue',
    className,
    showLabel = true
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const safeProgress = Math.min(100, Math.max(0, progress));
    const offset = circumference - (safeProgress / 100) * circumference;

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    className="stroke-slate-200 dark:stroke-slate-800 bloomberg:stroke-[#111111] transition-colors"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                
                {/* Progress Ring */}
                <motion.circle
                    className={cn(strokeColors[color], "transition-colors")}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.1 }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>
            
            {showLabel && (
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-data font-black text-slate-800 dark:text-white bloomberg:text-white tracking-tighter">
                        {Math.round(safeProgress)}%
                    </span>
                </div>
            )}
        </div>
    );
};
