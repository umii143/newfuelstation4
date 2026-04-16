import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { GlobalFooter } from './GlobalFooter';
import { GlobalHeader } from './GlobalHeader';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    currentPath: string;
    onNavigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPath, onNavigate }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [currentPath]);

    const MobileSidebarOverlay = () => (
        <AnimatePresence>
            {isMobileSidebarOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
                    >
                        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 h-full flex-shrink-0">
                <Sidebar
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                    className="w-full h-full"
                />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebarOverlay />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <GlobalHeader onMenuToggle={() => setIsMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 px-5 py-6 lg:px-8 lg:py-8 relative">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
                <GlobalFooter />
            </div>
        </div>
    );
};
