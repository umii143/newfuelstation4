import React, { useState } from 'react';
import { useAntiFraudStore } from '@/stores/antiFraudStore';
import { 
    ShieldAlert, Search, ArrowUpRight, 
    ArrowDownRight, CheckCircle2, History,
    Download, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FraudIntelligence: React.FC = () => {
    const { alerts, resolveFraudAlert } = useAntiFraudStore();
    const [view, setView] = useState<'GRID' | 'LIST'>('LIST');
    const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
    const [search, setSearch] = useState('');

    const filteredAlerts = alerts.filter(a => {
        const matchesFilter = filter === 'ALL' || a.severity === filter;
        const matchesSearch = a.details.toLowerCase().includes(search.toLowerCase()) || 
                             a.ruleId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalImpact = filteredAlerts.reduce((sum, a) => sum + a.financialImpact, 0);

    return (
        <div className="min-h-screen bg-[#050505] text-[#E5E5E5] p-6 font-sans">
            {/* Bloomberg-Style Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#2A2A2A] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-[#F5A623]">
                        <ShieldAlert size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Forensic Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Fraud Audit Command</h1>
                    <p className="text-[#888] text-sm mt-1">Real-time threat detection and financial leakage analysis</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-[#111] border border-[#2A2A2A] px-4 py-2 rounded-lg">
                        <p className="text-[10px] font-black text-[#888] uppercase mb-1">Total Group Leakage</p>
                        <p className="text-2xl font-black text-rose-500">₨{totalImpact.toLocaleString()}</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#D48D1D] text-black px-4 py-2 rounded-lg font-bold transition-all">
                        <Download size={16} />
                        <span>Export Audit</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={18} />
                    <input 
                        type="text"
                        placeholder="Search forensic logs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 focus:border-[#F5A623] outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                    >
                        <option value="ALL">All Severities</option>
                        <option value="CRITICAL">Critical Only</option>
                        <option value="WARNING">Warnings Only</option>
                    </select>
                    <div className="bg-[#111] border border-[#2A2A2A] rounded-xl p-1 flex">
                        <button 
                            onClick={() => setView('LIST')}
                            className={`p-2 rounded-lg ${view === 'LIST' ? 'bg-[#2A2A2A] text-white' : 'text-[#555]'}`}
                        >
                            <List size={18} />
                        </button>
                        <button 
                            onClick={() => setView('GRID')}
                            className={`p-2 rounded-lg ${view === 'GRID' ? 'bg-[#2A2A2A] text-white' : 'text-[#555]'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {view === 'LIST' ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-[#111] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
                                    <th className="p-4 text-[10px] font-black uppercase text-[#888]">Status</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-[#888]">Details / Forensic Path</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-[#888]">Station</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-[#888]">Rule</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-[#888]">Impact</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-[#888]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAlerts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-[#444] font-black italic uppercase tracking-widest">
                                            No Forensic Records Found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAlerts.map(alert => (
                                        <tr key={alert.alertId} className="border-b border-[#222] hover:bg-[#151515] transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        alert.status === 'OPEN' 
                                                            ? alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                                                            : 'bg-emerald-500'
                                                    }`} />
                                                    <span className="text-[10px] font-black uppercase">{alert.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-md">
                                                <p className="text-sm font-bold text-white mb-0.5">{alert.details}</p>
                                                <p className="text-[10px] text-[#555] font-mono">{new Date(alert.triggeredAt).toLocaleString()}</p>
                                            </td>
                                            <td className="p-4 text-sm font-bold text-[#F5A623]">
                                                Stn {alert.stationId?.slice(-3) || '???'}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-[#2A2A2A] text-[#888] px-2 py-1 rounded text-[10px] font-mono font-bold border border-[#3A3A3A]">
                                                    {alert.ruleId}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-black text-rose-500">-₨{alert.financialImpact.toLocaleString()}</p>
                                            </td>
                                            <td className="p-4">
                                                {alert.status === 'OPEN' ? (
                                                    <button 
                                                        onClick={() => resolveFraudAlert(alert.alertId, 'Owner', 'Investigation complete', 'RESOLVED')}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-black transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                ) : (
                                                    <History size={16} className="text-[#333]" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredAlerts.map(alert => (
                            <div key={alert.alertId} className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-5 hover:border-[#F5A623] transition-all relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 -mr-16 -mt-16 ${
                                    alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                                }`} />
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                        alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {alert.severity}
                                    </div>
                                    <span className="text-[10px] font-mono text-[#444]">{alert.ruleId}</span>
                                </div>
                                
                                <p className="text-lg font-black tracking-tighter mb-2 leading-tight">{alert.details}</p>
                                
                                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#222]">
                                    <div>
                                        <p className="text-[10px] font-black text-[#444] uppercase">Station</p>
                                        <p className="font-bold text-[#F5A623]">Station {alert.stationId?.slice(-1) || '?'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#444] uppercase">Loss Impact</p>
                                        <p className="font-black text-rose-500">₨{alert.financialImpact.toLocaleString()}</p>
                                    </div>
                                </div>

                                {alert.status === 'OPEN' && (
                                    <button 
                                        onClick={() => resolveFraudAlert(alert.alertId, 'Owner', 'Manually resolved', 'RESOLVED')}
                                        className="w-full mt-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold hover:bg-emerald-500 hover:text-black transition-all"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer / Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight size={16} className="text-rose-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#888]">Top Leakage Rules</h3>
                    </div>
                    <div className="space-y-3">
                        {['FR-02', 'FR-10', 'FR-11'].map(rule => (
                            <div key={rule} className="flex justify-between items-center p-2 bg-[#1A1A1A] rounded-lg">
                                <span className="text-xs font-bold text-[#F5A623]">{rule} Triggered</span>
                                <span className="text-xs font-black">{filteredAlerts.filter(a => a.ruleId === rule).length} Times</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#111] border border-[#2A2A2A] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowDownRight size={16} className="text-emerald-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#888]">System Efficiency</h3>
                    </div>
                    <div className="flex items-center justify-center h-24">
                        <div className="text-center">
                            <p className="text-4xl font-black text-emerald-400">98.4%</p>
                            <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-1">Audit Confidence Score</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
