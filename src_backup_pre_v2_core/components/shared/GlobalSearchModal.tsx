import { fuelNavItems, lubeNavItems, cngNavItems } from '@/config/navigation';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Command,
    LogOut,
    Moon,
    Search,
    Sun,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export const GlobalSearchModal = ({ isOpen, onClose, onNavigate }: { isOpen: boolean, onClose: () => void, onNavigate: (p: string) => void }) => {
    const { settings, updateSettings } = useSettingsStore();
    const { logout } = useAuthStore();
    const { addToast } = useToastStore();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    // Aggregate items based on BU
    const navItems = settings.businessUnit === 'FUEL' ? fuelNavItems 
        : settings.businessUnit === 'CNG' ? cngNavItems 
        : lubeNavItems;

    // Flatten nested navigation for search
    const searchableItems: {label: string, path?: string, parent: string, type: 'page' | 'command', action?: () => void, icon?: any}[] = [];
    
    // 1. Add Navigation Pages
    navItems.forEach(item => {
        if (item.subItems) {
            item.subItems.forEach(sub => searchableItems.push({label: sub.label, path: sub.path, parent: item.label, type: 'page'}));
        } else {
            searchableItems.push({label: item.label, path: item.path, parent: 'Quick Links', type: 'page'});
        }
    });

    // 2. Add System Commands
    const isDark = settings.theme === 'dark' || settings.theme === 'deep-obsidian';
    const commands = [
        {
            label: `Switch to ${isDark ? 'Light' : 'Dark'} Mode`,
            parent: 'System',
            type: 'command' as const,
            icon: isDark ? Sun : Moon,
            action: () => {
                updateSettings({ theme: isDark ? 'light' : 'dark' });
                addToast({ message: `Theme switched to ${isDark ? 'Light' : 'Dark'}`, title: 'Theme', type: 'info' });
            }
        },
        {
            label: 'Sign Out / Logout',
            parent: 'Auth',
            type: 'command' as const,
            icon: LogOut,
            action: () => {
                if (window.confirm('Are you sure you want to log out?')) logout();
            }
        }
    ];

    const filtered = query.trim() === '' 
        ? [] 
        : [...searchableItems, ...commands].filter(item => 
            item.label.toLowerCase().includes(query.toLowerCase()) || 
            item.parent.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filtered.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    const item = filtered[selectedIndex];
                    if (item.type === 'page' && item.path) {
                        onNavigate(item.path);
                        onClose();
                    } else if (item.type === 'command' && item.action) {
                        item.action();
                        onClose();
                    }
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onNavigate, onClose]);

    useEffect(() => {
        const cmdK = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-search'));
            }
        };
        window.addEventListener('keydown', cmdK);
        return () => window.removeEventListener('keydown', cmdK);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl z-[101] px-4"
                    >
                        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[24px] shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-white/10 overflow-hidden relative">
                            {/* Inner glow accent */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                            
                            <div className="relative flex items-center px-5 py-4 border-b border-slate-100/50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                                <Search className="w-5 h-5 text-blue-500 animate-pulse" />
                                <input 
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search commands, modules, and actions..."
                                    className="w-full bg-transparent border-none outline-none px-4 text-lg font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                />
                                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-400 tracking-widest">
                                    <Command size={12} /> K
                                </div>
                                <button onClick={onClose} className="ml-3 sm:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <div className="p-3 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                {query === '' ? (
                                    <div className="px-8 py-12 text-center flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                            <Command size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-tight">
                                            Type a command or search for a module...
                                        </p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="px-8 py-12 text-center flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-300 dark:text-rose-500/50">
                                            <X size={24} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-tight">
                                            No modules found for "<span className="text-slate-700 dark:text-slate-300 font-bold">{query}</span>"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filtered.map((item, i) => {
                                            const isActive = i === selectedIndex;
                                            const Icon = item.icon || (item.type === 'command' ? Command : Search);
                                            
                                            return (
                                                <motion.button 
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    key={i}
                                                    onMouseEnter={() => setSelectedIndex(i)}
                                                    onClick={() => {
                                                        if (item.type === 'page' && item.path) {
                                                            onNavigate(item.path);
                                                        } else if (item.type === 'command' && item.action) {
                                                            item.action();
                                                        }
                                                        onClose();
                                                    }}
                                                    className={clsx(
                                                        "relative w-full flex items-center justify-between p-4 rounded-[16px] text-left transition-all group overflow-hidden",
                                                        isActive 
                                                            ? "bg-blue-500/10 dark:bg-blue-500/20 translate-x-1" 
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    {/* Selection indicator */}
                                                    {isActive && (
                                                        <motion.div 
                                                            layoutId="search-active"
                                                            className="absolute inset-y-0 left-0 w-1 bg-blue-500"
                                                        />
                                                    )}
                                                    
                                                    <div className="relative z-10 flex items-center gap-4">
                                                        <div className={clsx(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all",
                                                            isActive 
                                                                ? "bg-blue-500 text-white border-blue-400 scale-110 shadow-lg shadow-blue-500/20" 
                                                                : "bg-white dark:bg-slate-700 text-slate-400 border-slate-100 dark:border-slate-600"
                                                        )}>
                                                            <Icon size={18} />
                                                        </div>
                                                        <div>
                                                            <p className={clsx(
                                                                "text-sm font-bold leading-none",
                                                                isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"
                                                            )}>{item.label}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{item.parent}</span>
                                                                {item.type === 'command' && (
                                                                    <span className="text-[9px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Command</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={clsx(
                                                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all transform",
                                                        isActive ? "bg-white dark:bg-slate-700 shadow-sm translate-x-0" : "opacity-0 translate-x-2"
                                                    )}>
                                                        <ArrowRight size={14} className="text-blue-500" />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
