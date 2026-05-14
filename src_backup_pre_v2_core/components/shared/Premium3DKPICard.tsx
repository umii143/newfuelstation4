import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Premium3DKPICardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    trend?: {
        value: number;
        label: string;
    };
    delay?: number;
}

export function Premium3DKPICard({
    label,
    value,
    icon: Icon,
    gradient,
    trend,
    delay = 0,
}: Premium3DKPICardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue =
        typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0 : value;

    // Animated counter effect
    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const duration = 1500; // 1.5 seconds

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutCubic)
            const eased = 1 - Math.pow(1 - progress, 3);

            setDisplayValue(numericValue * eased);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [numericValue]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 },
            }}
            className="group relative"
        >
            {/* Outer glow effect */}
            <div
                className={`absolute -inset-1 bg-gradient-to-br ${gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}
                style={{
                    filter: 'blur(20px)',
                }}
            />

            {/* Main card with 3D depth */}
            <div
                className="relative bg-white/80 backdrop-blur-3xl rounded-3xl p-6 lg:p-8 border-2 border-white/60 overflow-hidden transition-all duration-500 group-hover:border-white/80"
                style={{
                    boxShadow: `
            0 10px 30px rgba(0,0,0,0.08), 
            0 1px 8px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,0,0.05)
          `,
                }}
            >
                {/* Animated gradient orb background */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full blur-3xl`}
                />

                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                    <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                </div>

                {/* Content layer */}
                <div className="relative z-10">
                    {/* Icon with 3D effect */}
                    <div
                        className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br ${gradient} mb-4 
            shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                        style={{
                            boxShadow:
                                '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
                        }}
                    >
                        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-lg" />
                    </div>

                    {/* Label */}
                    <h3 className="text-xs lg:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                        {label}
                    </h3>

                    {/* Value with animated counter */}
                    <motion.p
                        className="text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-3 leading-none"
                        style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        }}
                    >
                        {typeof value === 'string' && value.includes('Rs') ? (
                            <>
                                <span className="text-lg lg:text-xl text-gray-700 mr-1">Rs</span>
                                {Math.round(displayValue).toLocaleString()}
                            </>
                        ) : typeof value === 'string' ? (
                            value
                        ) : (
                            Math.round(displayValue).toLocaleString()
                        )}
                    </motion.p>

                    {/* Trend indicator */}
                    {trend && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: delay + 0.3 }}
                            className="flex items-center gap-2"
                        >
                            <div
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${
                                    trend.value >= 0
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-rose-100 text-rose-700'
                                }`}
                            >
                                <span className="text-xs font-bold">
                                    {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                                </span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{trend.label}</span>
                        </motion.div>
                    )}
                </div>

                {/* Bottom gradient accent */}
                <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60`}
                />
            </div>
        </motion.div>
    );
}
