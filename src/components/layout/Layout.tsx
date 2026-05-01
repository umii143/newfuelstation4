/**
 * LAYOUT v4.0 — Bloomberg-Style App Shell
 * Features: Collapsible sidebar via SidebarContext, AnimatePresence page transitions,
 * navigation progress bar, mesh gradient background, mobile drawer support.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalFooter } from './GlobalFooter';
import { GlobalHeader } from './GlobalHeader';
import { Sidebar, SidebarContext } from './Sidebar';
import { GlobalSearchModal } from '../shared/GlobalSearchModal';
import { MobileBottomNav } from './MobileBottomNav';
import { fadeUp, pageTransition } from '@/animations/variants';
import { Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    currentPath: string;
    onNavigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const handleOpenSearch = () => setIsSearchOpen(true);
        document.addEventListener('open-search', handleOpenSearch);
        return () => document.removeEventListener('open-search', handleOpenSearch);
    }, []);

    // Navigation progress bar trigger
    useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => setIsNavigating(false), 400);
        return () => clearTimeout(timer);
    }, [currentPath]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPath]);

    const handleNavigate = useCallback((path: string) => {
        onNavigate(path);
        setIsMobileMenuOpen(false);
    }, [onNavigate]);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <div className="flex h-screen mesh-bg overflow-hidden font-sans transition-colors duration-300">
                <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={handleNavigate} />

                {/* Desktop Sidebar */}
                <motion.div
                    className="hidden lg:block h-full flex-shrink-0"
                    animate={{ width: isCollapsed ? 72 : 280 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <Sidebar
                        currentPath={currentPath}
                        onNavigate={handleNavigate}
                        className="w-full h-full"
                    />
                </motion.div>

                {/* Mobile Sidebar Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <Sidebar
                            currentPath={currentPath}
                            onNavigate={handleNavigate}
                            isMobileOpen
                            onMobileClose={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Navigation Progress Bar */}
                    <AnimatePresence>
                        {isNavigating && (
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-[2px] z-[200] origin-left"
                                style={{ background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-cyan, #0EA5E9))' }}
                                initial={{ scaleX: 0, opacity: 1 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Mobile hamburger in header area */}
                    <div className="lg:hidden absolute top-4 left-3 z-[95]">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
                        >
                            <Menu size={20} className="text-slate-600 dark:text-slate-300" />
                        </motion.button>
                    </div>

                    <GlobalHeader />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 lg:px-8 lg:py-8 relative pb-24 lg:pb-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPath}
                                variants={fadeUp}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={pageTransition}
                                className="max-w-[1400px] mx-auto space-y-6"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <div className="hidden lg:block">
                        <GlobalFooter />
                    </div>
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />
            </div>
        </SidebarContext.Provider>
    );
};
