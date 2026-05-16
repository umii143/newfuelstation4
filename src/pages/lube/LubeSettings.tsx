import { Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import {
    Building2,
    Database,
    DollarSign,
    Download,
    Info,
    MapPin,
    Percent,
    Phone,
    Receipt,
    Save,
    Settings,
    ShieldCheck,
    Tag,
    Upload,
} from 'lucide-react';
import React, { useState } from 'react';

/**
 * Professional Lube Settings Page
 * World-class configuration interface for Lube business unit
 * No Fuel/CNG settings - purely Lube-focused
 */
export const LubeSettingsPage: React.FC = () => {
    const { settings, updateSettings, resetSettings } = useSettingsStore();
    const { toast } = useToast();
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState<'pin' | 'confirm' | 'success'>('pin');
    const [pinInput, setPinInput] = useState('');
    const setPinError = (_msg: string) => {}; // placeholder for pin error display

    // ============================================
    // TAX CONFIGURATION HANDLERS
    // ============================================

    const handleTaxToggle = (enabled: boolean) => {
        const currentTaxConfig = settings?.taxConfig || {
            enabled: true,
            mode: 'EXCLUSIVE',
            defaultRate: 17,
        };
        updateSettings({
            taxConfig: { ...currentTaxConfig, enabled },
        });
    };

    const handleTaxModeChange = (mode: 'INCLUSIVE' | 'EXCLUSIVE') => {
        const currentTaxConfig = settings?.taxConfig || {
            enabled: true,
            mode: 'EXCLUSIVE',
            defaultRate: 17,
        };
        updateSettings({
            taxConfig: { ...currentTaxConfig, mode },
        });
    };

    const handleDefaultTaxRateChange = (rate: number) => {
        const currentTaxConfig = settings?.taxConfig || {
            enabled: true,
            mode: 'EXCLUSIVE',
            defaultRate: 17,
        };
        updateSettings({
            taxConfig: { ...currentTaxConfig, defaultRate: rate },
        });
    };

    // ============================================
    // DISCOUNT CONFIGURATION HANDLERS
    // ============================================

    const [discountConfig, setDiscountConfig] = useState({
        enabled: true,
        maxPercentage: 20,
        maxAmount: 10000,
        requiresApproval: true,
        approvalThreshold: 1000,
    });

    const handleDiscountConfigChange = (key: string, value: any) => {
        setDiscountConfig(prev => ({ ...prev, [key]: value }));
        updateSettings({
            discountConfig: {
                ...(settings?.discountConfig || discountConfig),
                [key]: value
            }
        });
    };

    // ============================================
    // BACKUP/RESTORE HANDLERS
    // ============================================

    const handleDownloadBackup = () => {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                settings: settings,
                version: '1.0.0',
                module: 'LUBE',
            };

            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `lube-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setShowBackupModal(false);
        } catch (error) {
            toast.error('Failed to create backup. Please try again.');
        }
    };

    const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const backupData = JSON.parse(e.target?.result as string);
                if (backupData.module !== 'LUBE') {
                    toast.error('Invalid backup file. This backup is not for the Lube module.');
                    return;
                }

                // Restore settings
                if (backupData.settings) {
                    Object.keys(backupData.settings).forEach(key => {
                        updateSettings({ [key]: backupData.settings[key] });
                    });
                }

                toast.success('Backup restored successfully!');
                setShowRestoreModal(false);
            } catch (_error) {
                toast.error('Failed to restore backup. File may be corrupted.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Lube Settings"
                subtitle="Professional configuration for your Lube business unit - taxation, discounts, business profile, and data management"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ============================================ */}
                {/* TAX CONFIGURATION */}
                {/* ============================================ */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Tax Configuration</h3>
                            <p className="text-xs text-gray-500">
                                Manage how taxes are applied in Lube POS
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Tax Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Enable Taxation</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enable or disable automatic tax calculation in POS
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    handleTaxToggle(!(settings?.taxConfig?.enabled ?? true))
                                }
                                className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${
                                    (settings?.taxConfig?.enabled ?? true)
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                        : 'bg-gray-300'
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-lg ${
                                        (settings?.taxConfig?.enabled ?? true)
                                            ? 'left-7'
                                            : 'left-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {(settings?.taxConfig?.enabled ?? true) && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                {/* Taxation Mode */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                                        Taxation Mode
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleTaxModeChange('EXCLUSIVE')}
                                            className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                                                (settings?.taxConfig?.mode ?? 'EXCLUSIVE') ===
                                                'EXCLUSIVE'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <p className="font-bold text-sm">Exclusive</p>
                                            <p className="text-[10px] opacity-70 mt-1">
                                                Tax added on top of sale price
                                            </p>
                                        </button>
                                        <button
                                            onClick={() => handleTaxModeChange('INCLUSIVE')}
                                            className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                                                (settings?.taxConfig?.mode ?? 'EXCLUSIVE') ===
                                                'INCLUSIVE'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <p className="font-bold text-sm">Inclusive</p>
                                            <p className="text-[10px] opacity-70 mt-1">
                                                Tax included in sale price
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {/* Tax Rate */}
                                <Input
                                    label="Default Tax Rate (%)"
                                    type="number"
                                    value={settings?.taxConfig?.defaultRate ?? 17}
                                    onChange={e =>
                                        handleDefaultTaxRateChange(parseFloat(e.target.value) || 0)
                                    }
                                    icon={<Percent size={16} />}
                                    placeholder="17"
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* ============================================ */}
                {/* DISCOUNT CONFIGURATION */}
                {/* ============================================ */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl shadow-lg">
                            <Tag size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Discount Settings</h3>
                            <p className="text-xs text-gray-500">
                                Configure discount limits and approval rules
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Discount Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Enable Discounts</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Allow staff to apply discounts in POS
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    handleDiscountConfigChange('enabled', !discountConfig.enabled)
                                }
                                className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${
                                    discountConfig.enabled
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                        : 'bg-gray-300'
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-lg ${
                                        discountConfig.enabled ? 'left-7' : 'left-0.5'
                                    }`}
                                />
                            </button>
                        </div>

                        {discountConfig.enabled && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Max Discount (%)"
                                        type="number"
                                        value={discountConfig.maxPercentage}
                                        onChange={e =>
                                            handleDiscountConfigChange(
                                                'maxPercentage',
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        icon={<Percent size={16} />}
                                        placeholder="20"
                                    />
                                    <Input
                                        label="Max Amount (₨)"
                                        type="number"
                                        value={discountConfig.maxAmount}
                                        onChange={e =>
                                            handleDiscountConfigChange(
                                                'maxAmount',
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        icon={<DollarSign size={16} />}
                                        placeholder="10000"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">
                                            Require Approval
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Discounts above ₨
                                            {discountConfig.approvalThreshold.toLocaleString()} need
                                            manager approval
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDiscountConfigChange(
                                                'requiresApproval',
                                                !discountConfig.requiresApproval
                                            )
                                        }
                                        className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${
                                            discountConfig.requiresApproval
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                                                : 'bg-gray-300'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-all shadow-lg ${
                                                discountConfig.requiresApproval
                                                    ? 'left-7'
                                                    : 'left-0.5'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* ============================================ */}
                {/* BUSINESS PROFILE */}
                {/* ============================================ */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Lube Unit Profile</h3>
                            <p className="text-xs text-gray-500">
                                Business details printed on receipts and invoices
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Business Name"
                            placeholder="e.g. Motorway Lube Center"
                            value={settings.businessName || ''}
                            onChange={e => updateSettings({ businessName: e.target.value })}
                            icon={<ShieldCheck size={16} />}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Contact Phone"
                                placeholder="+92 3XX XXXXXXX"
                                value={settings.businessPhone || ''}
                                onChange={e => updateSettings({ businessPhone: e.target.value })}
                                icon={<Phone size={16} />}
                            />
                            <Input
                                label="Location ID"
                                value="STN-001-LUBE"
                                disabled
                                icon={<MapPin size={16} />}
                            />
                        </div>
                        <Input
                            label="Business Address"
                            placeholder="Full address for receipt header..."
                            value={settings.businessLocation || ''}
                            onChange={e => updateSettings({ businessLocation: e.target.value })}
                            icon={<MapPin size={16} />}
                        />
                    </div>
                </Card>

                {/* ============================================ */}
                {/* BACKUP & RESTORE */}
                {/* ============================================ */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Data Management</h3>
                            <p className="text-xs text-gray-500">
                                Backup and restore your Lube settings
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowBackupModal(true)}
                            className="w-full justify-start gap-3"
                        >
                            <Download size={18} />
                            <div className="text-left">
                                <p className="font-bold">Download Backup</p>
                                <p className="text-xs opacity-70">
                                    Export all settings to JSON file
                                </p>
                            </div>
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => setShowRestoreModal(true)}
                            className="w-full justify-start gap-3"
                        >
                            <Upload size={18} />
                            <div className="text-left">
                                <p className="font-bold">Restore Backup</p>
                                <p className="text-xs opacity-70">
                                    Import settings from backup file
                                </p>
                            </div>
                        </Button>

                        <div className="border-t border-gray-200 pt-3 mt-3"></div>

                        <Button
                            variant="danger"
                            onClick={() => {
                                setShowDeleteModal(true);
                                setDeleteStep('pin');
                                setPinInput('');
                            }}
                            className="w-full justify-start gap-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                        >
                            <Database size={18} />
                            <div className="text-left">
                                <p className="font-bold">🗑️ Clear All Dummy Data</p>
                                <p className="text-xs opacity-90">
                                    Delete ALL products, sales & transactions
                                </p>
                            </div>
                        </Button>
                    </div>
                </Card>

                {/* ============================================ */}
                {/* SYSTEM PREFERENCES */}
                {/* ============================================ */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl shadow-lg">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">System Preferences</h3>
                            <p className="text-xs text-gray-500">
                                Localization and display settings
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                Default Currency
                            </label>
                            <select
                                value={settings.currency}
                                onChange={e => updateSettings({ currency: e.target.value })}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            >
                                <option value="PKR">PKR (₨)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                Interface Language
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateSettings({ language: 'en' })}
                                    className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${
                                        settings.language === 'en'
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => updateSettings({ language: 'ur' })}
                                    className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${
                                        settings.language === 'ur'
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    اردو
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ============================================ */}
                {/* FOOTER ACTIONS */}
                {/* ============================================ */}
                <div className="lg:col-span-2 flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Info size={20} className="text-blue-600" />
                        <p className="text-sm text-blue-900 font-medium">
                            Settings are automatically saved and applied across the Lube module.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={resetSettings}
                            className="shadow-md hover:shadow-lg transition-shadow"
                        >
                            Reset defaults
                        </Button>
                        <Button
                            variant="primary"
                            className="gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow bg-gradient-to-r from-blue-500 to-indigo-600"
                        >
                            <Save size={18} />
                            Apply Changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* BACKUP MODAL */}
            {/* ============================================ */}
            <Modal
                isOpen={showBackupModal}
                onClose={() => setShowBackupModal(false)}
                title="Download Settings Backup"
                size="md"
            >
                <div className="space-y-6 pt-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-900">
                            This will download all your Lube settings as a JSON file. You can use
                            this file to restore settings later or transfer to another system.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowBackupModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDownloadBackup}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                        >
                            <Download size={18} className="mr-2" />
                            Download Backup
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ============================================ */}
            {/* RESTORE MODAL */}
            {/* ============================================ */}
            <Modal
                isOpen={showRestoreModal}
                onClose={() => setShowRestoreModal(false)}
                title="Restore Settings Backup"
                size="md"
            >
                <div className="space-y-6 pt-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-900 font-medium mb-2">⚠️ Warning</p>
                        <p className="text-sm text-amber-800">
                            Restoring a backup will overwrite your current settings. This action
                            cannot be undone. Please make sure you have a recent backup before
                            proceeding.
                        </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestoreBackup}
                            className="hidden"
                            id="backup-file-input"
                        />
                        <label
                            htmlFor="backup-file-input"
                            className="cursor-pointer flex flex-col items-center gap-3"
                        >
                            <Upload size={48} className="text-gray-400" />
                            <div>
                                <p className="font-bold text-gray-900">
                                    Click to select backup file
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Only .json backup files are accepted
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowRestoreModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ============================================ */}
            {/* DELETE DUMMY DATA MODAL */}
            {/* ============================================ */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteStep('pin');
                    setPinInput('');
                }}
                title={
                    deleteStep === 'pin'
                        ? '🔐 Enter PIN to Continue'
                        : deleteStep === 'confirm'
                          ? '⚠️ Final Confirmation'
                          : '✅ Success!'
                }
                size="md"
            >
                <div className="space-y-6 pt-4">
                    {/* PIN STEP */}
                    {deleteStep === 'pin' && (
                        <>
                            <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                                        <Database className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold text-red-900 mb-2">
                                            ⚠️ Danger Zone
                                        </p>
                                        <p className="text-sm text-red-800 mb-3">
                                            You are about to delete ALL dummy data. This action
                                            will:
                                        </p>
                                        <ul className="text-sm text-red-700 space-y-1.5 ml-4">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                Delete all products
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                Delete all sales records
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                Delete all customers
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                Delete all suppliers
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                Delete all expenses & transactions
                                            </li>
                                        </ul>
                                        <p className="text-sm font-bold text-red-900 mt-3">
                                            ⚠️ This action CANNOT be undone!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Enter your PIN to proceed
                                </label>
                                <Input
                                    type="password"
                                    value={pinInput}
                                    onChange={e => setPinInput(e.target.value)}
                                    placeholder="Enter PIN"
                                    className="text-center text-2xl font-bold tracking-widest"
                                    autoFocus
                                    onKeyPress={e => {
                                        if (e.key === 'Enter' && pinInput) {
                                            const { user } = useAuthStore.getState();
                                            if (pinInput === (user as any)?.pin) {
                                                setDeleteStep('confirm');
                                                setPinInput('');
                                            } else {
                                                toast.error('Incorrect PIN!');
                                                setPinInput('');
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPinInput('');
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={async () => {
                                        const { useAuthStore } = await import('@/stores/authStore');
                                        const { user: currentUser } = useAuthStore.getState();
                                        if (pinInput === (currentUser as any)?.pin) {
                                            setDeleteStep('confirm');
                                            setPinInput('');
                                            setPinError('');
                                        } else {
                                            setPinError('Incorrect PIN. Please try again.');
                                            setPinInput('');
                                        }
                                    }}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600"
                                    disabled={!pinInput}
                                >
                                    Continue
                                </Button>
                            </div>
                        </>
                    )}

                    {/* CONFIRMATION STEP */}
                    {deleteStep === 'confirm' && (
                        <>
                            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-2xl font-black text-amber-900 mb-3">
                                        Are you absolutely sure?
                                    </p>
                                    <p className="text-sm text-amber-800 mb-4">
                                        This will permanently delete all your data. Settings will be
                                        preserved, but everything else will be reset to factory
                                        defaults.
                                    </p>
                                    <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-amber-200">
                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                                            Data to be deleted:
                                        </p>
                                        <p className="text-sm text-amber-700 font-medium">
                                            All products • All sales • All customers • All suppliers
                                            • All expenses
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setDeleteStep('pin');
                                    }}
                                    className="flex-1"
                                >
                                    ← Go Back
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={async () => {
                                        const { useAuthStore } = await import('@/stores/authStore');
                                        const { clearAllData } = useAuthStore.getState();
                                        clearAllData();
                                        setDeleteStep('success');
                                    }}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600"
                                >
                                    Yes, Delete Everything
                                </Button>
                            </div>
                        </>
                    )}

                    {/* SUCCESS STEP */}
                    {deleteStep === 'success' && (
                        <>
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <p className="text-3xl font-black text-gray-900 mb-3">
                                    ✅ All Data Deleted!
                                </p>
                                <p className="text-base text-gray-600 mb-6">
                                    All dummy data has been permanently removed.
                                    <br />
                                    The application will now reload.
                                </p>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> You will need to log in again after
                                        the reload.
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => {
                                    setTimeout(() => {
                                        window.location.href = '/';
                                    }, 300);
                                }}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            >
                                Reload Application
                            </Button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};
