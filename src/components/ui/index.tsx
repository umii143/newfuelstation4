import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import React from 'react';
export { clsx };

// Export Tabs components
export { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

// PageHeader Component
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
    <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
);

// Button Component
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className,
    disabled,
    ...props
}) => {
    const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;

    const variantStyles: Record<ButtonVariant, string> = {
        primary:
            'bg-blue-600 text-white hover:brightness-110 focus:ring-blue-500 shadow-lg shadow-blue-500/20',
        secondary:
            'bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--text-secondary)] shadow-sm',
        danger: 'bg-rose-600 text-white hover:brightness-110 focus:ring-rose-500 shadow-lg shadow-rose-500/20',
        success:
            'bg-emerald-600 text-white hover:brightness-110 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20',
        ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]',
    };

    const sizeStyles: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
            disabled={disabled || loading}
            aria-busy={loading}
            aria-live={loading ? 'polite' : undefined}
            {...props}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : icon}
            {children}
        </button>
    );
};

// Card Component
interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    hover = false,
    glass = false,
    onClick,
}) => {
    return (
        <div
            className={clsx(
                'rounded-xl p-6 transition-all duration-300',
                glass
                    ? 'bg-[var(--bg-elevated)] backdrop-blur-xl border border-white/20 shadow-2xl ring-1 ring-white/10'
                    : 'bg-[var(--bg-surface)] border border-[var(--border)]',
                hover && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
                'shadow-md',
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className, id, ...props }) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                        aria-hidden="true"
                    >
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={clsx(
                        'w-full px-4 py-3 rounded-lg text-sm',
                        'bg-[var(--bg-surface)] border-2 border-[var(--border)]',
                        'text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]',
                        'transition-all duration-200',
                        'focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-blue-500/20',
                        icon && 'pl-10',
                        error &&
                            'border-accent-rose focus:border-accent-rose focus:ring-rose-500/20',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p id={errorId} className="mt-1.5 text-xs text-accent-rose" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

// Badge Component
type BadgeColor =
    | 'blue'
    | 'emerald'
    | 'rose'
    | 'amber'
    | 'gray'
    | 'cyan'
    | 'indigo'
    | 'purple'
    | 'orange';

interface BadgeProps {
    children: React.ReactNode;
    color?: BadgeColor;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', className }) => {
    const colorStyles: Record<BadgeColor, string> = {
        blue: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
        rose: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20',
        amber: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20',
        gray: 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20',
        cyan: 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20',
        purple: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                colorStyles[color],
                className
            )}
        >
            {children}
        </span>
    );
};

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeStyles: Record<string, string> = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                className={clsx(
                    'relative w-full rounded-2xl shadow-2xl animate-scale-in',
                    'bg-[var(--bg-surface)] border border-[var(--border)]',
                    'max-h-[90vh] overflow-auto',
                    sizeStyles[size]
                )}
            >
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                        <h2
                            id="modal-title"
                            className="text-xl font-bold text-[var(--text-primary)]"
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                            aria-label="Close modal"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// Loading Spinner
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={clsx('animate-spin text-accent-blue', sizeStyles[size])}>
            <Loader2 className="w-full h-full" />
        </div>
    );
};

// Skeleton Loader
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={clsx('animate-pulse bg-[var(--border)] rounded', className)} />
);

// Progress Bar
interface ProgressProps {
    value: number;
    max?: number;
    color?: 'blue' | 'emerald' | 'rose' | 'amber';
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    color = 'blue',
    showLabel = false,
    size = 'md',
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colorStyles: Record<string, string> = {
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
    };

    const sizeStyles = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    return (
        <div className="w-full">
            <div
                className={clsx(
                    'w-full bg-[var(--border)] rounded-full overflow-hidden',
                    sizeStyles[size]
                )}
            >
                <div
                    className={clsx(
                        'h-full rounded-full transition-all duration-500',
                        colorStyles[color]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="mt-1 text-xs text-[var(--text-secondary)] text-right">
                    {percentage.toFixed(0)}%
                </p>
            )}
        </div>
    );
};

// Empty State
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
            <div className="w-16 h-16 mb-4 text-[var(--text-secondary)] opacity-50">{icon}</div>
        )}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
        {description && (
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">{description}</p>
        )}
        {action}
    </div>
);

// KPI Color Palette
export type KPIColor =
    | 'blue'
    | 'emerald'
    | 'rose'
    | 'amber'
    | 'indigo'
    | 'cyan'
    | 'purple'
    | 'pink'
    | 'orange'
    | 'lime'
    | 'teal'
    | 'violet'
    | 'slate';

const kpiColorMap: Record<
    KPIColor,
    { bg: string; border: string; icon: string; text: string; shadow: string; hover: string }
