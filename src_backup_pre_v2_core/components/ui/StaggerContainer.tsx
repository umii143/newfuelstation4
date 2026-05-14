import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    },
};

export const StaggerContainer: React.FC<HTMLMotionProps<"div"> & { children: React.ReactNode }> = ({ children, className, ...props }) => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const StaggerItem: React.FC<HTMLMotionProps<"div"> & { children: React.ReactNode }> = ({ children, className, ...props }) => {
    return (
        <motion.div
            variants={itemVariants}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};
