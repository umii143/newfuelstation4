import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useShiftControlStore } from '@/stores/shiftControlStore';
import { Droplet, Gauge, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import SalesmanLogin from './SalesmanLogin';

export default function ShiftOpenWizard({ onComplete }: { onComplete: () => void }) {
    const { 
        wizardStep, 
        setWizardStep, 
        pendingNozzleReadings, 
        pendingTankReadings,
        cashInHand,
        updateNozzleReading,
        updateTankReading,
        setCashInHand,
        startShift
    } = useShiftControlStore();

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <SalesmanLogin onSuccess={() => setIsAuthenticated(true)} />;
    }

    const handleStart = () => {
        startShift();
        onComplete();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Start New Shift</h1>
                <div className="flex gap-2">
                    {[1, 2, 3].map(step => (
                        <div key={step} className={`h-2 w-16 rounded-full ${wizardStep >= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                </div>
            </div>

            {wizardStep === 1 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Gauge className="text-blue-500" />
                            Step 1: Manual Nozzle Opening Readings
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingNozzleReadings.map((nozzle) => (
                                <div key={nozzle.nozzleId} className="space-y-2 border border-gray-100 dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-gray-900">
                                    <div className="flex justify-between">
                                        <label className="font-semibold">{nozzle.nozzleName}</label>
                                        <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                                            {nozzle.fuelType}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-xs text-gray-500">Opening Meter Reading</label>
                                        <Input 
                                            type="number" 
                                            value={nozzle.opening || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNozzleReading(nozzle.nozzleId, { opening: Number(e.target.value) })}
                                            className="text-lg font-mono mt-1"
                                            placeholder="Enter exact meter reading"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <Button onClick={() => setWizardStep(2)} size="lg">
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {wizardStep === 2 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <Droplet className="text-emerald-500" />
                            Step 2: Manual Tank Dip-Stick Readings
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingTankReadings.map((tank) => (
                                <div key={tank.tankId} className="space-y-2 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-lg bg-white dark:bg-gray-900">
                                    <div className="flex justify-between">
                                        <label className="font-semibold">{tank.tankName}</label>
                                        <span className="text-sm px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 rounded text-emerald-700 dark:text-emerald-400">
                                            {tank.fuelType}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-xs text-gray-500">Opening Dip-Stick Volume (Liters)</label>
                                        <Input 
                                            type="number" 
                                            value={tank.openingDip || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTankReading(tank.tankId, { openingDip: Number(e.target.value) })}
                                            className="text-lg font-mono mt-1 border-emerald-200 focus-visible:ring-emerald-500"
                                            placeholder="Enter manual dip stick volume"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <Button onClick={() => setWizardStep(1)} variant="secondary" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={() => setWizardStep(3)} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {wizardStep === 3 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <CheckCircle2 className="text-amber-500" />
                            Step 3: Initial Cash & Confirmation
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="max-w-md mx-auto space-y-6 text-center py-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash in Hand / Float (PKR)</label>
                                <p className="text-xs text-gray-500 mb-2">Enter any cash given to you at shift start</p>
                                <Input 
                                    type="number" 
                                    value={cashInHand || ''} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCashInHand(Number(e.target.value))}
                                    className="text-3xl h-16 font-mono text-center border-amber-200 focus-visible:ring-amber-500"
                                    placeholder="0"
                                />
                            </div>
                            
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left mt-8">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summary</h4>
                                <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-400">
                                    <li>✓ Verified {pendingNozzleReadings.length} nozzle meters</li>
                                    <li>✓ Verified {pendingTankReadings.length} tank dip-sticks</li>
                                    <li>✓ Recorded float cash: ₨ {cashInHand.toLocaleString()}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <Button onClick={() => setWizardStep(2)} variant="secondary" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <CheckCircle2 className="mr-2 h-5 w-5" /> Start Shift Now
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