> = {
    blue: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30 dark:border-blue-500/40',
        icon: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        text: 'text-blue-500',
        shadow: 'shadow-blue-500/30',
        hover: 'hover:border-blue-500 hover:shadow-blue-500/20',
    },
    emerald: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        border: 'border-emerald-500/30 dark:border-emerald-500/40',
        icon: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        text: 'text-emerald-500',
        shadow: 'shadow-emerald-500/30',
        hover: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
    },
    rose: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        border: 'border-rose-500/30 dark:border-rose-500/40',
        icon: 'bg-gradient-to-br from-rose-500 to-pink-500',
        text: 'text-rose-500',
        shadow: 'shadow-rose-500/30',
        hover: 'hover:border-rose-500 hover:shadow-rose-500/20',
    },
    amber: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        border: 'border-amber-500/30 dark:border-amber-500/40',
        icon: 'bg-gradient-to-br from-amber-500 to-orange-500',
        text: 'text-amber-500',
        shadow: 'shadow-amber-500/30',
        hover: 'hover:border-amber-500 hover:shadow-amber-500/20',
    },
    indigo: {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        border: 'border-indigo-500/30 dark:border-indigo-500/40',
        icon: 'bg-gradient-to-br from-indigo-500 to-purple-500',
        text: 'text-indigo-500',
        shadow: 'shadow-indigo-500/30',
        hover: 'hover:border-indigo-500 hover:shadow-indigo-500/20',
    },
    cyan: {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        border: 'border-cyan-500/30 dark:border-cyan-500/40',
        icon: 'bg-gradient-to-br from-cyan-500 to-blue-500',
        text: 'text-cyan-500',
        shadow: 'shadow-cyan-500/30',
        hover: 'hover:border-cyan-500 hover:shadow-cyan-500/20',
    },
    purple: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        border: 'border-purple-500/30 dark:border-purple-500/40',
        icon: 'bg-gradient-to-br from-purple-500 to-indigo-500',
        text: 'text-purple-500',
        shadow: 'shadow-purple-500/30',
        hover: 'hover:border-purple-500 hover:shadow-purple-500/20',
    },
    pink: {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        border: 'border-pink-500/30 dark:border-pink-500/40',
        icon: 'bg-gradient-to-br from-pink-500 to-rose-500',
        text: 'text-pink-500',
        shadow: 'shadow-pink-500/30',
        hover: 'hover:border-pink-500 hover:shadow-pink-500/20',
    },
    orange: {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        border: 'border-orange-500/30 dark:border-orange-500/40',
        icon: 'bg-gradient-to-br from-orange-500 to-amber-500',
        text: 'text-orange-500',
        shadow: 'shadow-orange-500/30',
        hover: 'hover:border-orange-500 hover:shadow-orange-500/20',
    },
    lime: {
        bg: 'bg-lime-500/10 dark:bg-lime-500/20',
        border: 'border-lime-500/30 dark:border-lime-500/40',
        icon: 'bg-gradient-to-br from-lime-500 to-emerald-500',
        text: 'text-lime-500',
        shadow: 'shadow-lime-500/30',
        hover: 'hover:border-lime-500 hover:shadow-lime-500/20',
    },
    teal: {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        border: 'border-teal-500/30 dark:border-teal-500/40',
        icon: 'bg-gradient-to-br from-teal-500 to-cyan-500',
        text: 'text-teal-500',
        shadow: 'shadow-teal-500/30',
        hover: 'hover:border-teal-500 hover:shadow-teal-500/20',
    },
    violet: {
        bg: 'bg-violet-500/10 dark:bg-violet-500/20',
        border: 'border-violet-500/30 dark:border-violet-500/40',
        icon: 'bg-gradient-to-br from-violet-500 to-purple-500',
        text: 'text-violet-500',
        shadow: 'shadow-violet-500/30',
        hover: 'hover:border-violet-500 hover:shadow-violet-500/20',
    },
    slate: {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        border: 'border-slate-500/30 dark:border-slate-500/40',
        icon: 'bg-gradient-to-br from-slate-500 to-slate-700',
        text: 'text-slate-500',
        shadow: 'shadow-slate-500/30',
        hover: 'hover:border-slate-500 hover:shadow-slate-500/20',
    },
};

// KPI Card
interface KPICardProps {
    label: string;
    value: string | number;
    subValue?: string | number;
    change?: number;
    icon?: React.ReactNode;
    color?: KPIColor;
    format?: 'currency' | 'number' | 'percentage';
    onClick?: () => void;
    animate?: boolean;
    className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
    label,
    value,
    subValue,
    change,
    icon,
    color = 'blue',
    onClick,
    animate = false,
    className,
}) => {
    const style = kpiColorMap[color] || kpiColorMap.blue;

    const content = (
        <div className="flex items-center gap-4">
            {icon && (
                <div
                    className={clsx(
                        'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all',
                        style.icon,
                        style.shadow,
                        onClick && 'group-hover:shadow-2xl group-hover:scale-110'
                    )}
                >
                    {React.isValidElement(icon)
                        ? React.cloneElement(icon as React.ReactElement, {
                              className: 'w-7 h-7 text-white',
                          })
                        : icon}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 truncate opacity-70">
                    {label}
                </p>
                <p className={clsx('text-2xl font-black truncate', style.text)}>{value}</p>
                {subValue && (
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] truncate opacity-60">
                        {subValue}
                    </p>
                )}
                {change !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                        <span
                            className={clsx(
                                'text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5',
                                change >= 0
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-rose-500/10 text-rose-500'
                            )}
                        >
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    const containerClasses = clsx(
        'relative overflow-hidden rounded-[2rem] p-6 border-2 backdrop-blur-md transition-all duration-300',
        style.bg,
        style.border,
        onClick
            ? clsx('group cursor-pointer hover:scale-[1.02] hover:shadow-2xl', style.hover)
            : 'shadow-sm',
        animate && 'animate-pulse-slow',
        className
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={clsx(containerClasses, 'text-left w-full')}>
                {content}
            </button>
        );
    }

    return <div className={containerClasses}>{content}</div>;
};
