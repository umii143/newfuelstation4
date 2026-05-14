/**
 * SIDEBAR v4.0 — Bloomberg-Style Collapsible Navigation
 * Features: Expand/collapse animation (280px ↔ 72px), glass-card base,
 * animated BU pill switcher, nav hover translateX(4px), active glow rail,
 * submenu stagger animation, mobile drawer with backdrop overlay.
 */
import { cn } from '@/lib/utils';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { ChevronDown, ChevronLeft, LogOut, ShieldCheck, Zap } from 'lucide-react';
import React, { useState, useCallback, createContext, useContext } from 'react';
import { cngNavItems, fuelNavItems, lubeNavItems } from '../../config/navigation';

/* ── Collapse Context (shared with Layout) ─────────────────────── */
export const SidebarContext = createContext<{
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
}>({ isCollapsed: false, setIsCollapsed: () => {} });

export const useSidebarCollapse = () => useContext(SidebarContext);

interface SidebarProps {
    currentPath: string;
    onNavigate: (path: string) => void;
    className?: string;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const BU: Record<string, { grad: string; rgb: string; label: string; hover: string; activeBg: string; openBg: string }> = {
    FUEL: { grad: 'from-blue-600 to-cyan-500', rgb: '59,130,246', label: 'Fuel Station', hover: 'rgba(59,130,246,0.08)', activeBg: 'rgba(59,130,246,0.1)', openBg: 'rgba(59,130,246,0.05)' },
    CNG: { grad: 'from-emerald-600 to-teal-500', rgb: '16,185,129', label: 'CNG Services', hover: 'rgba(16,185,129,0.08)', activeBg: 'rgba(16,185,129,0.1)', openBg: 'rgba(16,185,129,0.05)' },
    LUBE: { grad: 'from-purple-600 to-indigo-500', rgb: '139,92,246', label: 'Premium Lube', hover: 'rgba(139,92,246,0.08)', activeBg: 'rgba(139,92,246,0.1)', openBg: 'rgba(139,92,246,0.05)' },
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, className, isMobileOpen, onMobileClose }) => {
    const { settings } = useSettingsStore();
    const { user: currentUser, logout } = useAuthStore();
    const { isCollapsed, setIsCollapsed } = useSidebarCollapse();
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const bu = BU[settings.businessUnit] || BU.FUEL;

    const navItems = React.useMemo(() => {
        switch (settings.businessUnit) {
            case 'FUEL': return fuelNavItems;
            case 'CNG': return cngNavItems;
            case 'LUBE': return lubeNavItems;
            default: return [];
        }
    }, [settings.businessUnit]);

    const isPathActive = useCallback((path: string) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    }, [currentPath]);

    const handleNavigate = useCallback((path: string) => {
        onNavigate(path);
        onMobileClose?.();
    }, [onNavigate, onMobileClose]);

    const topItems = navItems.slice(0, 1);
    const opItems = navItems.slice(1);

    const sidebarContent = (
        <motion.aside
            layout
            className={cn(
                'flex flex-col h-full relative overflow-hidden',
                'bg-white/80 dark:bg-slate-950/80 bloomberg:bg-black',
                'backdrop-blur-xl border-r transition-colors duration-300',
                'border-slate-200/70 dark:border-slate-800/50',
                'shadow-[2px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[2px_0_24px_rgba(0,0,0,0.4)]',
                className
            )}
            style={{ width: isMobileOpen ? 280 : undefined }}
        >
            {/* BU tinted gradient wash */}
            <div
                className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none opacity-[0.04]"
                style={{ background: `linear-gradient(160deg, rgb(${bu.rgb}) 0%, transparent 100%)` }}
            />

            {/* ── LOGO ─────────────────────────────────────── */}
            <div className="relative px-5 pt-6 pb-4 flex items-center gap-3">
                <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${bu.grad} flex items-center justify-center shadow-lg flex-shrink-0`}
                    style={{ boxShadow: `0 6px 20px rgba(${bu.rgb},0.35)` }}
                >
                    <Zap size={18} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                </div>
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                        >
                            <h1 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-[15px] leading-tight">
                                Motorway
                            </h1>
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                Enterprise
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Live pulse dot */}
                {!isCollapsed && (
                    <div className="ml-auto flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: `rgb(${bu.rgb})` }} />
                            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: `rgb(${bu.rgb})` }} />
                        </span>
                    </div>
                )}
            </div>

            {/* ── USER CARD ────────────────────────────────── */}
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative mx-3 mb-3"
                >
                    <div
                        className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border"
                        style={{
                            background: `linear-gradient(135deg, rgba(${bu.rgb},0.07) 0%, rgba(${bu.rgb},0.02) 100%)`,
                            borderColor: `rgba(${bu.rgb},0.2)`,
                        }}
                    >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bu.grad} flex items-center justify-center text-white text-sm font-black shadow-inner flex-shrink-0`}>
                            {(currentUser as any)?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                                {(currentUser as any)?.name || 'Admin User'}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <ShieldCheck size={9} style={{ color: `rgb(${bu.rgb})` }} />
                                <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: `rgb(${bu.rgb})` }}>
                                    {bu.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Collapsed: avatar only */}
            {isCollapsed && (
                <div className="flex justify-center mb-3">
                    <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bu.grad} flex items-center justify-center text-white text-sm font-black shadow-inner`}
                        title={(currentUser as any)?.name || 'Admin'}
                    >
                        {(currentUser as any)?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                </div>
            )}

            {/* ── DIVIDER ──────────────────────────────────── */}
            <div className="mx-4 mb-2 h-px bg-slate-100 dark:bg-slate-800" />

            {/* ── NAVIGATION ───────────────────────────────── */}
            <LayoutGroup>
                <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 custom-scrollbar">
                    {topItems.map(item => (
                        <NavItem
                            key={item.label} item={item} currentPath={currentPath} onNavigate={handleNavigate}
                            expandedMenu={expandedMenu} setExpandedMenu={setExpandedMenu}
                            isPathActive={isPathActive} bu={bu} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                    {opItems.length > 0 && (
                        <>
                            {!isCollapsed && (
                                <div className="px-3 pt-4 pb-1.5">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</p>
                                </div>
                            )}
                            {isCollapsed && <div className="my-2 mx-2 h-px bg-slate-200 dark:bg-slate-800" />}
                            {opItems.map(item => (
                                <NavItem
                                    key={item.label} item={item} currentPath={currentPath} onNavigate={handleNavigate}
                                    expandedMenu={expandedMenu} setExpandedMenu={setExpandedMenu}
                                    isPathActive={isPathActive} bu={bu} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </>
                    )}
                </nav>
            </LayoutGroup>

            {/* ── COLLAPSE TOGGLE ──────────────────────────── */}
            <div className="hidden lg:block px-3 pb-1">
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                    <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                        <ChevronLeft size={16} />
                    </motion.div>
                    {!isCollapsed && <span className="text-[11px] font-bold tracking-wide">Collapse</span>}
                </motion.button>
            </div>

            {/* ── SIGN OUT ────────────────────────────────── */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { logout(); window.location.href = '/'; }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all group hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 flex items-center justify-center transition-colors flex-shrink-0">
                        <LogOut size={15} className="text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors leading-tight">Sign Out</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">End Session</p>
                        </div>
                    )}
                </motion.button>
            </div>
        </motion.aside>
    );

    // Desktop: inline sidebar
    if (!isMobileOpen) return sidebarContent;

    // Mobile: drawer with backdrop overlay
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={onMobileClose}
            />
            <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 z-[100] lg:hidden"
            >
                {sidebarContent}
            </motion.div>
        </>
    );
};

/* ── NavItem Component ─────────────────────────────────────────── */
interface NavItemProps {
    item: any;
    currentPath: string;
    onNavigate: (path: string) => void;
    expandedMenu: string | null;
    setExpandedMenu: (l: string | null) => void;
    isPathActive: (path: string) => boolean;
    bu: (typeof BU)['FUEL'];
    hoveredItem: string | null;
    setHoveredItem: (l: string | null) => void;
    isCollapsed: boolean;
}

function NavItem({ item, currentPath, onNavigate, expandedMenu, setExpandedMenu, isPathActive, bu, hoveredItem, setHoveredItem, isCollapsed }: NavItemProps) {
    const isActive = isPathActive(item.path);
    const isExpanded = expandedMenu === item.label;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isHovered = hoveredItem === item.label;
    const Icon = item.icon;

    const showActiveFill = isActive && !hasSubItems;
    const showOpenFill = hasSubItems && isExpanded;

    return (
        <div className="relative">
            {/* Active left-rail indicator */}
            {showActiveFill && (
                <motion.div
                    layoutId="activeRail"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full z-10"
                    style={{
                        background: `linear-gradient(to bottom, rgb(${bu.rgb}), rgba(${bu.rgb},0.4))`,
                        boxShadow: `0 0 12px rgba(${bu.rgb},0.6)`,
                    }}
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                />
            )}

            {/* Open indicator for expanded parents */}
            {showOpenFill && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full opacity-60" style={{ background: `rgb(${bu.rgb})` }} />
            )}

            <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={!isCollapsed ? { x: 4 } : undefined}
                onHoverStart={() => setHoveredItem(item.label)}
                onHoverEnd={() => setHoveredItem(null)}
                onClick={() => {
                    if (hasSubItems && !isCollapsed) {
                        setExpandedMenu(expandedMenu === item.label ? null : item.label);
                    } else {
                        onNavigate(item.path);
                    }
                }}
                animate={{
                    backgroundColor: showActiveFill ? bu.activeBg : showOpenFill ? bu.openBg : isHovered ? bu.hover : 'rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.08 }}
                className={cn(
                    'w-full flex items-center pl-4 pr-3 py-2.5 rounded-xl transition-colors duration-150 group outline-none',
                    isCollapsed ? 'justify-center px-0' : 'justify-between',
                    showActiveFill ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                )}
                title={isCollapsed ? item.label : undefined}
            >
                <div className={cn('flex items-center', isCollapsed ? 'gap-0' : 'gap-3')}>
                    <motion.div
                        animate={{
                            backgroundColor: showActiveFill ? `rgba(${bu.rgb},0.15)` : showOpenFill ? `rgba(${bu.rgb},0.1)` : isHovered ? `rgba(${bu.rgb},0.1)` : 'rgba(241,245,249,1)',
                            boxShadow: showActiveFill ? `0 2px 10px rgba(${bu.rgb},0.25)` : isHovered ? `0 1px 6px rgba(${bu.rgb},0.15)` : 'none',
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 dark:bg-slate-800"
                    >
                        <Icon
                            size={16} strokeWidth={showActiveFill ? 2.5 : 1.8}
                            style={{ color: showActiveFill || showOpenFill || isHovered ? `rgb(${bu.rgb})` : '#94a3b8', transition: 'color 0.15s' }}
                        />
                    </motion.div>

                    {!isCollapsed && (
                        <span
                            className={cn(
                                'text-[13.5px] tracking-tight transition-all duration-150',
                                showActiveFill ? 'font-extrabold' : showOpenFill ? 'font-bold' : isHovered ? 'font-semibold text-slate-800 dark:text-slate-200' : 'font-semibold'
                            )}
                            style={showActiveFill || showOpenFill ? { color: `rgb(${bu.rgb})` } : isHovered ? { color: `rgba(${bu.rgb},0.85)` } : undefined}
                        >
                            {item.label}
                        </span>
                    )}
                </div>

                {hasSubItems && !isCollapsed && (
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                        <ChevronDown size={14} style={{ color: showOpenFill || isHovered ? `rgb(${bu.rgb})` : '#cbd5e1', transition: 'color 0.15s' }} />
                    </motion.div>
                )}
            </motion.button>

            {/* ── Sub-menu ── */}
            <AnimatePresence initial={false}>
                {hasSubItems && isExpanded && !isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <motion.div
                            className="pl-[3.1rem] pr-2 py-1.5 space-y-0.5 relative"
                            initial="initial"
                            animate="animate"
                            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                        >
                            {/* Gradient connecting line */}
                            <div className="absolute left-[2rem] top-0 bottom-2 w-px" style={{ background: `linear-gradient(to bottom, rgba(${bu.rgb},0.4), transparent)` }} />
                            {item.subItems.map((sub: any) => {
                                const isSubActive = currentPath === sub.path;
                                return (
                                    <motion.button
                                        key={sub.path}
                                        variants={{ initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } }}
                                        whileHover={{ x: 3, color: `rgb(${bu.rgb})` }}
                                        onClick={() => onNavigate(sub.path)}
                                        className={cn(
                                            'w-full text-left py-1.5 px-3 rounded-lg text-[12.5px] font-semibold transition-all relative',
                                            isSubActive ? 'font-bold' : 'text-slate-400 dark:text-slate-500'
                                        )}
                                        style={isSubActive ? { color: `rgb(${bu.rgb})`, background: `rgba(${bu.rgb},0.08)` } : undefined}
                                    >
                                        <span
                                            className="absolute left-[-0.85rem] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border-2 border-white dark:border-slate-950"
                                            style={{
                                                background: isSubActive ? `rgb(${bu.rgb})` : '#cbd5e1',
                                                boxShadow: isSubActive ? `0 0 6px rgba(${bu.rgb},0.5)` : 'none',
                                                transition: 'all 0.15s',
                                            }}
                                        />
                                        {sub.label}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
