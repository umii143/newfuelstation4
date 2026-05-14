import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Wallet, Building, Plus, Trash2, Edit2 } from 'lucide-react';

import { clsx } from 'clsx';

export const FinancialAccountsTab: React.FC = () => {
    // We would use an actual store for these in a real DB setup.
    // For now, storing in local state as a configuration scaffold.
    const [banks] = useState([
        { id: '1', name: 'Meezan Bank', accountNo: '0204010214221', branch: 'Main Branch', isActive: true },
        { id: '2', name: 'Bank Al Habib', accountNo: '10293019230', branch: 'Highway Branch', isActive: true }
    ]);
    
    const [wallets] = useState([
        { id: '1', name: 'EasyPaisa', phoneNo: '03451234567', title: 'Station Account', isActive: true },
        { id: '2', name: 'JazzCash', phoneNo: '03001234567', title: 'Main Till', isActive: true }
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Bank Accounts */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Building size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Bank Accounts</h2>
                            <p className="text-sm text-slate-500">Configure bank accounts for shift deposits</p>
                        </div>
                    </div>
                    <Button className="bg-blue-50 hover:bg-blue-100 text-blue-600 gap-2">
                        <Plus size={16} /> Add Bank
                    </Button>
                </div>
                
                <div className="space-y-3">
                    {banks.map((bank) => (
                        <div key={bank.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                    <Building size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{bank.name}</h4>
                                    <p className="text-xs text-slate-500 font-mono">{bank.accountNo} • {bank.branch}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={clsx("text-xs font-bold px-2 py-1 rounded-md", bank.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>
                                    {bank.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-lg"><Edit2 size={14} /></Button>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 border-rose-200"><Trash2 size={14} /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Digital Wallets */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Digital Wallets</h2>
                            <p className="text-sm text-slate-500">Configure EasyPaisa, JazzCash, Nayapay, etc.</p>
                        </div>
                    </div>
                    <Button className="bg-purple-50 hover:bg-purple-100 text-purple-600 gap-2">
                        <Plus size={16} /> Add Wallet
                    </Button>
                </div>
                
                <div className="space-y-3">
                    {wallets.map((wallet) => (
                        <div key={wallet.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-purple-500 font-bold text-xs">
                                    {wallet.name.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{wallet.name}</h4>
                                    <p className="text-xs text-slate-500 font-mono">{wallet.phoneNo} • {wallet.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={clsx("text-xs font-bold px-2 py-1 rounded-md", wallet.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600")}>
                                    {wallet.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-lg"><Edit2 size={14} /></Button>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 border-rose-200"><Trash2 size={14} /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

