/**
 * LIVE TICKER v4.0 — Bloomberg Pro Mode
 * Horizontal scrolling ticker displaying real-time business metrics.
 * Only visible when Bloomberg mode is active.
 */
import React from 'react';
import { motion } from 'framer-motion';

// Mock data for the ticker - in production this would come from Zustand stores
const TICKER_ITEMS = [
    { label: 'FUEL VOL', value: '14,250 L', delta: '+2.4%', positive: true },
    { label: 'CNG KG', value: '4,120 KG', delta: '+1.1%', positive: true },
    { label: 'LUBE REV', value: 'Rs 145K', delta: '-0.5%', positive: false },
    { label: 'CASH BAL', value: 'Rs 2.4M', delta: '+5.0%', positive: true },
    { label: 'ACTIVE SHIFT', value: 'S-1042', status: 'LIVE' },
    { label: 'HSD RATE', value: 'Rs 293.4', delta: '0.0%', positive: null },
    { label: 'PMG RATE', value: 'Rs 288.6', delta: '0.0%', positive: null },
];

export const LiveTicker: React.FC = () => {
    return (
        <div className="hidden lg:flex w-full overflow-hidden bg-black border-y border-[#2A2A2A] h-8 items-center text-[11px] font-data tracking-wider">
            {/* Ticker label */}
            <div className="px-4 h-full flex items-center bg-[#111] border-r border-[#2A2A2A] text-[#F5A623] z-10 shadow-[4px_0_12px_rgba(0,0,0,0.8)]">
                <span className="flex items-center gap-2 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse-dot" />
                    LIVE
                </span>
            </div>

            {/* Scrolling content */}
            <div className="flex-1 overflow-hidden relative flex">
                <motion.div
                    className="flex whitespace-nowrap min-w-max items-center"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20
                    }}
                >
                    {/* Render items twice for seamless loop */}
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <div key={i} className="flex items-center px-6 gap-2 border-r border-[#2A2A2A]/40">
                            <span className="text-[#888]">{item.label}</span>
                            <span className="text-white font-bold">{item.value}</span>
                            {item.status ? (
                                <span className="text-[#00D4FF] bg-[#00D4FF]/10 px-1 rounded-sm">{item.status}</span>
                            ) : (
                                <span className={item.positive ? 'text-[#00FF41]' : item.positive === false ? 'text-[#FF4444]' : 'text-[#888]'}>
                                    {item.delta}
                                    {item.positive && ' ▲'}
                                    {item.positive === false && ' ▼'}
                                    {item.positive === null && ' ▬'}
                                </span>
                            )}
                        </div>
                    ))}
                </motion.div>
                
                {/* Gradient fades on edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
            </div>
        </div>
    );
};
