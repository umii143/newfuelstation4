import React from 'react';
import { motion } from 'framer-motion';

interface LiquidTankProps {
    percentage: number;
    color: 'emerald' | 'amber' | 'blue' | 'rose';
    label: string;
    currentLevel: number;
    capacity: number;
    isFlowing?: boolean;
    flowDirection?: 'in' | 'out';
}

export const LiquidTank: React.FC<LiquidTankProps> = ({ 
    percentage, 
    color, 
    label, 
    currentLevel, 
    capacity,
    isFlowing = false,
    flowDirection = 'in'
}) => {
    // colors: [glow/bright, primary/liquid, deep/bottom]
    const colors = {
        emerald: ['#34d399', '#10b981', '#064e3b'],
        amber: ['#fbbf24', '#f59e0b', '#78350f'],
        blue: ['#60a5fa', '#3b82f6', '#1e3a8a'],
        rose: ['#fb7185', '#f43f5e', '#881337'],
    };

    const activeColor = colors[color] || colors.blue;

    return (
        <div className="relative w-full h-72 bg-[#0a0f18] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl group transition-all duration-500 hover:border-white/10">
            {/* High-end glass reflections */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none z-30" />
            
            {/* Liquid Flow Stream (from top) */}
            {isFlowing && flowDirection === 'in' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full z-20 pointer-events-none">
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '100%', opacity: 1 }}
                        className="w-full bg-gradient-to-b from-white/20 via-white/10 to-transparent blur-sm"
                        style={{ backgroundColor: activeColor[0] }}
                    />
                    <motion.div 
                        animate={{ y: [0, 200], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-20 rounded-full"
                        style={{ backgroundColor: 'white' }}
                    />
                </div>
            )}

            {/* Metric Ruler */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-white/5 z-20">
                {[...Array(11)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`absolute left-0 w-2 h-px bg-white/20 transition-all duration-700`}
                        style={{ bottom: `${i * 10}%`, opacity: i * 10 <= percentage ? 0.8 : 0.2 }}
                    >
                        {i % 5 === 0 && (
                            <span className="absolute left-4 -translate-y-1/2 text-[8px] font-black text-white/30 uppercase tracking-tighter">
                                {i * 10}%
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Liquid Area */}
            <div className="absolute inset-0">
                {/* Dynamic Height Container */}
                <motion.div 
                    className="absolute bottom-0 left-0 right-0 z-10"
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        background: `linear-gradient(to top, ${activeColor[2]} 0%, ${activeColor[1]} 100%)`,
                        boxShadow: `inset 0 10px 40px rgba(0,0,0,0.3), 0 0 60px ${activeColor[1]}20`,
                    }}
                >
                    {/* Animated Wave 1 - Fast */}
                    <svg
                        className="absolute top-0 left-0 w-[400%] h-16 -translate-y-[85%] fill-current z-20 pointer-events-none"
                        style={{ color: activeColor[1] }}
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            d="M0,10Q12.5,18,25,10T50,10T75,10T100,10V20H0Z"
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        />
                    </svg>

                    {/* Animated Wave 2 - Slow / Depth */}
                    <svg
                        className="absolute top-0 left-0 w-[400%] h-20 -translate-y-[90%] fill-current z-10 opacity-30 pointer-events-none"
                        style={{ color: activeColor[0] }}
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            d="M0,10Q12.5,2,25,10T50,10T75,10T100,10V20H0Z"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
                        />
                    </svg>

                    {/* Surface Glow */}
                    <div 
                        className="absolute top-0 left-0 right-0 h-4 -translate-y-1/2 z-25 blur-md"
                        style={{ background: `linear-gradient(to bottom, transparent, ${activeColor[0]}40, transparent)` }}
                    />

                    {/* Bubbles / Particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white/30"
                            style={{
                                width: Math.random() * 4 + 1,
                                height: Math.random() * 4 + 1,
                                left: `${Math.random() * 100}%`,
                                bottom: -10,
                            }}
                            animate={{
                                bottom: ["0%", "100%"],
                                opacity: [0, 0.6, 0],
                                scale: [1, 1.5, 0.5],
                                x: [0, (Math.random() - 0.5) * 60],
                            }}
                            transition={{
                                duration: Math.random() * 4 + 3,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Info Overlay */}
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-between py-10 px-6">
                <div className="text-center">
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2"
                    >
                        {label}
                    </motion.p>
                    <div className="h-0.5 w-8 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                <div className="flex flex-col items-center gap-1">
                    <motion.h3 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-black text-white tabular-nums tracking-tighter filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    >
                        {percentage.toFixed(0)}<span className="text-xl text-white/40 ml-1">%</span>
                    </motion.h3>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColor[0] }} />
                        <span className="text-[11px] font-black text-white/80 tabular-nums">
                            {currentLevel.toLocaleString()} / {capacity.toLocaleString()} L
                        </span>
                    </div>
                </div>

                <div className="w-full max-w-[120px]">
                    <div className="flex justify-between text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">
                        <span>Safe</span>
                        <span className={percentage < 20 ? 'text-rose-500 animate-pulse' : ''}>
                            {percentage < 20 ? 'Critical' : 'Stable'}
                        </span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: activeColor[1] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 3, delay: 0.5 }}
                        />
                    </div>
                </div>
            </div>
            
            {/* Subtle pulse for critical level */}
            {percentage < 20 && (
                <motion.div 
                    className="absolute inset-0 border-2 border-rose-500/30 rounded-[2rem] z-50 pointer-events-none"
                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </div>
    );
};
