import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'rect' | 'circle' | 'text';
    animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    width,
    height,
    variant = 'rect',
    animate = true,
}) => {
    return (
        <motion.div
            initial={animate ? { opacity: 0.4 } : false}
            animate={animate ? {
                opacity: [0.4, 0.7, 0.4],
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            } : false}
            transition={animate ? {
                opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
            } : undefined}
            style={{
                width,
                height,
                backgroundSize: '200% 100%',
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
            className={clsx(
                'bg-slate-200/20 dark:bg-white/5 relative overflow-hidden',
                variant === 'circle' ? 'rounded-full' : 'rounded-lg',
                className
            )}
        >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </motion.div>
    );
};

export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
    <div className={clsx("space-y-2 w-full", className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
                key={i} 
                variant="text" 
                height="1em" 
                width={i === lines - 1 && lines > 1 ? '60%' : '100%'} 
            />
        ))}
    </div>
);
