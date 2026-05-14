import { Button, Card, PageHeader } from '@/components/ui';
import { useStaffStore } from '@/stores/dataStores';
import { useStaffLedgerStore } from '@/stores/ledgerStore';
import { User, UserRole } from '@/types';
import clsx from 'clsx';
import { format } from 'date-fns';
import {
    BadgeCheck,
    ClipboardList,
    Edit2,
    Filter,
    Phone,
    Search,
    Shield,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

const StaffManager: React.FC = () => {
    const {
        getActiveStaff,
        addStaff,
        updateStaff,
        deleteStaff,
        isLoading,
        error: storeError,
    } = useStaffStore();
    const { getStaffBalance } = useStaffLedgerStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        phone: '',
        role: 'ATTENDANT',
        status: 'ACTIVE',
        baseSalary: 0,
        cnic: '',
    });

    const roles: UserRole[] = [
        'OWNER',
        'MANAGER',
        'CASHIER',
        'ATTENDANT',
        'AUDITOR',
        'SECURITY_GUARD',
        'SALESMAN',
        'CLERK',
        'CLEANER',
        'OFFICE_STAFF',
    ];

    const filteredStaff = getActiveStaff().filter(staff => {
        const matchesSearch =
            staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.phone.includes(searchTerm);
        const matchesRole = roleFilter === 'ALL' || staff.role === roleFilter;
        return matchesSearch && matchesRole && staff.status !== 'INACTIVE';
    });

    const handleAddStaff = async () => {
        if (!formData.name || !formData.phone) return;
        setLocalError(null);
        try {
            await addStaff(formData as Omit<User, 'userId' | 'createdAt'>);
            setIsAddModalOpen(false);
            resetForm();
        } catch (err: any) {
            setLocalError(err.message || 'Failed to add staff member');
        }
    };

    const handleUpdateStaff = async () => {
        if (!selectedStaff || !formData.name) return;
        setLocalError(null);
        try {
            await updateStaff(selectedStaff.userId, formData);
            setSelectedStaff(null);
            resetForm();
        } catch (err: any) {
            setLocalError(err.message || 'Failed to update staff member');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            role: 'ATTENDANT',
            status: 'ACTIVE',
            baseSalary: 0,
            cnic: '',
        });
    };

    const openEditModal = (staff: User) => {
        setSelectedStaff(staff);
        setFormData(staff);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <PageHeader
                title="Staff Management"
                subtitle="Manage your team members, roles and payroll accounts"
                actions={
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New Staff
                    </Button>
                }
            />

            {getActiveStaff().length === 0 ? (
                <Card className="p-16 border-dashed border-2 border-blue-100 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 shadow-inner">
                        <Users size={48} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            No Staff Members Registered
                        </h2>
                        <p className="text-gray-500 max-w-sm mt-2 font-medium">
                            Your current business unit needs staff to operate. Register your first Attendant,
                            Manager or Cashier to start tracking performance.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => setIsAddModalOpen(true)}
                        className="font-black uppercase tracking-widest text-xs h-14 px-8 shadow-2xl shadow-blue-500/40"
                    >
                        Register First Staff Member
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-blue-50/50 border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                                Total Staff
                            </p>
                            <p className="text-2xl font-bold text-blue-900">
                                {getActiveStaff().length}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-green-50/50 border-green-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-green-600 uppercase tracking-wider">
                                Active Now
                            </p>
                            <p className="text-2xl font-bold text-green-900">
                                {getActiveStaff().filter(u => u.status === 'ACTIVE').length}
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BadgeCheck className="w-5 h-5 text-green-600" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-purple-50/50 border-purple-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                                Managers
                            </p>
                            <p className="text-2xl font-bold text-purple-900">
                                {getActiveStaff().filter(u => u.role === 'MANAGER').length}
                            </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-orange-50/50 border-orange-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">
                                Total Payroll
                            </p>
                            <p className="text-2xl font-bold text-orange-900">
                                ₨
                                {getActiveStaff()
                                    .filter(u => u.status === 'ACTIVE')
                                    .reduce((acc, u) => acc + (u.baseSalary || 0), 0)
                                    .toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <ClipboardList className="w-5 h-5 text-orange-600" />
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="p-4 flex flex-col md:row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search staff by name or phone..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        {roles.map(r => (
                            <option key={r} value={r}>
                                {r.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map(staff => (
                    <Card
                        key={staff.userId}
                        className="group hover:border-blue-400 transition-all duration-300 overflow-hidden"
                    >
                        <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 truncate max-w-[150px]">
                                            {staff.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                            <Shield className="w-3 h-3" />
                                            {staff.role.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(staff)}
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteStaff(staff.userId)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {staff.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <div className="flex-1 flex items-center gap-2 text-gray-600 font-medium">
                                        <BadgeCheck className="w-4 h-4 text-gray-400" />
                                        Balance
                                    </div>
                                    <span
                                        className={clsx(
                                            getStaffBalance(staff.userId) >= 0
                                                ? 'text-emerald-600'
                                                : 'text-rose-600'
                                        )}
                                    >
                                        ₨ {getStaffBalance(staff.userId).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex items-center justify-between">
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                    Joined {format(new Date(staff.createdAt), 'MMM yyyy')}
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() =>
                                        (window.location.hash = `#/reports?source=staffLedger&userId=${staff.userId}`)
                                    }
                                >
                                    View Ledger
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal for Add/Edit */}
            {(isAddModalOpen || selectedStaff) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {selectedStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {selectedStaff
                                        ? 'Update personal and financial details'
                                        : 'Enter details to onboard a new employee'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setSelectedStaff(null);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-200 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Muhammad Ali"
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.name}
                                        onChange={e =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="03xx-xxxxxxx"
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={e =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Role / Designation
                                    </label>
                                    <select
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.role}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                role: e.target.value as UserRole,
                                            })
                                        }
                                    >
                                        {roles.map(r => (
                                            <option key={r} value={r}>
                                                {r.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        Monthly Base Salary
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            ₨
                                        </span>
                                        <input
                                            type="number"
                                            className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.baseSalary}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    baseSalary: parseFloat(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                    CNIC Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="42xxx-xxxxxxx-x"
                                    className="w-full p-2.5 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.cnic}
                                    onChange={e =>
                                        setFormData({ ...formData, cnic: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50">
                            {(localError || storeError) && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold uppercase tracking-widest animate-shake">
                                    {localError || storeError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-6">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setSelectedStaff(null);
                                        resetForm();
                                        setLocalError(null);
                                    }}
                                    className="flex-1 h-12 font-bold uppercase tracking-wider text-[10px]"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={selectedStaff ? handleUpdateStaff : handleAddStaff}
                                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-bold uppercase tracking-wider text-[10px]"
                                    disabled={isLoading || !formData.name || !formData.phone}
                                >
                                    {isLoading ? (
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    ) : (
                                        <BadgeCheck className="w-4 h-4 mr-2" />
                                    )}
                                    {isLoading
                                        ? 'Processing...'
                                        : selectedStaff
                                          ? 'Update Staff Member'
                                          : 'Register Staff Member'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default StaffManager;
