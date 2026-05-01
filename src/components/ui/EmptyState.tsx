import { motion } from 'framer-motion';
import React from 'react';
import { Card } from '../ui';
import clsx from 'clsx';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={clsx('w-full', className)}
        >
            <Card className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden relative group">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                </div>

                {/* Icon Container */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-3xl border border-blue-500/20 animate-pulse" />
                        <div className="text-blue-500 dark:text-blue-400">
                            {React.cloneElement(icon as React.ReactElement, { size: 48, strokeWidth: 1.5 })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative max-w-sm mx-auto">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                        {description}
                    </p>

                    {actionLabel && onAction && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onAction}
                            className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                        >
                            {actionLabel}
                        </motion.button>
                    )}
                </div>
            </Card>
        </motion.div>
    );
};
