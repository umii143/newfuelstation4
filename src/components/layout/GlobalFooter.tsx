import { motion } from 'framer-motion';
import { ExternalLink, MessageCircle } from 'lucide-react';
import React from 'react';

export const GlobalFooter: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full shrink-0 border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-5 lg:px-8 h-11 flex items-center justify-between gap-4">
                {/* Left: copyright */}
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    © {year} Motorway Enterprise. All rights reserved.
                </p>

                {/* Center / Main: Powered by */}
                <motion.a
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    href="https://wa.me/923168432329"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group"
                >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Powered by
                    </span>
                    <span
                        className="text-[12px] font-extrabold tracking-tight"
                        style={{
                            background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Umar Ali
                    </span>
                    <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                        className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_2px_10px_rgba(16,185,129,0.5)] group-hover:shadow-[0_4px_16px_rgba(16,185,129,0.7)] transition-shadow"
                    >
                        <MessageCircle size={10} className="text-white" />
                    </motion.div>
                </motion.a>

                {/* Right: version + link */}
                <div className="flex items-center gap-3 hidden sm:flex">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2 py-0.5 rounded-full border border-slate-200">
                        v4.0
                    </span>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        href="https://wa.me/923168432329"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors"
                    >
                        Contact <ExternalLink size={9} />
                    </motion.a>
                </div>
            </div>
        </footer>
    );
};
