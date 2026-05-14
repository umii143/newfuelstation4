import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    format?: 'number' | 'currency' | 'percent';
    className?: string;
    prefix?: string;
    suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    format = 'number',
    className,
    prefix = '',
    suffix = ''
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 40,
        stiffness: 200,
        mass: 1
    });
    const isInView = useInView(ref, { once: true, margin: "-20px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        const formatValue = (v: number) => {
            if (format === 'currency') return `Rs ${Math.round(v).toLocaleString()}`;
            if (format === 'percent') return `${v.toFixed(1)}%`;
            return Math.round(v).toLocaleString();
        };

        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${formatValue(latest)}${suffix}`;
            }
        });
    }, [springValue, format, prefix, suffix]);

    return (
        <span 
            ref={ref} 
            className={className}
            key={value} // Force color flash on change via CSS
            style={{ animation: 'counterTick 0.3s ease-in-out' }}
        >
            {/* Initial render fallback */}
            {prefix}{value === 0 ? '0' : ''}{suffix}
        </span>
    );
};
