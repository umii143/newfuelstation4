import React, { useMemo } from 'react';
import { Card, Badge } from '@/components/ui';
import { useFuelStore } from '@/stores/fuelStore';


import { useRateImpactStore } from '@/stores/rateImpactStore';
import { TrendingDown, ShieldAlert, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export const FinancialIntelligence: React.FC = () => {
    const { shifts } = useFuelStore();
    const { getLatestImpact } = useRateImpactStore();
    
    
    // Derived state for the dashboard
    const closedShifts = useMemo(() => shifts.filter(s => s.status === 'CLOSED'), [shifts]);
    
    const salesmanTrustScores = useMemo(() => {
        const scores: Record<string, { totalCashHandled: number; totalShortage: number; totalExcess: number; shiftCount: number; name: string }> = {};
        
        closedShifts.forEach(shift => {
            if (!scores[shift.staffId]) {
                scores[shift.staffId] = { totalCashHandled: 0, totalShortage: 0, totalExcess: 0, shiftCount: 0, name: shift.staffName };
            }
            const s = scores[shift.staffId];
            s.shiftCount++;
            
            // Expected cash is total revenue minus non-cash payments/expenses
            const nonCash = (shift.credits || 0) + (shift.digitalCash || 0) + (shift.bankDeposits || 0);
            const expectedCash = shift.totalRevenue - nonCash;
            const actualCash = shift.actualCash || 0;
            
            s.totalCashHandled += expectedCash;
            
            const variance = actualCash - expectedCash;
            if (variance < 0) {
                s.totalShortage += Math.abs(variance);
            } else if (variance > 0) {
                s.totalExcess += variance;
            }
        });
        
        return Object.values(scores).map(s => {
            const variancePercent = s.totalCashHandled > 0 ? (s.totalShortage / s.totalCashHandled) * 100 : 0;
            let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
            if (variancePercent > 3) status = 'CRITICAL';
            else if (variancePercent > 1) status = 'WARNING';
            
            return { ...s, variancePercent, status };
        }).sort((a, b) => b.totalShortage - a.totalShortage);
    }, [closedShifts]);

    const latestRateImpact = getLatestImpact();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Financial Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Forensic tracking of every rupee to detect and prevent revenue leaks
                    </p>
                </div>
            </div>

            {/* Salesman Accountability */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldAlert size={20} className="text-indigo-500" /> 
                    Salesman Trust Scores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salesmanTrustScores.map((score, idx) => (
                        <Card key={idx} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl overflow-hidden relative">
                            <div className={clsx("absolute top-0 left-0 w-1.5 h-full", 
                                score.status === 'SAFE' ? 'bg-emerald-500' : 
                                score.status === 'WARNING' ? 'bg-amber-500' : 'bg-rose-500'
                            )} />
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{score.name}</h3>
                                    <p className="text-xs font-bold text-slate-400">{score.shiftCount} Shifts Audited</p>
                                </div>
                                <Badge className={clsx(
                                    score.status === 'SAFE' ? 'bg-emerald-100 text-emerald-700' : 
                                    score.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                )}>
                                    {score.status}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total Cash Handled</span>
                                    <span className="font-bold text-slate-800">₨{score.totalCashHandled.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total Shortage Leak</span>
                                    <span className="font-bold text-rose-600">₨{score.totalShortage.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Variance Rate</span>
                                    <span className={clsx("font-black", 
                                        score.status === 'CRITICAL' ? 'text-rose-600' : 'text-slate-800'
                                    )}>{score.variancePercent.toFixed(2)}%</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {salesmanTrustScores.length === 0 && (
                        <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-slate-500">No closed shifts available for audit.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Shift-Level P&L Overview */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-500" /> 
                    Recent Shift Autopsies
                </h2>
                <div className="space-y-4">
                    {closedShifts.slice(0, 5).map(shift => {
                        const nonCash = (shift.credits || 0) + (shift.digitalCash || 0) + (shift.bankDeposits || 0);
                        const expectedCash = shift.totalRevenue - nonCash;
                        const actualCash = shift.actualCash || 0;
                        const variance = actualCash - expectedCash;
                        const isShort = variance < -10; // Allowing 10 rupees grace
                        
                        return (
                            <Card key={shift.shiftId} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold", isShort ? 'bg-rose-500' : 'bg-emerald-500')}>
                                        {isShort ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Shift #{shift.shiftId}</h4>
                                        <p className="text-sm text-slate-500">{shift.staffName} • {new Date(shift.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 text-right">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Revenue</p>
                                        <p className="font-bold text-slate-800">₨{shift.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cash Expected</p>
                                        <p className="font-bold text-slate-800">₨{expectedCash.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Variance</p>
                                        <p className={clsx("font-black", isShort ? 'text-rose-600' : 'text-emerald-600')}>
                                            {variance < 0 ? '-' : '+'}₨{Math.abs(variance).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Rate Change Inventory Impact */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-500" /> 
                    Latest Rate Change Impact
                </h2>
                {latestRateImpact ? (
                    <Card className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Inventory Value Before</p>
                                <p className="text-2xl font-black text-slate-800">₨{latestRateImpact.totalOldValue.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Inventory Value After</p>
                                <p className="text-2xl font-black text-slate-800">₨{latestRateImpact.totalNewValue.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Paper Profit/Loss</p>
                                <p className={clsx("text-2xl font-black", latestRateImpact.totalPaperProfitLoss >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {latestRateImpact.totalPaperProfitLoss >= 0 ? '+' : '-'}₨{Math.abs(latestRateImpact.totalPaperProfitLoss).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                        No rate change impacts recorded yet.
                    </Card>
                )}
            </div>

        </div>
    );
};


