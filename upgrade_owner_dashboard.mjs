import fs from 'fs';

const path = 'e:/newfuelstation4/src/pages/owner/OwnerDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add extra icons
content = content.replace(
    "import { AlertTriangle, Package, TrendingUp, Truck, ShieldAlert, ShieldCheck, BarChart3, Clock } from 'lucide-react';",
    "import { AlertTriangle, Package, TrendingUp, Truck, ShieldAlert, ShieldCheck, BarChart3, Clock, Zap, Activity, Info } from 'lucide-react';"
);

// 2. Add LiveFraudFeed component before OwnerDashboard
const liveFraudFeedComp = `
const LiveFraudFeed: React.FC<{ alerts: any[] }> = ({ alerts }) => (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Audit Intelligence</h3>
            </div>
            <Zap size={14} className="text-amber-400" />
        </div>
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {alerts.length === 0 ? (
                <div className="p-10 text-center text-slate-600">
                    <ShieldCheck size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">No active threats detected</p>
                </div>
            ) : (
                alerts.map((alert, i) => (
                    <div key={alert.id} className="p-4 border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <span className={\`text-[10px] font-black px-2 py-0.5 rounded-full \${
                                alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }\`}>
                                {alert.ruleId}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                                {new Date(alert.triggeredAt).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-200 leading-tight mb-1">{alert.details}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Station {alert.stationId.slice(-1)}</span>
                            <span className="text-[10px] font-black text-red-400/80">Impact: ₨{alert.financialImpact.toLocaleString()}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

`;

if (!content.includes('const LiveFraudFeed')) {
    content = content.replace('export const OwnerDashboard', liveFraudFeedComp + 'export const OwnerDashboard');
}

// 3. Inject LiveFraudFeed into the layout
const layoutInsertion = `
            {/* Live Audit Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <LiveFraudFeed alerts={alerts.filter(a => a.status === 'OPEN').slice(0, 10)} />
                </div>
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-blue-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Security Heatmap</h3>
                        </div>
                        <div className="space-y-4">
                            {STATIONS.map(s => {
                                const sAlerts = alerts.filter(a => a.stationId === s.id && a.status === 'OPEN');
                                const riskLevel = sAlerts.length > 5 ? 'CRITICAL' : sAlerts.length > 2 ? 'HIGH' : sAlerts.length > 0 ? 'MODERATE' : 'LOW';
                                const riskColor = riskLevel === 'CRITICAL' ? 'bg-red-500' : riskLevel === 'HIGH' ? 'bg-orange-500' : riskLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500';
                                
                                return (
                                    <div key={s.id}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-1">
                                            <span>{s.name}</span>
                                            <span className={riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>{riskLevel} RISK</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={\`h-full \${riskColor} transition-all duration-1000\`} 
                                                style={{ width: \`\${Math.min(100, (sAlerts.length + 1) * 20)}%\` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                            <Info size={16} className="text-blue-400 shrink-0" />
                            <p className="text-[10px] text-blue-300 leading-relaxed italic">
                                Forensic scores are calculated based on variance, credit limits, and shift activity logs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
`;

content = content.replace('{/* KPI Row */}', layoutInsertion + '            {/* KPI Row */}');

fs.writeFileSync(path, content);
console.log('Successfully upgraded OwnerDashboard to Elite Anti-Fraud Center');
