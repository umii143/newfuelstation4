import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { useFuelStore } from '@/stores/fuelStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
    Bell,
    ChevronDown,
    Clock,
    Fingerprint,
    Globe,
    LogOut,
    Search,
    Settings,
    Sparkles,
    User,
    X,
    Command,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export function GlobalHeader() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showBusinessUnitMenu, setShowBusinessUnitMenu] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const { user: currentUser, logout, authMethod } = useAuthStore();
    const { settings } = useSettingsStore();
    const [isScrolled, setIsScrolled] = useState(false);

    // Scroll-aware shadow
    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;
        const handler = () => setIsScrolled(main.scrollTop > 8);
        main.addEventListener('scroll', handler, { passive: true });
        return () => main.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            const time = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
            setCurrentTime(time);

            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 17) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };

        updateGreeting();
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    const fuelState = useFuelStore(state => state);

    const notifications = useMemo(() => {
        const notifs = [];
        let idCounter = 1;

        // Alerts from fuel tanks
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

        // Active shifts
        const openShifts = fuelState.shifts.filter((s: any) => s.status === 'OPEN');
        openShifts.forEach((shift: any) => {
            notifs.push({
                id: idCounter++,
                title: 'Active Shift',
                message: `Shift ${shift.id} is currently open`,
                time: 'In progress',
                unread: false,
                type: 'shift',
            });
        });

        // Default OK state
        if (notifs.length === 0) {
            notifs.push({
                id: idCounter++,
                title: 'System Optimal',
                message: 'All systems running normally',
                time: 'Just now',
                unread: false,
                type: 'system',
            });
        }

        return notifs;
    }, [fuelState]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const businessUnitConfig = {
        FUEL: {
            name: 'Fuel Station',
            color: 'from-blue-600 to-cyan-600',
            icon: '⛽',
            accent: 'bg-blue-500',
        },
        CNG: {
            name: 'CNG Services',
            color: 'from-emerald-600 to-teal-600',
            icon: '🔋',
            accent: 'bg-emerald-500',
        },
        LUBE: {
            name: 'Premium Lube',
            color: 'from-purple-600 to-indigo-600',
            icon: '🛢️',
            accent: 'bg-indigo-500',
        },
    };

    const currentBU =
        businessUnitConfig[settings.businessUnit as keyof typeof businessUnitConfig] ||
        businessUnitConfig.FUEL;

    return (
        <header className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-slate-950/90 border-gray-200/60 dark:border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'bg-white/70 dark:bg-slate-950/60 border-gray-200/30 dark:border-slate-800/30 shadow-none'}`}>
            <div className="px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* LEFT: Mobile Menu + Greeting + BU Switcher */}
                <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                    {/* Mobile Search Button - Minimal */}
                    <button
                        onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
                        className="lg:hidden p-2 -ml-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Quick Greeting & Time Clock - Hidden on Mobile */}
                    <div className="hidden md:flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                                {greeting}, {(currentUser as any)?.name || 'User'}
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100/80 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-700/50">
                                {authMethod === 'GOOGLE' ? (
                                    <Globe className="w-3 h-3 text-blue-500" />
                                ) : authMethod === 'PIN' ? (
                                    <Fingerprint className="w-3 h-3 text-purple-500" />
                                ) : (
                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                )}
                                <span className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                                    {authMethod || 'SECURED'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-gray-500 dark:text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{currentTime}</span>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-8 bg-gray-200/60 dark:bg-slate-700/60 mx-2" />

                    {/* Elite Business Unit Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBusinessUnitMenu(!showBusinessUnitMenu)}
                            className="group flex items-center gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-gray-200/80 dark:border-slate-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:border-white dark:hover:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${currentBU.color} flex items-center justify-center shadow-inner relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                                <span className="text-sm sm:text-base relative z-10 drop-shadow-sm">
                                    {currentBU.icon}
                                </span>
                            </div>
                            <div className="text-left flex flex-col justify-center pr-1 sm:pr-2">
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-slate-500 mb-0.5 leading-none">
                                    Active Unit
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white leading-none tracking-tight">
                                    {currentBU.name}
                                </span>
                            </div>
                            <div className="pr-2 lg:pr-3">
                                <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 group-hover:bg-gray-200 dark:group-hover:bg-slate-600 transition-colors`}
                                >
                                    <ChevronDown
                                        className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${showBusinessUnitMenu ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </button>

                        <AnimatePresence>
                            {showBusinessUnitMenu && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]"
                                        onClick={() => setShowBusinessUnitMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                        className="absolute left-0 top-full mt-3 w-[300px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl p-2 z-50"
                                    >
                                        <div className="px-3 pt-3 pb-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                                            Switch Division
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {Object.entries(businessUnitConfig).map(
                                                ([key, config]) => {
                                                    const isActive = settings.businessUnit === key;
                                                    return (
                                                        <button
                                                            key={key}
                                                            onClick={() => {
                                                                useSettingsStore
                                                                    .getState()
                                                                    .updateSettings({
                                                                        businessUnit: key as
                                                                            | 'FUEL'
                                                                            | 'CNG'
                                                                            | 'LUBE',
                                                                    });
                                                                setShowBusinessUnitMenu(false);
                                                                // Soft SPA navigate to root instead of full reload
                                                                window.history.pushState({}, '', '/');
                                                                window.dispatchEvent(new Event('popstate'));
                                                            }}
                                                            className={`relative flex items-center gap-4 w-full p-3 rounded-[20px] transition-all duration-200 text-left group
                                                            ${isActive ? 'bg-gray-50 dark:bg-slate-800' : 'hover:bg-gray-50/80 dark:hover:bg-slate-800/60'}
                                                        `}
                                                        >
                                                            <div
                                                                className={`w-11 h-11 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm relative overflow-hidden transition-transform group-hover:scale-105`}
                                                            >
                                                                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                                                                <span className="text-xl relative z-10 drop-shadow-sm">
                                                                    {config.icon}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p
                                                                    className={`text-sm tracking-tight font-bold leading-tight ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}
                                                                >
                                                                    {config.name}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-0.5 uppercase tracking-widest">
                                                                    {key}
                                                                </p>
                                                            </div>
                                                            {isActive && (
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] mr-2" />
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* MIDDLE: Search Bar - Minimal Sleek */}
                <div className="hidden lg:flex flex-1 max-w-lg mx-4">
                    <button 
                        onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
                        className="relative w-full group flex items-center text-left"
                    >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border text-sm font-medium border-slate-200/60 dark:border-slate-700/60 rounded-full pl-11 pr-10 py-2.5 transition-all text-slate-500 flex justify-between items-center">
                            <span>Search everything...</span>
                            <span className="flex items-center gap-1 text-[10px] bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase tracking-widest"><Command size={10} /> K</span>
                        </div>
                    </button>
                </div>

                {/* RIGHT: Notifications & User Profile */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Master Dark Mode Toggle */}
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>

                    {/* Notification Bell - Clean Circle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                        className="absolute right-0 mt-3 w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden z-50"
                                    >
                                        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                                                Notifications
                                            </h3>
                                            <Badge count={unreadCount} />
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto p-2">
                                            {notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-3 rounded-2xl mb-1 cursor-pointer transition-colors flex gap-4 ${
                                                        notification.unread
                                                            ? 'bg-blue-50/50 hover:bg-blue-50/80'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notification.unread ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-transparent'}`}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile Menu - Ultra Sleek */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-1 pr-3 lg:pr-4 rounded-full bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all focus:outline-none group"
                        >
                            <div
                                className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br ${currentBU.color} flex items-center justify-center text-white shadow-sm`}
                            >
                                <span className="text-xs font-bold">
                                    {(currentUser as any)?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                                    {(currentUser as any)?.name || 'Admin'}
                                </p>
                            </div>
                            <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block group-hover:text-gray-600 transition-colors" />
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                        className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200/60 dark:border-slate-700/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden z-50 p-2"
                                    >
                                        <div className="px-4 py-3 mb-2 bg-gray-50/80 dark:bg-slate-800/80 rounded-2xl">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                                                {(currentUser as any)?.name || 'Admin User'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                                                {currentUser?.email || 'System Session'}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group">
                                                <User className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                    My Profile
                                                </span>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const newTheme = settings.theme === 'dark' || settings.theme === 'deep-obsidian' ? 'glassy-white' : 'dark';
                                                    useSettingsStore.getState().updateSettings({ theme: newTheme });
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                                        Dark Mode
                                                    </span>
                                                </div>
                                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${settings.theme === 'dark' || settings.theme === 'deep-obsidian' ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${settings.theme === 'dark' || settings.theme === 'deep-obsidian' ? 'translate-x-4' : ''}`} />
                                                </div>
                                            </button>
                                        </div>

                                        <div className="my-1.5 border-t border-gray-100 dark:border-slate-800" />

                                        <div className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    if (
                                                        !window.confirm(
                                                            'This will erase all local data. Are you sure?'
                                                        )
                                                    )
                                                        return;
                                                    useAuthStore.getState().clearAllData();
                                                    window.location.href = '/';
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left transition-colors group"
                                            >
                                                <X className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                                    Clear Data
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    window.location.href = '/';
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left transition-colors group"
                                            >
                                                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-500" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                                                    Sign Out
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Helper
function Badge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
            {count} New
        </span>
    );
}
