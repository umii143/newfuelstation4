/**
 * ⚡ DASHBOARD KIT V9 — "PURE MAGIC & POWER" EDITION
 * Hyper-Advanced Cinematic UI Sandbox
 * Features: 3D Liquid Simulation, Magnetic Hover, Particle Traces, Glassmorphism 3.0
 */
import clsx from 'clsx';
import { motion, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

/* ─── Elite Spring Configs ───────────────────────────────────── */
export const SP_BOUNCE = { type: 'spring', stiffness: 400, damping: 25 };
export const SP_SMOOTH = { type: 'spring', stiffness: 200, damping: 30 };
export const ST_GRID = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
export const FU_SLIDE = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: SP_BOUNCE },
};

/* ─── Ultra-Premium Color Tokens ─────────────────────────────── */
export type Hue = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan' | 'slate';
export const C: Record<Hue, { g1: string; g2: string; glow: string; text: string; bg: string }> = {
    emerald: {
        g1: '#10B981',
        g2: '#047857',
        glow: 'rgba(16,185,129,0.5)',
        text: '#059669',
        bg: 'rgba(16,185,129,0.1)',
    },
    blue: {
        g1: '#3B82F6',
        g2: '#1D4ED8',
        glow: 'rgba(59,130,246,0.5)',
        text: '#2563EB',
        bg: 'rgba(59,130,246,0.1)',
    },
    purple: {
        g1: '#8B5CF6',
        g2: '#6D28D9',
        glow: 'rgba(139,92,246,0.5)',
        text: '#7C3AED',
        bg: 'rgba(139,92,246,0.1)',
    },
    amber: {
        g1: '#F59E0B',
        g2: '#B45309',
        glow: 'rgba(245,158,11,0.5)',
        text: '#D97706',
        bg: 'rgba(245,158,11,0.1)',
    },
    rose: {
        g1: '#F43F5E',
        g2: '#BE123C',
        glow: 'rgba(244,63,94,0.5)',
        text: '#E11D48',
        bg: 'rgba(244,63,94,0.1)',
    },
    cyan: {
        g1: '#06B6D4',
        g2: '#0E7490',
        glow: 'rgba(6,182,212,0.5)',
        text: '#0891B2',
        bg: 'rgba(6,182,212,0.1)',
    },
    slate: {
        g1: '#64748B',
        g2: '#334155',
        glow: 'rgba(100,116,139,0.5)',
        text: '#475569',
        bg: 'rgba(100,116,139,0.1)',
    },
};

/* ─── RAF Number Counter with easing ─────────────────────────── */
export function useCounter(target: number, durationMS = 2500) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const raf = requestAnimationFrame(function tick(now) {
            if (!start) start = now;
            const p = Math.min(1, (now - start) / durationMS);
            // easeOutExpo
            const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            setCount(Math.round(target * ease));
            if (p < 1) requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(raf);
    }, [target, durationMS]);
    return count;
}

export const fmt = (n: number) => n.toLocaleString('en-US');

/* ══ 1. MAGNETIC GLASSCARD ══
 * 3D tilt effect mapped to mouse position with dynamic glare
 ***************************************************************/
export const MagneticCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    hue?: Hue;
}> = ({ children, className,  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useTransform(x, [-0.5, 0.5], [10, -10]);
    const mouseYSpring = useTransform(y, [-0.5, 0.5], [-10, 10]);

    // Dynamic glare radial gradient
    const glareX = useTransform(x, [-0.5, 0.5], [100, 0]);
    const glareY = useTransform(y, [-0.5, 0.5], [100, 0]);
    const background = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            variants={FU_SLIDE}
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX: mouseYSpring, rotateY: mouseXSpring, transformPerspective: 1200 }}
            className={clsx(
                'relative rounded-[2rem] p-[1px] overflow-hidden group transition-shadow duration-500 will-change-transform z-10',
                className
            )}
        >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/10 to-white/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Inner Content Glass */}
            <div className="relative h-full w-full rounded-[2rem] bg-white/40 backdrop-blur-3xl p-6 lg:p-8 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-white/60">
                {/* Magnetic Glare */}
                <motion.div
                    className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300"
                    style={{ background }}
                />

                {/* Content */}
                <div className="relative z-10 h-full">{children}</div>
            </div>
        </motion.div>
    );
};

