import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    strong?: boolean;
    bloombergNoBorder?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, hover = false, strong = false, bloombergNoBorder = false, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
                className={cn(
                    strong ? 'glass-strong' : 'glass-card',
                    hover && 'hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300',
                    bloombergNoBorder && 'bloomberg:border-transparent',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
