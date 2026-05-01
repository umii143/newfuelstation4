import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalFooter } from './GlobalFooter';
import { GlobalHeader } from './GlobalHeader';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '../shared/GlobalSearchModal';
import { MobileBottomNav } from './MobileBottomNav';

interface LayoutProps {
    children: React.ReactNode;
    currentPath: string;
    onNavigate: (path: string) => void;
}

const pageVariants = {
    initial: { opacity: 0, y: 14, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.995 },
};

const pageTransition = {
    type: 'tween' as const,
    ease: [0.22, 1, 0.36, 1],
    duration: 0.35,
};

export const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleOpenSearch = () => setIsSearchOpen(true);
        document.addEventListener('open-search', handleOpenSearch);
        return () => document.removeEventListener('open-search', handleOpenSearch);
    }, []);

    return (
        <div className="flex h-screen mesh-bg overflow-hidden font-sans transition-colors duration-300">
            <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={onNavigate} />
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 h-full flex-shrink-0">
                <Sidebar
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                    className="w-full h-full"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <GlobalHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 lg:px-8 lg:py-8 relative pb-24 lg:pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPath}
                            variants={pageVariants}
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
            <MobileBottomNav currentPath={currentPath} onNavigate={onNavigate} />
        </div>
    );
};
