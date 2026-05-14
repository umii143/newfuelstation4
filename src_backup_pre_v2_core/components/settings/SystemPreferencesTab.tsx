import { Button, Card, Input } from '@/components/ui';
import { useConfigStore } from '@/stores/configStore';
import { Save, Settings } from 'lucide-react';
import React, { useState } from 'react';

export const SystemPreferencesTab: React.FC = () => {
    const { stationConfig, updateStationConfig } = useConfigStore();
    const [isSaving, setIsSaving] = useState(false);

    if (!stationConfig) {
        return (
            <Card className="p-8 text-center rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-4">
                <Settings className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800">Preferences Unavailable</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    Please initialize your Station Profile first from the Station Profile tab to unlock System Preferences.
                </p>
            </Card>
        );
    }

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        
        const updates = {
            settings: {
                ...stationConfig.settings,
                currency: formData.get('currency') as string,
                timezone: formData.get('timezone') as string,
                language: formData.get('language') as string,
                taxRate: parseFloat(formData.get('taxRate') as string),
            },
        };
        
        updateStationConfig(updates);
        
        setTimeout(() => setIsSaving(false), 800);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave}>
                <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                            <Settings size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">
                                System Preferences
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Configure global operational defaults
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Regional Settings */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Regional & Financial
                            </h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                        Primary Currency
                                    </label>
                                    <select
                                        name="currency"
                                        defaultValue={stationConfig.settings.currency || 'PKR'}
                                        className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200 focus:border-indigo-500 focus:ring-0"
                                        required
                                    >
                                        <option value="PKR">PKR (Pakistani Rupee)</option>
                                        <option value="USD">USD (US Dollar)</option>
                                        <option value="EUR">EUR (Euro)</option>
                                        <option value="GBP">GBP (British Pound)</option>
                                        <option value="AED">AED (Emirati Dirham)</option>
                                        <option value="INR">INR (Indian Rupee)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                        System Timezone
                                    </label>
                                    <select
                                        name="timezone"
                                        defaultValue={stationConfig.settings.timezone || 'Asia/Karachi'}
                                        className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200 focus:border-indigo-500 focus:ring-0"
                                        required
                                    >
                                        <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                                        <option value="UTC">UTC (Universal Time)</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                        <option value="Europe/London">Europe/London (GMT)</option>
                                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                    </select>
                                </div>

                                <Input
                                    label="Standard Tax Rate (%)"
                                    name="taxRate"
                                    type="number"
                                    step="0.01"
                                    defaultValue={stationConfig.settings.taxRate || 0}
                                    required
                                />
                            </div>
                        </div>

                        {/* Language & Display */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Language & Display
                            </h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                        System Language
                                    </label>
                                    <select
                                        name="language"
                                        defaultValue={stationConfig.settings.language || 'en'}
                                        className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200 focus:border-indigo-500 focus:ring-0"
                                        required
                                    >
                                        <option value="en">English</option>
                                        <option value="ur">Urdu (اردو)</option>
                                        <option value="ar">Arabic (عربي)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                        UI Theme
                                    </label>
                                    <select
                                        name="theme"
                                        defaultValue={stationConfig.settings.theme || 'system'}
                                        className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200 focus:border-indigo-500 focus:ring-0"
                                    >
                                        <option value="system">System (Auto)</option>
                                        <option value="glassy-white">Light Mode</option>
                                        <option value="deep-obsidian">Dark Mode</option>
                                        <option value="bloomberg">Bloomberg Terminal</option>
                                    </select>
                                </div>

                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                    <p className="text-sm text-indigo-700 font-medium">
                                        💡 Changes to language and theme will take effect after you save and refresh the page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSaving}
                            className="rounded-xl px-8 shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Save size={18} className="mr-2" />
                            {isSaving ? 'Saving Preferences...' : 'Save Preferences'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};
