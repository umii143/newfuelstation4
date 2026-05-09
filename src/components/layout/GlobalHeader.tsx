import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { clearBusinessScopedStores } from '@/lib/businessStoreSync';
import { getBusinessMeta } from '@/lib/businessScope';
import { cn } from '@/lib/utils';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { useFuelStore } from '@/stores/fuelStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Fingerprint, Globe, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { LiveTicker } from '@/components/ui/LiveTicker';

export function GlobalHeader() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const { user: currentUser, authMethod } = useAuthStore();
    const { settings, switchBusinessUnit } = useSettingsStore();
    const fuelState = useFuelStore(state => state);
    const activeBusiness = getBusinessMeta(settings.businessUnit);
    const isBloomberg = settings.theme === 'bloomberg';

    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;

        const handler = () => setIsScrolled(main.scrollTop > 8);
        main.addEventListener('scroll', handler, { passive: true });
        return () => main.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(
                new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const notifications = useMemo(() => {
        const notifs: any[] = [];
        let idCounter = 1;

        fuelState.tanks.forEach((tank: any) => {
            if (tank.currentLevel && tank.capacity) {
                const pct = (tank.currentLevel / tank.capacity) * 100;
                if (pct <= 25) {
                    notifs.push({
                        id: idCounter++,
                        title: 'Low Stock Alert',
                        message: `${tank.name || tank.fuelType} is running low (${Math.round(pct)}%)`,
                        time: 'Just now',
                        unread: true,
                        type: 'alert',
                    });
                }
            }
        });

        fuelState.shifts
            .filter((shift: any) => shift.status === 'OPEN')
            .forEach((shift: any) => {
                notifs.push({
                    id: idCounter++,
                    title: 'Active Shift',
                    message: `Shift ${shift.id} is currently open`,
                    time: 'In progress',
                    unread: false,
                    type: 'shift',
                });
            });

        return notifs;
    }, [fuelState]);

    const unreadCount = notifications.filter(notification => notification.unread).length;
    const hasActiveShift = notifications.some(notification => notification.type === 'shift');

    const businessUnits = [
        { id: 'FUEL', label: 'Fuel Station' },
        { id: 'CNG', label: 'CNG' },
        { id: 'LUBE', label: 'Lube' },
    ] as const;

    const handleSwitchBusiness = (businessUnit: 'FUEL' | 'CNG' | 'LUBE') => {
        if (settings.businessUnit === businessUnit) {
            return;
        }

        clearBusinessScopedStores();
        switchBusinessUnit(businessUnit);
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
    };

    return (
        <div className="sticky top-0 z-50 flex w-full flex-col">
            {isBloomberg && <LiveTicker />}

            <header
                className={cn(
                    'h-[var(--header-height)] w-full border-b transition-all duration-300',
                    isScrolled
                        ? 'bg-white/90 backdrop-blur-xl shadow-sm border-slate-200/60 dark:bg-slate-950/90 dark:border-slate-800/60 dark:shadow-md bloomberg:bg-[#0A0A0A] bloomberg:border-[#2A2A2A]'
                        : 'bg-white/50 backdrop-blur-md border-transparent dark:bg-slate-950/50 bloomberg:bg-[#000000] bloomberg:border-transparent'
                )}
            >
                <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                Active Business
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white bloomberg:text-[#F5A623]">
                                {activeBusiness.label}
                            </span>
                        </div>

                        <div className="glass-panel flex items-center rounded-xl p-1 bg-slate-100/50 dark:bg-slate-800/50">
                            {businessUnits.map(business => {
                                const isActive = settings.businessUnit === business.id;

                                // Define dynamic colors based on business unit
                                const getActiveColor = (id: string) => {
                                    switch(id) {
                                        case 'FUEL': return 'bg-blue-600 shadow-blue-500/30';
                                        case 'CNG': return 'bg-emerald-500 shadow-emerald-500/30';
                                        case 'LUBE': return 'bg-amber-500 shadow-amber-500/30';
                                        default: return 'bg-white dark:bg-slate-800';
                                    }
                                };

                                return (
                                    <button
                                        key={business.id}
                                        onClick={() => handleSwitchBusiness(business.id)}
                                        className={cn(
                                            'relative flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors outline-none',
                                            isActive
                                                ? 'text-white bloomberg:text-black'
                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bloomberg:text-[#888]'
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="headerBuTab"
                                                className={cn(
                                                    'absolute inset-0 rounded-lg shadow-sm',
                                                    getActiveColor(business.id)
                                                )}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10 tracking-tight drop-shadow-sm">
                                            {business.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white bloomberg:text-[#F5A623]">
                            {activeBusiness.label}
                        </span>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                        <span className="text-sm font-medium text-slate-500 bloomberg:text-[#888]">
                            {currentTime}
                        </span>
                    </div>

                    <div className="ml-auto flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
                            className="glass-input hidden w-48 items-center gap-3 rounded-lg px-3 py-1.5 text-slate-400 transition-colors hover:text-slate-600 sm:flex lg:w-64 dark:hover:text-slate-300"
                        >
                            <Search size={16} />
                            <span className="text-xs font-medium">Search...</span>
                            <div className="ml-auto flex items-center gap-1 opacity-60">
                                <span className="rounded bg-slate-200 px-1.5 text-[10px] dark:bg-slate-700">
                                    Ctrl
                                </span>
                                <span className="rounded bg-slate-200 px-1.5 text-[10px] dark:bg-slate-700">
                                    K
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
                            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 sm:hidden dark:hover:bg-slate-800"
                        >
                            <Search size={20} />
                        </button>

                        <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700/60 sm:block" />

                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={cn(
                                    'relative rounded-xl p-2.5 transition-all',
                                    showNotifications
                                        ? 'bg-slate-100 dark:bg-slate-800'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                )}
                            >
                                <motion.div
                                    animate={
                                        unreadCount > 0 ? { rotate: [0, -15, 15, -15, 15, 0] } : {}
                                    }
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                >
                                    <Bell
                                        size={20}
                                        className="text-slate-600 dark:text-slate-300 bloomberg:text-[#888]"
                                    />
                                </motion.div>
                                <AnimatePresence>
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute right-2 top-1.5 flex h-2.5 w-2.5"
                                        >
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-slate-900 bloomberg:border-black" />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-40 lg:hidden"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="glass-card absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden shadow-xl sm:w-96"
                                        >
                                            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700/60 bloomberg:border-[#2A2A2A]">
                                                <h3 className="font-bold text-slate-800 dark:text-white bloomberg:text-[#F5A623]">
                                                    Notifications
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <span className="text-xs font-semibold text-rose-500">
                                                        {unreadCount} New
                                                    </span>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(notification => (
                                                        <div
                                                            key={notification.id}
                                                            className="border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                                        >
                                                            <div className="flex gap-3">
                                                                <div
                                                                    className={cn(
                                                                        'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
                                                                        notification.unread
                                                                            ? 'bg-rose-500'
                                                                            : 'bg-emerald-500'
                                                                    )}
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="mt-1 text-[10px] text-slate-400 font-data">
                                                                        {notification.time}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-6 text-center text-sm text-slate-500">
                                                        No new notifications
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-2 pl-1">
                            <div className="mr-1 hidden flex-col items-end lg:flex">
                                <span className="leading-tight text-sm font-bold text-slate-800 dark:text-white bloomberg:text-[#E5E5E5]">
                                    {(currentUser as any)?.name || 'Admin'}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                    {authMethod === 'GOOGLE' ? (
                                        <Globe size={9} />
                                    ) : (
                                        <Fingerprint size={9} />
                                    )}
                                    {authMethod || 'SECURED'}
                                </span>
                            </div>
                            <div className="relative">
                                {hasActiveShift && (
                                    <div className="pointer-events-none absolute -inset-1 animate-pulse-ring rounded-full border border-emerald-500/50" />
                                )}
                                <div
                                    className={cn(
                                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 sm:h-10 sm:w-10 sm:rounded-2xl',
                                        hasActiveShift
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                            : 'border-transparent bg-slate-100 dark:bg-slate-800'
                                    )}
                                >
                                    <User
                                        size={18}
                                        className={
                                            hasActiveShift
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}
