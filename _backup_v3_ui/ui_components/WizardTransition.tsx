import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

// Define the direction type for our slide animation
export type SlideDirection = 'forward' | 'backward';

interface WizardTransitionProps {
    children: React.ReactNode;
    step: number;
    direction: SlideDirection;
    className?: string;
}

export const WizardTransition: React.FC<WizardTransitionProps> = ({
    children,
    step,
    direction,
    className = '',
}) => {
    // Variants control the animation states based on the direction
    const variants = {
        enter: (dir: SlideDirection) => ({
            x: dir === 'forward' ? 50 : -50,
            opacity: 0,
            filter: 'blur(8px)',
        }),
        center: {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24,
                duration: 0.3,
            },
        },
        exit: (dir: SlideDirection) => ({
            x: dir === 'forward' ? -50 : 50,
            opacity: 0,
            filter: 'blur(8px)',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24,
                duration: 0.3,
            },
        }),
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
