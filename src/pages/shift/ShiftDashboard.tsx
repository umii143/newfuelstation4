import { useShiftControlStore } from '@/stores/shiftControlStore';
import ShiftOpenWizard from './ShiftOpenWizard';
import ShiftCloseReconciliation from './ShiftCloseReconciliation';
import { Card, Button } from '@/components/ui';
import { Clock, DollarSign, Activity } from 'lucide-react';

export default function ShiftDashboard() {
    const { 
        activeShift, 
        isShiftWizardOpen, 
        wizardMode, 
        openShiftWizard 
    } = useShiftControlStore();

    if (isShiftWizardOpen) {
        if (wizardMode === 'OPEN') return <ShiftOpenWizard onComplete={() => {}} />;
        if (wizardMode === 'CLOSE') return <ShiftCloseReconciliation onComplete={() => {}} />;
    }

    if (!activeShift) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Clock size={48} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">No Active Shift</h1>
                    <p className="text-lg text-gray-500 mt-2 max-w-md mx-auto">
                        There is currently no shift running. You need to authenticate and verify manual meter readings to begin.
                    </p>
                </div>
                <Button size="lg" className="h-16 px-12 text-xl" onClick={() => openShiftWizard('OPEN')}>
                    Start New Shift
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold">Active Shift: {activeShift.shiftId}</h1>
                    <p className="text-gray-500 mt-1">
                        Started by {activeShift.staffName} at {new Date(activeShift.startTime).toLocaleTimeString()}
                    </p>
                </div>
                <Button 
                    variant="danger" 
                    size="lg" 
                    onClick={() => openShiftWizard('CLOSE')}
                >
                    Close Shift
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b p-4">
                        <h3 className="text-sm font-medium">Cash in Hand (Float)</h3>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold">₨ {activeShift.cashInHand?.toLocaleString()}</div>
                    </div>
                </Card>
                <Card>
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b p-4">
                        <h3 className="text-sm font-medium">Nozzles Active</h3>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold">{activeShift.openingReadings.length}</div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions for active shift */}
            <Card>
                <div className="border-b p-4">
                    <h3 className="text-lg font-bold">Cash Sales Entry & Quick Actions</h3>
                </div>
                <div className="p-4">
                    <p className="text-gray-500 mb-6">
                        During the shift, standard sales are calculated automatically via closing readings. Use other modules to record Expenses, Digital Cash, or Credits.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="secondary" className="h-20" onClick={() => window.location.hash = '#/expenses'}>Record Expense</Button>
                        <Button variant="secondary" className="h-20" onClick={() => window.location.hash = '#/digital-cash'}>Digital Cash</Button>
                        <Button variant="secondary" className="h-20" onClick={() => window.location.hash = '#/credits'}>Issue Credit</Button>
                        <Button variant="secondary" className="h-20" onClick={() => window.location.hash = '#/recovery'}>Cash Recovery</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
