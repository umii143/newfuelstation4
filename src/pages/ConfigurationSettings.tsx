import { Badge, Button, Card, Input, Modal } from '@/components/ui';
import { getCurrentUserId, getCurrentUserName } from '@/lib/authHelpers';
import { useSettingsStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import { useStaffStore } from '@/stores/dataStores';
import type { FuelType, RateChangeReason, User } from '@/types';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    Building,
    CheckCircle,
    Clock,
    CreditCard,
    Database,
    Droplets,
    Edit2,
    Gauge,
    Globe,
    History,
    MapPin,
    Plus,
    RefreshCw,
    Save,
    Settings,
    Shield,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import { getStationId } from '@/lib/authHelpers';
import React, { useState } from 'react';
import { DatabaseBackupTab } from '@/components/settings/DatabaseBackupTab';
import { SystemPreferencesTab } from '@/components/settings/SystemPreferencesTab';
import { FinancialAccountsTab } from '@/components/settings/FinancialAccountsTab';

// ============================================
// HELPERS
// ============================================

const getFuelTypeLabel = (type: FuelType) => {
    const labels: Record<FuelType, string> = {
        PETROL_92: 'Petrol 92',
        PETROL_95: 'Petrol 95',
        DIESEL: 'Diesel',
        PREMIUM_DIESEL: 'Premium Diesel',
        CNG: 'CNG',
    };
    return labels[type] || type;
};



const getCalibrationStatusColor = (status: string) => {
    switch (status) {
        case 'CALIBRATED':
            return 'text-emerald-500';
        case 'DUE':
            return 'text-amber-500';
        case 'OVERDUE':
            return 'text-rose-500';
        default:
            return 'text-[var(--text-secondary)]';
    }
};



// ============================================
// CONFIGURATION SETTINGS PAGE
// Mandatory as per specification Section 2
// ============================================

type ConfigTab = 'profile' | 'preferences' | 'tanks' | 'nozzles' | 'rates' | 'alerts' | 'database' | 'financials';

export const ConfigurationSettingsPage: React.FC = () => {
    const { settings } = useSettingsStore();
    const businessUnit = settings?.businessUnit || 'FUEL';
    const [activeTab, setActiveTab] = useState<ConfigTab>('profile');

    const allTabs = [
        { id: 'profile' as ConfigTab, label: 'Station Profile', icon: Building, fuelOnly: false },
        { id: 'preferences' as ConfigTab, label: 'System Preferences', icon: Settings, fuelOnly: false },
        { id: 'database' as ConfigTab, label: 'Data & Backup', icon: Database, fuelOnly: false },
        { id: 'financials' as ConfigTab, label: 'Financial Accounts', icon: CreditCard, fuelOnly: false },
        { id: 'tanks' as ConfigTab, label: 'Tank Management', icon: Droplets, fuelOnly: false },
        { id: 'nozzles' as ConfigTab, label: 'Nozzle Configuration', icon: Gauge, fuelOnly: false },
        { id: 'rates' as ConfigTab, label: 'Rate Settings', icon: TrendingUp, fuelOnly: false },
        { id: 'alerts' as ConfigTab, label: 'Alert Configuration', icon: Bell, fuelOnly: false },
    ];

    const tabs = allTabs.filter(tab => {
        if (businessUnit !== 'FUEL' && ['tanks', 'nozzles'].includes(tab.id)) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Settings className="text-blue-500" />
                        Configuration Settings
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {businessUnit === 'FUEL'
                            ? 'Manage tanks, nozzles, fuel rates, and system alerts'
                            : `Manage system alerts and ${businessUnit} configuration`}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-[var(--border)] pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 -mb-[2px] ${
                            activeTab === tab.id
                                ? 'text-blue-500 border-blue-500'
                                : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'profile' && <StationProfileTab />}
                    {activeTab === 'preferences' && <SystemPreferencesTab />}
                    {activeTab === 'database' && <DatabaseBackupTab />} 
                    {activeTab === 'financials' && <FinancialAccountsTab />}
                    {activeTab === 'tanks' && <TankManagementTab />}
                    {activeTab === 'nozzles' && <NozzleConfigurationTab />}
                    {activeTab === 'rates' && <RateSettingsTab />}
                    {activeTab === 'alerts' && <AlertConfigurationTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// ============================================
// STATION PROFILE TAB
// ============================================

const StationProfileTab: React.FC = () => {
    const { stationConfig, updateStationConfig } = useConfigStore();
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const updates = {
            name: formData.get('name') as string,
            address: {
                street: formData.get('street') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string,
                country: formData.get('country') as string,
                postalCode: formData.get('postalCode') as string,
            },
            settings: {
                ...(stationConfig?.settings || { currency: 'PKR', timezone: 'Asia/Karachi', theme: 'system', language: 'en', taxRate: 0 }),
                taxRate: parseFloat(formData.get('taxRate') as string),
            },
        };
        updateStationConfig(updates);
        setIsEditing(false);
    };

    if (!stationConfig) {
        return (
            <Card className="p-8 text-center rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-4">
                <Building className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-800">No Station Profile Found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    Your station configuration has not been initialized yet.
                </p>
                <Button 
                    onClick={() => {
                        updateStationConfig({
                            stationId: 'STN-DEFAULT',
                            name: 'Motorway Oil Station',
                            address: { street: '', city: '', state: '', country: 'Pakistan', postalCode: '' },
                            settings: { currency: 'PKR', timezone: 'Asia/Karachi', theme: 'system', language: 'en', taxRate: 0 },
                            createdAt: new Date().toISOString(),
                        });
                        setIsEditing(true);
                    }}
                    className="mt-4"
                >
                    Initialize Profile Now
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Station Info Card */}
                <Card className="md:col-span-2 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                                <Building size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {stationConfig.name}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    Station ID: {stationConfig.stationId}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant={isEditing ? 'secondary' : 'primary'}
                            onClick={() => setIsEditing(!isEditing)}
                            className="rounded-xl"
                        >
                            {isEditing ? (
                                <X size={18} className="mr-2" />
                            ) : (
                                <Edit2 size={18} className="mr-2" />
                            )}
                            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                        </Button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Station Name"
                                    name="name"
                                    defaultValue={stationConfig.name}
                                    required
                                />
                                <Input
                                    label="Tax Rate (%)"
                                    name="taxRate"
                                    type="number"
                                    step="0.01"
                                    defaultValue={stationConfig.settings.taxRate}
                                    required
                                />
                                <Input
                                    label="Street Address"
                                    name="street"
                                    defaultValue={stationConfig.address.street}
                                    required
                                    className="md:col-span-2"
                                />
                                <Input
                                    label="City"
                                    name="city"
                                    defaultValue={stationConfig.address.city}
                                    required
                                />
                                <Input
                                    label="State/Province"
                                    name="state"
                                    defaultValue={stationConfig.address.state}
                                    required
                                />
                                <Input
                                    label="Country"
                                    name="country"
                                    defaultValue={stationConfig.address.country}
                                    required
                                />
                                <Input
                                    label="Postal Code"
                                    name="postalCode"
                                    defaultValue={stationConfig.address.postalCode}
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="rounded-xl px-8 shadow-lg shadow-blue-500/20"
                                >
                                    <Save size={18} className="mr-2" />
                                    Save Profile Changes
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin size={20} className="text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Location
                                        </p>
                                        <p className="text-slate-700 font-medium leading-relaxed">
                                            {stationConfig.address.street},<br />
                                            {stationConfig.address.city},{' '}
                                            {stationConfig.address.state}{' '}
                                            {stationConfig.address.postalCode},<br />
                                            {stationConfig.address.country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Globe size={20} className="text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Settings
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge className="bg-slate-50 border border-slate-200 text-slate-600">
                                                {stationConfig.settings.currency}
                                            </Badge>
                                            <Badge className="bg-slate-50 border border-slate-200 text-slate-600">
                                                {stationConfig.settings.timezone}
                                            </Badge>
                                            <Badge className="bg-slate-50 border border-slate-200 text-slate-600 uppercase">
                                                {stationConfig.settings.theme.replace('-', ' ')}
                                            </Badge>
                                            <Badge className="bg-slate-50 border border-slate-200 text-slate-600 uppercase">
                                                Tax: {stationConfig.settings.taxRate}%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Quick Stats Card */}
                <div className="space-y-4">
                    <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard size={24} className="opacity-80" />
                            <h4 className="font-bold">Operational Status</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-80 font-medium">System Health</span>
                                <Badge className="bg-white/20 text-white border-transparent">
                                    Optimal
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-80 font-medium">Business Mode</span>
                                <Badge className="bg-white/20 text-white border-transparent">
                                    Fuel Active
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock size={24} className="text-slate-400" />
                            <h4 className="font-bold text-slate-800">System Info</h4>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase">
                                Member Since
                            </p>
                            <p className="text-slate-600 font-medium">
                                {stationConfig?.createdAt ? new Date(stationConfig.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : 'N/A'}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// ============================================
// TANK MANAGEMENT TAB
// ============================================

const TankManagementTab: React.FC = () => {
    const {
        tankConfigs,
        addTank,
        updateTank,
        deleteTank,
        getNozzlesForTank,
        getTankFillPercentage,
    } = useConfigStore();
    const [editingTankId, setEditingTankId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const handleSaveTank = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const tankData = {
            name: formData.get('name') as string,
            fuelType: formData.get('fuelType') as FuelType,
            capacity: parseFloat(formData.get('capacity') as string) || 0,
            currentLevel: parseFloat(formData.get('currentLevel') as string) || 0,
            costPrice: parseFloat(formData.get('costPrice') as string) || 0,
            salePrice: parseFloat(formData.get('salePrice') as string) || 0,
            reorderPoint: parseFloat(formData.get('reorderPoint') as string) || 0,
            minimumThresholdLevel: parseFloat(formData.get('minimumThresholdLevel') as string) || 0,
            installationDate: (formData.get('installationDate') as string) || new Date().toISOString().split('T')[0],
            lastCalibrationDate: (formData.get('lastCalibrationDate') as string) || new Date().toISOString().split('T')[0],
            calibrationDueDate: (formData.get('calibrationDueDate') as string) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true,
        };

        if (editingTankId) {
            updateTank(editingTankId, tankData);
        } else {
            addTank({
                ...tankData,
                stationId: getStationId(),
                nozzles: [],
                lastUpdated: new Date().toISOString(),
                daysUntilRefill: 0,
            });
        }

        setShowAddForm(false);
        setEditingTankId(null);
    };

    const editingTank = tankConfigs.find(t => t.tankId === editingTankId);

    return (
        <div className="space-y-6">
            <Modal
                isOpen={showAddForm || editingTankId !== null}
                onClose={() => {
                    setShowAddForm(false);
                    setEditingTankId(null);
                }}
                title={editingTankId ? 'Edit Storage Tank' : 'Commission New Tank'}
            >
                <form onSubmit={handleSaveTank} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tank Name"
                            name="name"
                            defaultValue={editingTank?.name}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Fuel Type
                            </label>
                            <select
                                name="fuelType"
                                defaultValue={editingTank?.fuelType || 'PETROL_92'}
                                className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200"
                                required
                            >
                                <option value="PETROL_92">Petrol 92</option>
                                <option value="PETROL_95">Petrol 95</option>
                                <option value="DIESEL">Diesel</option>
                                <option value="PREMIUM_DIESEL">Premium Diesel</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Capacity (L)"
                            name="capacity"
                            type="number"
                            defaultValue={editingTank?.capacity}
                            required
                        />
                        <Input
                            label="Current Level (L)"
                            name="currentLevel"
                            type="number"
                            defaultValue={editingTank?.currentLevel || 0}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Sale Price (PKR/L)"
                            name="salePrice"
                            type="number"
                            defaultValue={editingTank?.salePrice || 0}
                            required
                        />
                        <Input
                            label="Safe Level (L)"
                            name="minimumThresholdLevel"
                            type="number"
                            defaultValue={editingTank?.minimumThresholdLevel}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingTankId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Deploy Tank
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 rounded-[2rem] bg-white border border-slate-50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Storage Units
                            </p>
                            <p className="text-2xl font-black text-slate-800">
                                {tankConfigs.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Droplets size={24} />
                        </div>
                    </div>
                </Card>
                <Card className="p-6 rounded-[2rem] bg-white border border-slate-50 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Safe Status
                            </p>
                            <p className="text-2xl font-black text-emerald-500">
                                {
                                    tankConfigs.filter(
                                        t => t.currentLevel > t.minimumThresholdLevel
                                    ).length
                                }
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="rounded-xl shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} className="mr-2" /> Add New Tank
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tankConfigs.map(tank => {
                    const fillPercentage = getTankFillPercentage(tank.tankId);
                    const isLow = tank.currentLevel <= tank.minimumThresholdLevel;
                    return (
                        <Card
                            key={tank.tankId}
                            className={clsx(
                                'p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-xl transition-all duration-500',
                                isLow && 'ring-2 ring-rose-500 ring-offset-4 ring-offset-slate-50'
                            )}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={clsx(
                                            'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg',
                                            isLow
                                                ? 'bg-rose-500 shadow-rose-200'
                                                : 'bg-slate-900 shadow-slate-200'
                                        )}
                                    >
                                        <Droplets size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {tank.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium capitalize">
                                            {tank.fuelType.replace('_', ' ')} • ID: {tank.tankId}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingTankId(tank.tankId)}
                                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
                                    >
                                        <Edit2 size={18} className="text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => deleteTank(tank.tankId)}
                                        className="p-3 hover:bg-rose-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 size={18} className="text-rose-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Current Inventory
                                            </p>
                                            <p className="text-2xl font-black text-slate-800">
                                                {tank.currentLevel.toLocaleString()}
                                                <span className="text-sm font-medium text-slate-400 ml-1">
                                                    / {tank.capacity.toLocaleString()} L
                                                </span>
                                            </p>
                                        </div>
                                        <p
                                            className={clsx(
                                                'text-lg font-black',
                                                fillPercentage > 50
                                                    ? 'text-emerald-500'
                                                    : fillPercentage > 25
                                                      ? 'text-amber-500'
                                                      : 'text-rose-500'
                                            )}
                                        >
                                            {fillPercentage.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${fillPercentage}%` }}
                                            className={clsx(
                                                'h-full rounded-full shadow-sm transition-all duration-1000',
                                                fillPercentage > 50
                                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                    : fillPercentage > 25
                                                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                                      : 'bg-gradient-to-r from-rose-400 to-rose-500'
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            Active Nozzles
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {getNozzlesForTank(tank.tankId).length} Units
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            Alert Level
                                        </p>
                                        <p className="text-lg font-bold text-slate-800">
                                            {tank.minimumThresholdLevel.toLocaleString()} L
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================
// NOZZLE CONFIGURATION TAB
// ============================================

const NozzleConfigurationTab: React.FC = () => {
    const { nozzleConfigs, tankConfigs, updateNozzle, addNozzle, resetMeter } = useConfigStore();
    const { getActiveStaff } = useStaffStore();
    const staff = getActiveStaff();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showResetModal, setShowResetModal] = useState<string | null>(null);

    const [editingNozzleId, setEditingNozzleId] = useState<string | null>(null);
    const [selectedTankId, setSelectedTankId] = useState<string>('');

    const handleSaveNozzle = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const nozzleData = {
            name: formData.get('name') as string,
            tankId: formData.get('tankId') as string,
            number: parseInt(formData.get('number') as string) || 1,
            currentReading: parseFloat(formData.get('currentReading') as string) || 0,
            testVolume: parseFloat(formData.get('testVolume') as string) || 0,
            status: (formData.get('status') as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE') || 'ACTIVE',
            installationDate: (formData.get('installationDate') as string) || new Date().toISOString().split('T')[0],
            lastCalibrationDate: (formData.get('lastCalibrationDate') as string) || new Date().toISOString().split('T')[0],
            calibrationStatus: (formData.get('calibrationStatus') as
                | 'CALIBRATED'
                | 'DUE'
                | 'OVERDUE') || 'CALIBRATED',
            isActive: true,
        };

        if (editingNozzleId) {
            updateNozzle(editingNozzleId, nozzleData);
        } else {
            addNozzle(nozzleData);
        }

        setEditingNozzleId(null);
        setShowAddForm(false);
    };

    const handleMeterReset = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newReading = parseFloat(formData.get('newReading') as string);
        const staffId = formData.get('performedBy') as string;
        const staffMember = staff?.find((s: User) => s.userId === staffId);

        if (showResetModal) {
            resetMeter(showResetModal, newReading, staffMember?.name || 'Authorized Admin');
            setShowResetModal(null);
        }
    };

    const editingNozzle = nozzleConfigs.find(n => n.nozzleId === editingNozzleId);
    const resetNozzle = nozzleConfigs.find(n => n.nozzleId === showResetModal);

    const nozzlesByTank = tankConfigs.map(tank => ({
        tank,
        nozzles: nozzleConfigs.filter(n => n.tankId === tank.tankId),
    }));

    return (
        <div className="space-y-6">
            <Modal
                isOpen={showAddForm || editingNozzleId !== null}
                onClose={() => {
                    setShowAddForm(false);
                    setEditingNozzleId(null);
                }}
                title={editingNozzleId ? 'Edit Nozzle' : 'Add New Nozzle'}
            >
                <form onSubmit={handleSaveNozzle} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nozzle Name"
                            name="name"
                            defaultValue={editingNozzle?.name}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Assign Tank
                            </label>
                            <select
                                name="tankId"
                                defaultValue={editingNozzle?.tankId || selectedTankId}
                                className="w-full px-4 py-3 rounded-lg text-sm border-2 border-slate-200"
                                required
                            >
                                {tankConfigs.map(t => (
                                    <option key={t.tankId} value={t.tankId}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nozzle Number"
                            name="number"
                            type="number"
                            defaultValue={editingNozzle?.number}
                            required
                        />
                        <Input
                            label="Reading"
                            name="currentReading"
                            type="number"
                            step="0.01"
                            defaultValue={editingNozzle?.currentReading}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingNozzleId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Nozzle
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showResetModal !== null}
                onClose={() => setShowResetModal(null)}
                title="Authorize Meter Reset"
            >
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                    <p className="text-sm text-amber-800">
                        Critical: This will create an audit record for {resetNozzle?.name}.
                    </p>
                </div>
                <form onSubmit={handleMeterReset} className="space-y-4">
                    <Input
                        label="New Reading (L)"
                        name="newReading"
                        type="number"
                        step="0.01"
                        required
                    />
                    <select
                        name="performedBy"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg"
                        required
                    >
                        <option value="">Select Authorized Staff</option>
                        {(staff || [])
                            .filter((s: User) => s.role === 'OWNER' || s.role === 'MANAGER')
                            .map((s: User) => (
                                <option key={s.userId} value={s.userId}>
                                    {s.name}
                                </option>
                            ))}
                    </select>
                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="secondary" onClick={() => setShowResetModal(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="bg-rose-500 hover:bg-rose-600 border-transparent text-white"
                        >
                            Reset Meter
                        </Button>
                    </div>
                </form>
            </Modal>
            {/* Stats & Add Button Header */}
            <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 mr-4">
                    <Card className="p-4 rounded-2xl bg-white border border-slate-50 shadow-lg">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Nozzles</p>
                        <p className="text-2xl font-black text-slate-800">{nozzleConfigs.length}</p>
                    </Card>
                    <Card className="p-4 rounded-2xl bg-white border border-slate-50 shadow-lg">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                        <p className="text-2xl font-black text-emerald-500">{nozzleConfigs.filter(n => n.status === 'ACTIVE').length}</p>
                    </Card>
                    <Card className="p-4 rounded-2xl bg-white border border-slate-50 shadow-lg hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Tanks</p>
                        <p className="text-2xl font-black text-blue-500">{tankConfigs.length}</p>
                    </Card>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="rounded-xl shadow-lg shadow-blue-500/20"
                    disabled={tankConfigs.length === 0}
                >
                    <Plus size={18} className="mr-2" /> Add Nozzle
                </Button>
            </div>

            {/* Empty state when no tanks exist */}
            {tankConfigs.length === 0 && (
                <Card className="p-8 text-center rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-4">
                    <Gauge className="mx-auto text-slate-300 mb-2" size={48} />
                    <h3 className="text-xl font-bold text-slate-800">No Tanks Configured Yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        You need to add at least one storage tank in the <strong>Tank Management</strong> tab before you can configure nozzles. Each nozzle must be assigned to a tank.
                    </p>
                </Card>
            )}

            {/* Empty state when tanks exist but no nozzles */}
            {tankConfigs.length > 0 && nozzleConfigs.length === 0 && (
                <Card className="p-8 text-center rounded-[2.5rem] bg-white border border-slate-100 shadow-xl space-y-4">
                    <Gauge className="mx-auto text-slate-300 mb-2" size={48} />
                    <h3 className="text-xl font-bold text-slate-800">No Nozzles Configured</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Click the <strong>"Add Nozzle"</strong> button above to register your first dispensing nozzle and assign it to a tank.
                    </p>
                </Card>
            )}

            {nozzlesByTank.map(({ tank, nozzles }) => (
                <Card
                    key={tank.tankId}
                    className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-xl mb-6"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                <Gauge size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{tank.name}</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {nozzles.length} Nozzles Active
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            className="rounded-xl"
                            onClick={() => {
                                setSelectedTankId(tank.tankId);
                                setShowAddForm(true);
                            }}
                        >
                            <Plus size={18} className="mr-2" /> Quick Add Nozzle
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {nozzles.map(nozzle => (
                            <div
                                key={nozzle.nozzleId}
                                className="group p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{nozzle.name}</h4>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                            ID: {nozzle.nozzleId}
                                        </p>
                                    </div>
                                    <Badge
                                        className={clsx(
                                            'rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter',
                                            nozzle.status === 'ACTIVE'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-200 text-slate-500'
                                        )}
                                    >
                                        {nozzle.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">
                                            Meter Reading
                                        </span>
                                        <span className="font-bold text-slate-800">
                                            {nozzle.currentReading.toLocaleString()} L
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">
                                            Calibration
                                        </span>
                                        <span
                                            className={clsx(
                                                'font-bold uppercase text-[10px]',
                                                getCalibrationStatusColor(nozzle.calibrationStatus)
                                            )}
                                        >
                                            {nozzle.calibrationStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="rounded-xl text-xs h-10 font-bold"
                                        onClick={() => setEditingNozzleId(nozzle.nozzleId)}
                                    >
                                        <Edit2 size={14} className="mr-2" /> Edit
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="rounded-xl text-xs h-10 font-bold border-amber-200 text-amber-700 hover:bg-amber-50"
                                        onClick={() => setShowResetModal(nozzle.nozzleId)}
                                    >
                                        <RefreshCw size={14} className="mr-2" /> Reset
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            ))}
        </div>
    );
};

// ============================================
// RATE SETTINGS TAB
// ============================================

const RateSettingsTab: React.FC = () => {
    const { rateConfigs, rateChangeHistory, changeRate } = useConfigStore();
    const [editingRate, setEditingRate] = useState<FuelType | null>(null);
    const [newRate, setNewRate] = useState<string>('');
    const [reason, setReason] = useState<RateChangeReason>('OMC_RATE_CHANGE');
    const [reasonNote, setReasonNote] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const handleSaveRate = (fuelType: FuelType) => {
        const rate = parseFloat(newRate);
        if (isNaN(rate) || rate <= 0) return;
        changeRate(
            fuelType,
            rate,
            getCurrentUserId(),
            getCurrentUserName(),
            reason,
            reasonNote || undefined
        );
        setEditingRate(null);
        setNewRate('');
        setReasonNote('');
    };

    const reasonOptions: { value: RateChangeReason; label: string }[] = [
        { value: 'OMC_RATE_CHANGE', label: 'OMC Official Revision' },
        { value: 'MARKET_CONDITIONS', label: 'Market Volatility' },
        { value: 'GOVERNMENT_NOTIFICATION', label: 'Govt Notification' },
        { value: 'PROMOTIONAL_OFFER', label: 'Limited Offer' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl h-10 gap-2 border-slate-200"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    <History size={16} /> {showHistory ? 'Hide Audit Log' : 'View Audit Log'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rateConfigs.map(config => {
                    const isEditing = editingRate === config.fuelType;
                    const diff = config.currentRate - config.previousRate;
                    const percent =
                        config.previousRate > 0 ? (diff / config.previousRate) * 100 : 0;

                    return (
                        <Card
                            key={config.fuelType}
                            className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">
                                        {getFuelTypeLabel(config.fuelType)}
                                    </h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                                        Official Rate
                                    </p>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => {
                                            setEditingRate(config.fuelType);
                                            setNewRate(config.currentRate.toString());
                                        }}
                                        className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                        <TrendingUp size={18} />
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <Input
                                        label="New Rate (PKR)"
                                        type="number"
                                        step="0.01"
                                        value={newRate}
                                        onChange={e => setNewRate(e.target.value)}
                                        required
                                    />
                                    <select
                                        value={reason}
                                        onChange={e =>
                                            setReason(e.target.value as RateChangeReason)
                                        }
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium"
                                    >
                                        {reasonOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={() => setEditingRate(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() => handleSaveRate(config.fuelType)}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-slate-900">
                                            PKR {config.currentRate.toFixed(2)}
                                        </span>
                                        <span className="text-sm font-bold text-slate-400">
                                            / Litre
                                        </span>
                                    </div>

                                    {diff !== 0 && (
                                        <div
                                            className={clsx(
                                                'flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-2xl w-fit',
                                                diff > 0
                                                    ? 'bg-rose-50 text-rose-500'
                                                    : 'bg-emerald-50 text-emerald-500'
                                            )}
                                        >
                                            {diff > 0 ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingUp size={14} className="rotate-180" />
                                            )}
                                            {diff > 0 ? '+' : ''}
                                            {diff.toFixed(2)} ({percent.toFixed(2)}%)
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-slate-50 flex items-center gap-2">
                                        <Clock size={14} className="text-slate-300" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Effective:{' '}
                                            {new Date(config.effectiveFrom).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {showHistory && (
                <Card className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-xl mt-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">
                        Price Revision History
                    </h3>
                    <div className="space-y-3">
                        {rateChangeHistory
                            .slice()
                            .reverse()
                            .map(change => (
                                <div
                                    key={change.id}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={clsx(
                                                'w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg',
                                                change.rateDifference > 0
                                                    ? 'bg-rose-500 shadow-rose-200'
                                                    : 'bg-emerald-500 shadow-emerald-200'
                                            )}
                                        >
                                            <History size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">
                                                {getFuelTypeLabel(change.fuelType)}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium">
                                            By {change.changedBy ?? change.reason.replace('_', ' ')}
                                                {change.reason.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-800">
                                            PKR {change.newRate.toFixed(2)}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400">
                                            {new Date(change.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

// ============================================
// ALERT CONFIGURATION TAB
// ============================================

const AlertConfigurationTab: React.FC = () => {
    const {
        alertConfigs,
        updateAlertConfig,
        getActiveAlerts,
        getUnreadAlerts,
        dismissAlert,
        markAlertRead,
    } = useConfigStore();
    const unreadAlerts = getUnreadAlerts();
    const activeAlerts = getActiveAlerts();

    const getAlertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            LOW_INVENTORY: 'Low Inventory Alert',
            OVERDUE_PAYMENT: 'Overdue Payment Alert',
            CASH_VARIANCE: 'Cash Variance Alert',
            RATE_CHANGE: 'Rate Change Notification',
            MAINTENANCE_DUE: 'Maintenance Due Alert',
            CREDIT_LIMIT_EXCEEDED: 'Credit Limit Exceeded',
            DISCOUNT_LIMIT_EXCEEDED: 'Discount Limit Exceeded',
            SHIFT_VARIANCE_HIGH: 'High Shift Variance',
        };
        return labels[type] || type;
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'LOW_INVENTORY':
            case 'MAINTENANCE_DUE':
                return Droplets;
            case 'OVERDUE_PAYMENT':
            case 'CREDIT_LIMIT_EXCEEDED':
                return CreditCard;
            case 'CASH_VARIANCE':
            case 'SHIFT_VARIANCE_HIGH':
                return AlertTriangle;
            case 'RATE_CHANGE':
                return TrendingUp;
            default:
                return Bell;
        }
    };



    return (
        <div className="space-y-8">
            {activeAlerts.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">Critical Notifications</h3>
                        {unreadAlerts.length > 0 && (
                            <Badge className="bg-rose-500 text-white rounded-lg px-3 py-1">
                                {unreadAlerts.length} Unread
                            </Badge>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {activeAlerts.slice(0, 5).map(alert => {
                            const Icon = getAlertIcon(alert.type);
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={alert.id}
                                    className={clsx(
                                        'p-6 rounded-[2rem] border transition-all duration-300 flex items-start gap-5 cursor-pointer',
                                        !alert.isRead
                                            ? 'bg-white border-blue-500/20 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/10'
                                            : 'bg-slate-50 border-slate-100 opacity-80'
                                    )}
                                    onClick={() => markAlertRead(alert.id)}
                                >
                                    <div
                                        className={clsx(
                                            'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg',
                                            alert.severity === 'CRITICAL'
                                                ? 'bg-rose-500 shadow-rose-200 text-white'
                                                : alert.severity === 'WARNING'
                                                  ? 'bg-amber-500 shadow-amber-200 text-white'
                                                  : 'bg-blue-500 shadow-blue-200 text-white'
                                        )}
                                    >
                                        <Icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-black text-slate-800 text-lg mb-1">
                                                    {alert.title}
                                                </p>
                                                <p className="text-slate-500 font-medium leading-relaxed">
                                                    {alert.message}
                                                </p>
                                            </div>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    dismissAlert(
                                                        alert.id,
                                                        getCurrentUserId()
                                                    );
                                                }}
                                                className="p-3 hover:bg-slate-200/50 rounded-2xl transition-all text-slate-400"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                                            Triggered {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    System Thresholds & Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {alertConfigs.map(config => (
                        <Card
                            key={config.id}
                            className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-xl relative overflow-hidden group"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={clsx(
                                            'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg',
                                            config.isEnabled
                                                ? 'bg-slate-900 text-white shadow-slate-200'
                                                : 'bg-slate-100 text-slate-400 shadow-none'
                                        )}
                                    >
                                        <Bell size={28} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-800">
                                            {getAlertTypeLabel(config.type)}
                                        </p>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                            Automated Monitor
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        updateAlertConfig(config.id, {
                                            isEnabled: !config.isEnabled,
                                        })
                                    }
                                    className={clsx(
                                        'relative w-16 h-8 rounded-full transition-all duration-500 p-1 mb-2',
                                        config.isEnabled
                                            ? 'bg-emerald-500 shadow-lg shadow-emerald-200'
                                            : 'bg-slate-200'
                                    )}
                                >
                                    <motion.div
                                        animate={{ x: config.isEnabled ? 32 : 0 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Trigger Condition
                                    </p>
                                    <p className="font-bold text-slate-800">
                                        {config.threshold
                                            ? `Value exceeds ${config.threshold}${config.type === 'CASH_VARIANCE' ? '%' : ' Units'}`
                                            : 'Continuous system monitoring'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-blue-500" />
                                    <p className="text-xs font-bold text-slate-500">
                                        Notifying:{' '}
                                        <span className="text-slate-800">
                                            {config.notifyRoles.join(' • ')}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConfigurationSettingsPage;

