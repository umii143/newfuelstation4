import { useSettingsStore } from '@/stores/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import React from 'react';

export const ThemeToggle: React.FC = () => {
    const { settings, updateSettings } = useSettingsStore();
    const isDark = settings.theme === 'dark' || settings.theme === 'deep-obsidian';

    const toggleTheme = () => {
        updateSettings({
            theme: isDark ? 'light' : 'deep-obsidian',
        });
    };

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative flex items-center justify-center w-10 h-10 
                rounded-xl overflow-hidden transition-all duration-300
                ${isDark 
                    ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600' 
                    : 'bg-white/50 border border-slate-200 hover:border-slate-300 shadow-sm'}
            `}
        >
            {/* Background glow effects */}
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${isDark ? 'bg-blue-400 blur-md' : 'bg-amber-400 blur-md'}`} />
            
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        <Moon className="w-5 h-5 text-blue-300" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        <Sun className="w-5 h-5 text-amber-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
