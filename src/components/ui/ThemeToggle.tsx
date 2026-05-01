import { useSettingsStore } from '@/stores/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import React from 'react';

type ThemeMode = 'light' | 'glassy-white' | 'dark' | 'deep-obsidian' | 'bloomberg';

const getThemeState = (theme: string): 'light' | 'dark' | 'bloomberg' => {
    if (theme === 'bloomberg') return 'bloomberg';
    if (theme === 'dark' || theme === 'deep-obsidian') return 'dark';
    return 'light';
};

const nextTheme: Record<string, ThemeMode> = {
    light: 'deep-obsidian',
    'glassy-white': 'deep-obsidian',
    dark: 'bloomberg',
    'deep-obsidian': 'bloomberg',
    bloomberg: 'light',
};

const themeIcons = {
    light: { Icon: Sun, color: 'text-amber-500', bgGlow: 'bg-amber-400', label: 'Light' },
    dark: { Icon: Moon, color: 'text-blue-300', bgGlow: 'bg-blue-400', label: 'Dark' },
    bloomberg: { Icon: Monitor, color: 'text-amber-400', bgGlow: 'bg-amber-500', label: 'PRO' },
};

export const ThemeToggle: React.FC = () => {
    const { settings, updateSettings } = useSettingsStore();
    const state = getThemeState(settings.theme);
    const { Icon, color, bgGlow, label } = themeIcons[state];

    const toggleTheme = () => {
        const next = nextTheme[settings.theme] || 'deep-obsidian';
        updateSettings({ theme: next });
    };

    return (
        <div className="relative">
            <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={`
                    relative flex items-center justify-center w-10 h-10
                    rounded-xl overflow-hidden transition-all duration-300
                    ${state === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                        : state === 'bloomberg'
                            ? 'bg-black border border-amber-500/40 hover:border-amber-400/60'
                            : 'bg-white/50 border border-slate-200 hover:border-slate-300 shadow-sm'}
                `}
                aria-label={`Switch theme (current: ${label})`}
            >
                {/* Background glow */}
                <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${bgGlow} blur-md`} />

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, rotate: -180, scale: 0.4 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 180, scale: 0.4 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12, duration: 0.4 }}
                    >
                        <Icon className={`w-5 h-5 ${color}`} />
                    </motion.div>
                </AnimatePresence>
            </motion.button>

            {/* Bloomberg PRO badge */}
            <AnimatePresence>
                {state === 'bloomberg' && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="absolute -top-1.5 -right-1.5 px-1 py-0.5 text-[7px] font-black tracking-widest bg-amber-500 text-black rounded-sm shadow-lg"
                    >
                        PRO
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
};
