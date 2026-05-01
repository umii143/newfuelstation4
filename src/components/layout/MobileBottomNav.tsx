import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/stores/authStore';
import { fuelNavItems, cngNavItems, lubeNavItems } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

const BU_ACCENT: Record<string, { rgb: string; gradient: string }> = {
    FUEL: { rgb: '59,130,246', gradient: 'from-blue-500 to-cyan-500' },
    CNG: { rgb: '16,185,129', gradient: 'from-emerald-500 to-teal-500' },
    LUBE: { rgb: '139,92,246', gradient: 'from-purple-500 to-indigo-500' },
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, onNavigate }) => {
    const { settings } = useSettingsStore();
    const bu = BU_ACCENT[settings.businessUnit] || BU_ACCENT.FUEL;

    const navItems = React.useMemo(() => {
        switch (settings.businessUnit) {
            case 'FUEL': return fuelNavItems;
            case 'CNG': return cngNavItems;
            case 'LUBE': return lubeNavItems;
            default: return fuelNavItems;
        }
    }, [settings.businessUnit]);

    // Use top 5 items for bottom bar
    const bottomItems = navItems.slice(0, 5);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
            {/* iOS-style frosted glass */}
            <div
                className="mx-3 mb-3 rounded-2xl border border-white/20 dark:border-slate-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(28px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
                }}
            >
                <style>{`
                    .dark .mobile-bottom-nav-glass { background: rgba(15,23,42,0.78) !important; }
                    .bloomberg .mobile-bottom-nav-glass { background: #000000 !important; backdrop-filter: none !important; border: 1px solid #2A2A2A !important; border-bottom: none !important; border-radius: 0 !important; }
                `}</style>
                <div className="mobile-bottom-nav-glass rounded-2xl bloomberg:rounded-none">
                    <div className="flex justify-around items-center px-2 py-2.5">
                        {bottomItems.map((item) => {
                            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                            const Icon = item.icon;
                            return (
                                <motion.button
                                    key={item.label}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => onNavigate(item.path)}
                                    className="relative w-16 h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors outline-none"
                                >
                                    {/* BU-colored active glow pill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobileNavPill"
                                            className="absolute inset-0 rounded-xl"
                                            style={{
                                                background: `rgba(${bu.rgb}, 0.12)`,
                                                boxShadow: `0 0 16px rgba(${bu.rgb}, 0.15)`,
                                            }}
                                            transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                    {/* Active top bar indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobileNavTopBar"
                                            className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full"
                                            style={{ background: `rgb(${bu.rgb})` }}
                                            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                                        />
                                    )}
                                    <motion.div
                                        animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    >
                                        <Icon
                                            size={20}
                                            className="relative z-10 transition-colors"
                                            style={{
                                                color: isActive ? `rgb(${bu.rgb})` : undefined,
                                            }}
                                            strokeWidth={isActive ? 2.5 : 1.8}
                                        />
                                    </motion.div>
                                    <span
                                        className={cn(
                                            "text-[9px] relative z-10 transition-all font-semibold tracking-tight",
                                            !isActive && "text-slate-500 dark:text-slate-400"
                                        )}
                                        style={isActive ? { color: `rgb(${bu.rgb})`, fontWeight: 800 } : undefined}
                                    >
                                        {item.label.split(' ')[0]}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