/* ══ 2. HOLOGRAPHIC KPI CARD ══
 * Glow sweeps, animated number counter, bouncing trend
 ***************************************************************/
export const HoloKPI: React.FC<{
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    trend: string;
    hue: Hue;
    icon: React.ReactNode;
}> = ({ title, value, prefix = '', suffix = '', trend, hue, icon }) => {
    const c = C[hue];
    const animatedVal = useCounter(value);

    return (
        <MagneticCard className="h-full">
            {/* Ambient Base Glow */}
            <div
                className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
                style={{ background: c.g1 }}
            />

            <div className="flex justify-between items-start mb-6">
                <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.12)]"
                    style={{ background: `linear-gradient(135deg, ${c.g1}, ${c.g2})` }}
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.6 }}
                >
                    {icon}
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/80 bg-white/50 shadow-sm backdrop-blur-md"
                >
                    <ArrowUpRight size={14} style={{ color: c.g1 }} />
                    <span className="text-xs font-black tracking-wide" style={{ color: c.g1 }}>
                        {trend}
                    </span>
                </motion.div>
            </div>

            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm mix-blend-difference">
                    {title}
                </p>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-500">{prefix}</span>
                    <motion.span
                        className="text-5xl font-black text-gray-900 tracking-tighter"
                        key={animatedVal}
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        {fmt(animatedVal)}
                    </motion.span>
                    <span className="text-xl font-bold text-gray-500">{suffix}</span>
                </div>
            </div>

            {/* Laser Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <motion.div
                    className="h-full"
                    style={{
                        background: `linear-gradient(90deg, ${c.g1}, ${c.g2})`,
                        boxShadow: `0 -2px 10px ${c.glow}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                />
            </div>
        </MagneticCard>
    );
};

/* ══ 3. 3D LIQUID TANK VISUALIZER ══
 * Advanced pseudo-3D css cylinder with animated fluid waves
 ***************************************************************/
export const LiquidTank3D: React.FC<{
    name: string;
    fuelType: string;
    pct: number;
    current: number;
    capacity: number;
    hue: Hue;
}> = ({ name, fuelType, pct, current, capacity, hue }) => {
    const c = C[hue];
    const fillH = Math.max(10, Math.min(100, pct)); // clamp 10-100%
    const isLow = pct < 20;

    return (
        <motion.div
            variants={FU_SLIDE}
            whileHover={{ y: -5 }}
            className="relative flex flex-col items-center group cursor-pointer"
        >
            {/* Alert Glow */}
            {isLow && (
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/20 blur-2xl rounded-full z-0"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                />
            )}

            {/* 3D Cylinder Container */}
            <div className="relative w-36 h-56 rounded-t-[3rem] rounded-b-[2rem] border-[3px] border-white/80 bg-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.1)] backdrop-blur-sm overflow-hidden z-10 flex items-end justify-center pb-2">
                {/* Top Rim Elipse */}
                <div className="absolute top-0 w-full h-8 rounded-[100%] border-b-[3px] border-white/50 z-20 shadow-[inset_0_10px_10px_rgba(255,255,255,0.8)]" />

                {/* Volume Ticks */}
                <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between z-20 py-2">
                    {[100, 75, 50, 25].map(tick => (
                        <div key={tick} className="flex items-center gap-1 opacity-50">
                            <div className="w-2 h-[2px] bg-gray-500" />
                            <span className="text-[8px] font-bold text-gray-500">{tick}%</span>
                        </div>
                    ))}
                </div>

                {/* The Liquid */}
                <motion.div
                    className="relative w-[95%] rounded-b-[1.8rem] rounded-t-[1rem] overflow-hidden"
                    style={{
                        background: `linear-gradient(180deg, ${c.g1}, ${c.g2})`,
                        filter: `drop-shadow(0 0 15px ${c.glow})`,
                    }}
                    initial={{ height: '0%' }}
                    animate={{ height: `${fillH}%` }}
                    transition={{ duration: 2.5, type: 'spring', bounce: 0.4 }}
                >
                    {/* Animated Wave SVGs */}
                    <div
                        className="absolute top-0 left-0 right-0 w-[200%] flex"
                        style={{ transform: 'translateY(-50%)' }}
                    >
                        <motion.div
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                            className="flex w-full"
                        >
                            <svg
                                className="w-1/2 h-6"
                                viewBox="0 0 100 24"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,12Q25,0,50,12T100,12L100,24L0,24Z"
                                    fill="rgba(255,255,255,0.4)"
                                />
                            </svg>
                            <svg
                                className="w-1/2 h-6"
                                viewBox="0 0 100 24"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,12Q25,0,50,12T100,12L100,24L0,24Z"
                                    fill="rgba(255,255,255,0.4)"
                                />
                            </svg>
                        </motion.div>
                    </div>
                    <div
                        className="absolute top-1 left-0 right-0 w-[200%] flex opacity-50"
                        style={{ transform: 'translateY(-50%)' }}
                    >
                        <motion.div
                            animate={{ x: ['-50%', '0%'] }}
                            transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                            className="flex w-full"
                        >
                            <svg
                                className="w-1/2 h-8"
                                viewBox="0 0 100 24"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,12Q25,24,50,12T100,12L100,24L0,24Z"
                                    fill="rgba(255,255,255,0.3)"
                                />
                            </svg>
                            <svg
                                className="w-1/2 h-8"
                                viewBox="0 0 100 24"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,12Q25,24,50,12T100,12L100,24L0,24Z"
                                    fill="rgba(255,255,255,0.3)"
                                />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Liquid Reflection */}
                    <div className="absolute top-0 bottom-0 left-[10%] w-[15%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-12deg]" />
                </motion.div>

                {/* Cylinder Glass Glare */}
                <div className="absolute top-0 bottom-0 left-[20%] w-[25%] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-[10%] w-[5%] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            </div>

            {/* Label Base */}
            <div className="mt-6 text-center z-10 relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white backdrop-blur-md mb-2">
                    <div
                        className="w-2.5 h-2.5 rounded-full shadow-inner"
                        style={{ background: c.g1 }}
                    />
                    <span className="text-xs font-black text-gray-800 tracking-wide">{name}</span>
                </div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    {fuelType}
                </p>
                <p className="text-sm font-black font-mono mt-1 text-gray-900 border-b-2 border-dashed border-gray-300 pb-1">
                    {fmt(current)}{' '}
                    <span className="text-[10px] text-gray-400">/ {fmt(capacity)} L</span>
                </p>
                <div
                    className="mt-2 font-black text-xl"
                    style={{ color: isLow ? C.rose.g1 : c.g1 }}
                >
                    {pct}%
                </div>
            </div>
        </motion.div>
    );
};

/* ══ 4. HOVER-REVEAL ACTION TILES ══
 ***************************************************************/
export const MagicTile: React.FC<{
    icon: React.ReactNode;
    label: string;
    desc: string;
    hue: Hue;
    onClick: () => void;
}> = ({ icon, label, desc, hue, onClick }) => {
    const c = C[hue];
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="w-full text-left relative overflow-hidden rounded-[1.5rem] bg-white/60 backdrop-blur-xl border border-white/80 p-4 group transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        >
            {/* Hover Expansion Background */}
            <motion.div
                className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${c.g1}, transparent 70%)` }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="flex items-center gap-4 relative z-10">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:rotate-6"
                    style={{
                        background: `linear-gradient(135deg, ${c.g1}, ${c.g2})`,
                        boxShadow: `0 8px 20px ${c.glow}`,
                    }}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-gray-900 leading-tight">{label}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                        {desc}
                    </p>
                </div>
                <div
                    className="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-transparent group-hover:text-white transition-all duration-300"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = c.g1)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    <ArrowRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                    />
                </div>
            </div>
        </motion.button>
    );
};
