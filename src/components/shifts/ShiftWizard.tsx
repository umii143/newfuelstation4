/**
 * ShiftWizard v5.0 — Elite Glassmorphism Build
 * 50+ senior designer quality — animated frosted glass modal,
 * particle glow progress, magnetic step indicators, 3D depth.
 */
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/stores/authStore';
import { useCNGStore } from '@/stores/cngStore';
import { useFuelStore } from '@/stores/fuelStore';
import { ShiftClosingWizardState } from '@/types';
import { StepProps } from '@/types/wizard';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StepAudit } from './steps/StepAudit';
import { StepCredits } from './steps/StepCredits';
import { StepFinance } from './steps/StepFinance';
import { StepIntelligence } from './steps/StepIntelligence';
import { StepTelemetry } from './steps/StepTelemetry';
import { StepTreasury } from './steps/StepTreasury';
import { StepWelcome } from './steps/StepWelcome';

type ShiftMode = 'FUEL' | 'CNG';
type StepData = ShiftClosingWizardState;

interface ShiftWizardProps {
    isOpen: boolean;
    onClose: () => void;
    mode: ShiftMode;
}

/* ── Step metadata ───────────────────────────────────────────────── */
const WIZARD_STEPS = [
    {
        id: 1,
        title: 'Initialize',
        subtitle: 'Operator & Date',
        emoji: '🚀',
        color: '#6366f1',
        component: StepWelcome,
    },
    {
        id: 2,
        title: 'Telemetry',
        subtitle: 'Pump Readings',
        emoji: '⚡',
        color: '#f59e0b',
        component: StepTelemetry,
    },
    {
        id: 3,
        title: 'Intel',
        subtitle: 'Revenue Analysis',
        emoji: '📊',
        color: '#10b981',
        component: StepIntelligence,
    },
    {
        id: 4,
        title: 'Credits',
        subtitle: 'Sales & Recovery',
        emoji: '💳',
        color: '#06b6d4',
        component: StepCredits,
    },
    {
        id: 5,
        title: 'Finance',
        subtitle: 'Expenses & Digital',
        emoji: '💰',
        color: '#8b5cf6',
        component: StepFinance,
    },
    {
        id: 6,
        title: 'Treasury',
        subtitle: 'Cash Reconcile',
        emoji: '🏦',
        color: '#f97316',
        component: StepTreasury,
    },
    {
        id: 7,
        title: 'Commit',
        subtitle: 'Final Audit',
        emoji: '✅',
        color: '#34d399',
        component: StepAudit,
    },
];

/* ── Animation variants ─────────────────────────────────────────── */
const OVERLAY_ANIM = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};
const MODAL_ANIM = {
    hidden: { scale: 0.92, opacity: 0, y: 32 },
    show: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 28, mass: 0.8 },
    },
    exit: {
        scale: 0.94,
        opacity: 0,
        y: 24,
        transition: { duration: 0.2, ease: 'easeIn' },
    },
};
const SLIDE = {
    enter: (dir: 'forward' | 'back') => ({
        x: dir === 'forward' ? 64 : -64,
        opacity: 0,
        scale: 0.97,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 380, damping: 32 },
    },
    exit: (dir: 'forward' | 'back') => ({
        x: dir === 'forward' ? -64 : 64,
        opacity: 0,
        scale: 0.97,
        transition: { duration: 0.15 },
    }),
};

