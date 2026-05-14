/**
 * Global Toast Notification System
 * Replaces all browser alert() calls with beautiful, accessible toasts.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Operation completed!');
 *   toast.error('Something went wrong');
 *   toast.warning('Please check your input');
 *   toast.info('Item saved automatically');
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import React, { createContext, useCallback, useContext, useId, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    title?: string;
    duration?: number;
}

interface ToastContextValue {
    toast: {
        success: (message: string, title?: string) => void;
        error: (message: string, title?: string) => void;
        warning: (message: string, title?: string) => void;
        info: (message: string, title?: string) => void;
    };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextValue => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

// ─── Toast Visual Config ──────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
    ToastType,
    { bg: string; border: string; icon: React.ElementType; iconColor: string; defaultTitle: string }
> = {
    success: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/80',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        defaultTitle: 'Success',
    },
    error: {
        bg: 'bg-rose-50 dark:bg-rose-950/80',
        border: 'border-rose-200 dark:border-rose-800',
        icon: XCircle,
        iconColor: 'text-rose-500',
        defaultTitle: 'Error',
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-950/80',
        border: 'border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        defaultTitle: 'Warning',
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-950/80',
        border: 'border-blue-200 dark:border-blue-800',
        icon: Info,
        iconColor: 'text-blue-500',
        defaultTitle: 'Info',
    },
};

// ─── Individual Toast Item ────────────────────────────────────────────────────

const Toast: React.FC<{ item: ToastItem; onDismiss: (id: string) => void }> = ({
    item,
    onDismiss,
}) => {
    const cfg = TOAST_CONFIG[item.type];
    const Icon = cfg.icon;
    const title = item.title ?? cfg.defaultTitle;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`
                flex items-start gap-3 w-80 max-w-full
                rounded-2xl border shadow-2xl backdrop-blur-xl
                p-4 pointer-events-auto
                ${cfg.bg} ${cfg.border}
            `}
            role="alert"
            aria-live="polite"
        >
            <Icon size={20} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
                    {title}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-snug break-words">
                    {item.message}
                </p>
            </div>
            <button
                onClick={() => onDismiss(item.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors mt-0.5"
                aria-label="Dismiss notification"
            >
                <X size={14} className="text-[var(--text-muted)]" />
            </button>
        </motion.div>
    );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const baseId = useId();
    let counter = 0;

    const add = useCallback((type: ToastType, message: string, title?: string, duration = 4000) => {
        const id = `${baseId}-toast-${Date.now()}-${++counter}`;
        setToasts(prev => [...prev, { id, type, message, title, duration }]);
        if (duration > 0) {
            setTimeout(() => remove(id), duration);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg: string, title?: string) => add('success', msg, title),
        error: (msg: string, title?: string) => add('error', msg, title),
        warning: (msg: string, title?: string) => add('warning', msg, title),
        info: (msg: string, title?: string) => add('info', msg, title),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Toast Renderer — fixed top-right */}
            <div
                className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
                aria-label="Notifications"
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {toasts.map(item => (
                        <Toast key={item.id} item={item} onDismiss={remove} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
