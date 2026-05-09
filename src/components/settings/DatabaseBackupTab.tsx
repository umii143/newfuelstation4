import { Badge, Button, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { Cloud, CloudOff, Download, HardDrive, ShieldAlert, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

export const DatabaseBackupTab: React.FC = () => {
    const { user, authMethod } = useAuthStore();
    const [exportStatus, setExportStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // If authenticated via Google, cloud sync is active
    const isCloudActive = authMethod === 'GOOGLE' || (user && !('pin' in user));

    const handleExportData = () => {
        try {
            setExportStatus('Compiling database...');
            const dataToExport: Record<string, string> = {};
            
            // Gather all motorway stores
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('motorway-')) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        dataToExport[key] = value;
                    }
                }
            }
            
            // Gather auth state
            const authState = localStorage.getItem('fuel-station-auth');
            if (authState) dataToExport['fuel-station-auth'] = authState;

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Motorway_Oil_Backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setExportStatus('Backup downloaded successfully!');
            setTimeout(() => setExportStatus(''), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            setExportStatus('Export failed. Check console.');
        }
    };

    const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                
                // Confirm before override
                if (window.confirm('WARNING: This will overwrite all current local data with the backup. Are you sure?')) {
                    Object.keys(data).forEach(key => {
                        localStorage.setItem(key, data[key]);
                    });
                    
                    alert('Backup restored successfully! The application will now reload.');
                    window.location.reload();
                }
            } catch (error) {
                alert('Invalid backup file. Restoration failed.');
            }
            
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cloud Status Card */}
                <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px]" />
                    
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isCloudActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                {isCloudActive ? <Cloud size={32} /> : <CloudOff size={32} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Cloud Sync</h3>
                                <p className="text-sm font-medium text-slate-500">
                                    Firestore Database Connection
                                </p>
                            </div>
                        </div>
                        <Badge className={isCloudActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                            {isCloudActive ? 'CONNECTED' : 'OFFLINE'}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            {isCloudActive ? (
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Your data is securely synchronizing with the Google Cloud in real-time. No manual backups are required while Cloud Sync is active.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        You are logged in using an offline PIN account. Your data is <strong>only saved locally</strong> on this browser.
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-xs font-medium">
                                        <ShieldAlert size={14} />
                                        Log in with Google to enable automatic Cloud Sync.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Local Backup Card */}
                <Card className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                                <HardDrive size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Manual Backup</h3>
                                <p className="text-sm font-medium text-slate-400">
                                    Local Storage Export / Import
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Generate a secure JSON snapshot of your current local database. You can use this file to restore your data on another browser or device.
                        </p>

                        <div className="flex flex-col gap-3">
                            <Button 
                                onClick={handleExportData}
                                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 border-none justify-center"
                            >
                                <Download size={18} className="mr-2" /> 
                                Export Full Backup (JSON)
                            </Button>
                            
                            {exportStatus && (
                                <p className="text-center text-emerald-400 text-sm font-medium animate-pulse">
                                    {exportStatus}
                                </p>
                            )}

                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    ref={fileInputRef}
                                    onChange={handleImportData}
                                    className="hidden" 
                                />
                                <Button 
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="secondary"
                                    className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border-none text-white justify-center"
                                >
                                    <Upload size={18} className="mr-2 text-slate-300" /> 
                                    Restore from Backup
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};