/* ══════════════════════════════════════════════════════════════════ */
export const ShiftWizard: React.FC<ShiftWizardProps> = ({ isOpen, onClose, mode }) => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const fuelStore = useFuelStore();
    const cngStore = useCNGStore();

    const [currentStep, setCurrentStep] = useState(1);
    const [wizardData, setWizardData] = useState<Partial<StepData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setWizardData(initializeWizardData(mode));
        }
    }, [isOpen, mode]);

    /* Scroll to top on step change */
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const initializeWizardData = (m: ShiftMode): Partial<StepData> => {
        const store = m === 'FUEL' ? fuelStore : cngStore;
        return {
            startTime: new Date().toISOString(),
            shiftType: new Date().getHours() < 18 ? 'MORNING' : 'EVENING',
            readings: store.nozzles.map((n: any) => {
                const tank = (store as any).tanks?.find((t: any) => t.tankId === n.tankId);
                return {
                    nozzleId: n.nozzleId || n.id,
                    nozzleName: n.name,
                    fuelType: tank?.fuelType || 'PETROL_92',
                    opening: n.currentReading,
                    closing: n.currentReading,
                    test: 0,
                    rate: tank?.salePrice || n.rate || 0,
                    costPrice: tank?.costPrice || n.costPrice || 0,
                    netLiters: 0,
                    revenue: 0,
                };
            }),
            transactions: [],
            petrolTestLiters: 0,
            dieselTestLiters: 0,
        };
    };

    const handleUpdate = useCallback((newData: Partial<StepData>) => {
        setWizardData(prev => ({ ...prev, ...newData }));
        // Sync to Zustand store so calculateTotals runs
        const store = mode === 'FUEL' ? fuelStore : cngStore;
        store.updateClosingState(newData as any);
    }, [mode, fuelStore, cngStore]);

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!wizardData.staffId && !!wizardData.startTime;
            case 2:
                if (!wizardData.readings?.length) return true;
                for (const r of wizardData.readings || []) {
                    if (r.closing === null || r.closing === undefined) return false;
                    if (r.closing < r.opening) return false;
                }
                return true;
            case 6:
                return (
                    wizardData.actualCash !== undefined &&
                    wizardData.actualCash !== null &&
                    !isNaN(wizardData.actualCash)
                );
            default:
                return true;
        }
    };

    const goNext = () => {
        if (validateStep(currentStep)) {
            setDirection('forward');
            setCurrentStep(p => Math.min(WIZARD_STEPS.length, p + 1));
        }
    };

    const goBack = () => {
        setDirection('back');
        setCurrentStep(p => Math.max(1, p - 1));
    };

    const finalizeShift = async () => {
        try {
            setIsSubmitting(true);
            const store = mode === 'FUEL' ? fuelStore : cngStore;
            store.updateClosingState({
                ...wizardData,
                
                closedBy: (user as any)?.name || 'System',
            } as any);
            await store.completeShiftClosing();
            onClose();
        } catch (err) {
            console.error('Shift commit error:', err);
            toast.error('Error committing shift. Check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const CurrentStep = WIZARD_STEPS[currentStep - 1].component as React.ElementType<StepProps>;
    const totalSteps = WIZARD_STEPS.length;
    const canProceed = validateStep(currentStep);
    const isLastStep = currentStep === totalSteps;
    const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const meta = WIZARD_STEPS[currentStep - 1];
    const isFuel = mode === 'FUEL';

    /* Accent derived from current step */
    const accentColor = meta.color;
    const prevStepColor = currentStep > 1 ? WIZARD_STEPS[currentStep - 2].color : accentColor;

    return (
        <AnimatePresence>
            {/* ── FROSTED OVERLAY ── */}
            <motion.div
                key="wizard-overlay"
                variants={OVERLAY_ANIM}
                initial="hidden"
                animate="show"
                exit="exit"
                className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                style={{
                    /* Multi-layer glassmorphic overlay */
                    background:
                        'linear-gradient(135deg,rgba(2,6,23,0.85) 0%,rgba(15,23,42,0.90) 100%)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                }}
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                {/* Ambient background glows */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div
                        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
                        style={{
                            background: `radial-gradient(circle,${accentColor}20,transparent 70%)`,
                            filter: 'blur(40px)',
                        }}
                    />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
                        style={{
                            background:
                                'radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%)',
                            filter: 'blur(40px)',
                        }}
                    />
                </motion.div>

                {/* ── MODAL GLASS CONTAINER ── */}
                <motion.div
                    key="wizard-modal"
                    variants={MODAL_ANIM}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="relative w-full mx-3 sm:mx-6"
                    style={{
                        maxWidth: '900px',
                        maxHeight: '95vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Outer glow ring  */}
                    <motion.div
                        className="absolute -inset-[1px] rounded-[28px] pointer-events-none"
                        animate={{
                            boxShadow: [
                                `0 0 0 1px ${accentColor}30, 0 32px 80px rgba(0,0,0,0.6)`,
                                `0 0 0 1px ${accentColor}60, 0 32px 80px rgba(0,0,0,0.6)`,
                                `0 0 0 1px ${accentColor}30, 0 32px 80px rgba(0,0,0,0.6)`,
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Main glass panel */}
                    <div
                        className="relative flex flex-col rounded-[26px] overflow-hidden"
                        style={{
                            maxHeight: '95vh',
                            /* Elite glassmorphism — light has translucent white, dark has deep translucent */
                            background:
                                'linear-gradient(160deg,rgba(255,255,255,0.96) 0%,rgba(248,250,252,0.93) 100%)',
                            backdropFilter: 'blur(40px) saturate(200%)',
                            boxShadow:
                                '0 40px 120px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.95)',
                        }}
                    >
                        {/* Dark mode glass layer */}
                        <div
                            className="dark:block hidden absolute inset-0 rounded-[26px] pointer-events-none"
                            style={{
                                background:
                                    'linear-gradient(160deg,rgba(15,23,42,0.95) 0%,rgba(2,6,23,0.97) 100%)',
                            }}
                        />

                        {/* Animated accent strip at very top */}
                        <motion.div
                            className="relative h-[3px] flex-shrink-0 rounded-t-[26px] overflow-hidden z-20"
                            style={{
                                background: `linear-gradient(90deg,${accentColor},${accentColor}80,${accentColor})`,
                            }}
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        'linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)',
                                }}
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                    ease: 'easeInOut',
                                }}
                            />
                        </motion.div>

                        {/* ────────────── HEADER ────────────── */}
                        <div
                            className="relative z-10 flex-shrink-0 px-6 pt-5 pb-5 border-b border-gray-100/80 dark:border-white/[0.06]"
                            style={{
                                background: 'rgba(248,250,252,0.7)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div
                                className="dark:block hidden absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'rgba(2,6,23,0.6)',
                                    backdropFilter: 'blur(8px)',
                                }}
                            />

                            {/* Top row */}
                            <div className="relative flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    {/* Mode badge */}
                                    <motion.div
                                        key={mode}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                        style={{
                                            background: `${isFuel ? '#f97316' : '#06b6d4'}18`,
                                            border: `1px solid ${isFuel ? '#f97316' : '#06b6d4'}35`,
                                        }}
                                    >
                                        <motion.div
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: isFuel ? '#f97316' : '#06b6d4' }}
                                            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity }}
                                        />
                                        <span
                                            className="text-xs font-black uppercase tracking-widest"
                                            style={{ color: isFuel ? '#f97316' : '#06b6d4' }}
                                        >
                                            {isFuel ? '⛽ Fuel' : '💨 CNG'}
                                        </span>
                                    </motion.div>

                                    {/* Title */}
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 dark:text-white leading-none">
                                            Shift Closing Wizard
                                        </h2>
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={currentStep}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 4 }}
                                                className="text-sm text-gray-400 dark:text-slate-500 font-mono mt-0.5"
                                            >
                                                Step {currentStep} of {totalSteps} — {meta.subtitle}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Close button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ duration: 0.18 }}
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </motion.button>
                            </div>

                            {/* ── Step pills ── */}
                            <div className="relative flex items-center gap-1 overflow-x-auto pb-1">
                                {WIZARD_STEPS.map((step, idx) => {
                                    const done = currentStep > step.id;
                                    const active = currentStep === step.id;
                                    return (
                                        <React.Fragment key={step.id}>
                                            <motion.div
                                                layout
                                                className="relative flex flex-col items-center gap-1 shrink-0"
                                            >
                                                {/* Step circle */}
                                                <motion.div
                                                    animate={
                                                        active
                                                            ? {
                                                                  boxShadow: [
                                                                      `0 0 0 0px ${step.color}40`,
                                                                      `0 0 0 6px ${step.color}18`,
                                                                      `0 0 0 0px ${step.color}40`,
                                                                  ],
                                                              }
                                                            : {}
                                                    }
                                                    transition={{
                                                        duration: 2.2,
                                                        repeat: active ? Infinity : 0,
                                                    }}
                                                    className={clsx(
                                                        'w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 relative overflow-hidden',
                                                        done
                                                            ? 'text-white'
                                                            : active
                                                              ? 'text-white ring-4 ring-offset-2 dark:ring-offset-[#0c0e1a]'
                                                              : 'text-gray-400 dark:text-slate-600 bg-gray-100/80 dark:bg-white/[0.05]'
                                                    )}
                                                    style={
                                                        done || active
                                                            ? {
                                                                  background: `linear-gradient(135deg,${step.color},${step.color}cc)`,
                                                                  
                                                                  boxShadow: active
                                                                      ? `0 4px 16px ${step.color}50`
                                                                      : `0 2px 8px ${step.color}30`,
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {done ? (
                                                        <CheckCircle2 size={15} />
                                                    ) : active ? (
                                                        <span className="text-base">
                                                            {step.emoji}
                                                        </span>
                                                    ) : (
                                                        <span>{step.id}</span>
                                                    )}
                                                    {/* Shimmer sweep on active */}
                                                    {active && (
                                                        <motion.div
                                                            className="absolute inset-0"
                                                            style={{
                                                                background:
                                                                    'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',
                                                                skewX: '-15deg',
                                                            }}
                                                            animate={{ x: ['-150%', '200%'] }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                repeatDelay: 1,
                                                            }}
                                                        />
                                                    )}
                                                </motion.div>

                                                {/* Step label */}
                                                <span
                                                    className={clsx(
                                                        'hidden sm:block text-[9px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap',
                                                        active
                                                            ? 'opacity-100'
                                                            : done
                                                              ? 'text-gray-500 dark:text-slate-500 opacity-80'
                                                              : 'text-gray-300 dark:text-slate-700 opacity-60'
                                                    )}
                                                    style={active ? { color: step.color } : {}}
                                                >
                                                    {step.title}
                                                </span>
                                            </motion.div>

                                            {/* Connector */}
                                            {idx < WIZARD_STEPS.length - 1 && (
                                                <div className="flex-1 min-w-[12px] h-px relative overflow-hidden mx-0.5 mb-4 sm:mb-5">
                                                    <div className="absolute inset-0 bg-gray-200 dark:bg-white/[0.06]" />
                                                    <motion.div
                                                        className="absolute inset-0"
                                                        style={{
                                                            originX: 0,
                                                            background: `linear-gradient(90deg,${step.color},${WIZARD_STEPS[idx + 1].color})`,
                                                        }}
                                                        animate={{
                                                            scaleX: currentStep > step.id ? 1 : 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.45,
                                                            ease: 'easeOut',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* ── Master progress bar (glowing) ── */}
                            <div className="mt-4 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden relative">
                                <motion.div
                                    className="h-full rounded-full relative"
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.55, ease: 'easeOut' }}
                                    style={{
                                        background: `linear-gradient(90deg,${prevStepColor},${accentColor})`,
                                    }}
                                >
                                    {/* Glow pulse on leading edge */}
                                    <motion.div
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                                        animate={{ opacity: [0.6, 1, 0.6], scale: [0.8, 1.2, 0.8] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{
                                            background: accentColor,
                                            boxShadow: `0 0 8px ${accentColor}`,
                                            transform: 'translateX(50%) translateY(-50%)',
                                        }}
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* ── CURRENT STEP LABEL BAR ── */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep + '-label'}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="relative z-10 flex-shrink-0 flex items-center gap-3 px-6 pt-4 pb-2"
                            >
                                <motion.div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                                    style={{
                                        background: `${accentColor}15`,
                                        border: `1px solid ${accentColor}30`,
                                    }}
                                    animate={{ scale: [1, 1.06, 1] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    {meta.emoji}
                                </motion.div>
                                <div>
                                    <p className="text-base font-black text-gray-900 dark:text-white leading-none">
                                        {meta.title}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                        {meta.subtitle}
                                    </p>
                                </div>
                                <div
                                    className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                    style={{
                                        background: `${accentColor}10`,
                                        border: `1px solid ${accentColor}25`,
                                    }}
                                >
                                    <Activity size={11} style={{ color: accentColor }} />
                                    <span
                                        className="text-xs font-black font-mono"
                                        style={{ color: accentColor }}
                                    >
                                        {currentStep}/{totalSteps}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* ────────────── CONTENT AREA ────────────── */}
                        <div
                            ref={scrollRef}
                            className="relative z-10 flex-1 overflow-y-auto px-6 pb-3"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: `${accentColor}30 transparent`,
                            }}
                        >
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={SLIDE}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                >
                                    <CurrentStep
                                        data={wizardData as StepData}
                                        onUpdate={handleUpdate}
                                        mode={mode}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ────────────── FOOTER ────────────── */}
                        <div
                            className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-100/80 dark:border-white/[0.06]"
                            style={{
                                background: 'rgba(248,250,252,0.8)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div
                                className="dark:block hidden absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'rgba(2,6,23,0.7)',
                                    backdropFilter: 'blur(12px)',
                                }}
                            />

                            {/* Back */}
                            <motion.button
                                whileHover={currentStep > 1 ? { scale: 1.04, x: -2 } : {}}
                                whileTap={currentStep > 1 ? { scale: 0.96 } : {}}
                                onClick={goBack}
                                disabled={currentStep === 1}
                                className={clsx(
                                    'relative flex items-center gap-1.5 px-5 h-11 rounded-2xl text-sm font-black uppercase tracking-wide transition-all duration-200',
                                    currentStep === 1
                                        ? 'opacity-0 pointer-events-none'
                                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] border-2 border-gray-200/80 dark:border-white/[0.08]'
                                )}
                            >
                                <ChevronLeft size={15} /> Back
                            </motion.button>

                            {/* Step progress dots (center) */}
                            <div className="flex items-center gap-1.5">
                                {WIZARD_STEPS.map(s => (
                                    <motion.div
                                        key={s.id}
                                        animate={{
                                            width: s.id === currentStep ? 20 : 6,
                                            opacity:
                                                s.id === currentStep
                                                    ? 1
                                                    : s.id < currentStep
                                                      ? 0.7
                                                      : 0.25,
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className="h-1.5 rounded-full"
                                        style={{
                                            background:
                                                s.id <= currentStep ? accentColor : '#e5e7eb',
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Proceed / Commit */}
                            {!isLastStep ? (
                                <motion.button
                                    whileHover={canProceed ? { scale: 1.04, x: 2 } : {}}
                                    whileTap={canProceed ? { scale: 0.96 } : {}}
                                    onClick={goNext}
                                    disabled={!canProceed}
                                    className={clsx(
                                        'relative overflow-hidden flex items-center gap-2 px-6 h-11 rounded-2xl text-sm font-black uppercase tracking-wide transition-all duration-200',
                                        canProceed
                                            ? 'text-white'
                                            : 'bg-gray-100 dark:bg-white/[0.05] text-gray-300 dark:text-slate-600 cursor-not-allowed border-2 border-gray-200/60 dark:border-white/[0.05]'
                                    )}
                                    style={
                                        canProceed
                                            ? {
                                                  background: `linear-gradient(135deg,${accentColor},${accentColor}cc)`,
                                                  boxShadow: `0 6px 20px ${accentColor}40`,
                                              }
                                            : {}
                                    }
                                >
                                    {canProceed && (
                                        <motion.div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)',
                                                skewX: '-20deg',
                                            }}
                                            animate={{ x: ['-150%', '200%'] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 1.5,
                                            }}
                                        />
                                    )}
                                    <span className="relative">Proceed</span>
                                    <ChevronRight size={15} className="relative" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={!isSubmitting ? { scale: 1.04 } : {}}
                                    whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                                    onClick={finalizeShift}
                                    disabled={isSubmitting}
                                    className="relative overflow-hidden flex items-center gap-2 px-7 h-11 rounded-2xl text-sm font-black uppercase tracking-wide text-white transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg,#10b981,#059669)',
                                        boxShadow: isSubmitting
                                            ? 'none'
                                            : '0 6px 24px rgba(16,185,129,0.4)',
                                    }}
                                >
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{
                                            background:
                                                'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
                                            skewX: '-20deg',
                                        }}
                                        animate={{ x: ['-150%', '200%'] }}
                                        transition={{
                                            duration: 1.8,
                                            repeat: Infinity,
                                            repeatDelay: 1,
                                        }}
                                    />
                                    <span className="relative flex items-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />{' '}
                                                Committing…
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={14} /> Commit Shift
                                            </>
                                        )}
                                    </span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShiftWizard;
