import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useShiftControlStore } from '@/stores/shiftControlStore';
import { Droplet, Gauge, CheckCircle2, ArrowRight, ArrowLeft, DollarSign, AlertTriangle } from 'lucide-react';

export default function ShiftCloseReconciliation({ onComplete }: { onComplete: () => void }) {
    const { 
        activeShift,
        wizardStep, 
        setWizardStep, 
        pendingNozzleReadings, 
        pendingTankReadings,
        updateNozzleReading,
        updateTankReading,
        completeShift
    } = useShiftControlStore();

    const [actualCash, setActualCash] = useState<number>(0);
    const [varianceNotes, setVarianceNotes] = useState('');

    // Pre-fill closing with current reading to avoid 0s
    useEffect(() => {
        if (wizardStep === 1) {
            pendingNozzleReadings.forEach(n => {
                if (!n.closing || n.closing === 0) updateNozzleReading(n.nozzleId, { closing: n.opening });
            });
            pendingTankReadings.forEach(t => {
                if (!t.closingDip || t.closingDip === 0) updateTankReading(t.tankId, { closingDip: t.openingDip });
            });
        }
    }, [wizardStep]);

    const handleClose = async () => {
        await completeShift(actualCash, varianceNotes);
        onComplete();
    };

    const totalRevenue = pendingNozzleReadings.reduce((sum, n) => sum + (n.revenue || 0), 0);
    const expectedCash = totalRevenue + (activeShift?.cashInHand || 0);
    const variance = actualCash - expectedCash;
    const variancePercentage = expectedCash > 0 ? (Math.abs(variance) / expectedCash) * 100 : 0;
    const isVarianceHigh = variancePercentage > 0.5;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Close Shift Reconciliation</h1>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(step => (
                        <div key={step} className={`h-2 w-16 rounded-full ${wizardStep >= step ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                </div>
            </div>

            {wizardStep === 1 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Gauge className="text-red-500" />
                            Step 1: Manual Nozzle Closing Readings
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6">
                            {pendingNozzleReadings.map((nozzle) => (
                                <div key={nozzle.nozzleId} className="flex flex-col sm:flex-row gap-4 border border-gray-100 dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-gray-900 items-start sm:items-center">
                                    <div className="flex-1">
                                        <label className="font-semibold">{nozzle.nozzleName}</label>
                                        <div className="text-sm text-gray-500 mt-1">Opening: {nozzle.opening}</div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Closing Meter</label>
                                        <Input 
                                            type="number" 
                                            value={nozzle.closing || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNozzleReading(nozzle.nozzleId, { closing: Number(e.target.value) })}
                                            className="font-mono"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Test Liters (if any)</label>
                                        <Input 
                                            type="number" 
                                            value={nozzle.test || 0} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateNozzleReading(nozzle.nozzleId, { test: Number(e.target.value) })}
                                            className="font-mono"
                                        />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <div className="text-xs text-gray-500">Net Sold</div>
                                        <div className="font-bold text-lg">{nozzle.netLiters.toLocaleString()} L</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <Button onClick={() => setWizardStep(2)} size="lg" className="bg-red-600 hover:bg-red-700">
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {wizardStep === 2 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Droplet className="text-red-500" />
                            Step 2: Manual Tank Dip-Stick Closing
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingTankReadings.map((tank) => (
                                <div key={tank.tankId} className="space-y-2 border border-gray-100 dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-gray-900">
                                    <div className="flex justify-between">
                                        <label className="font-semibold">{tank.tankName}</label>
                                    </div>
                                    <div className="text-sm text-gray-500">Opening Dip: {tank.openingDip} L</div>
                                    <div className="pt-2">
                                        <label className="text-xs text-gray-500">Closing Dip-Stick Volume (Liters)</label>
                                        <Input 
                                            type="number" 
                                            value={tank.closingDip || ''} 
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTankReading(tank.tankId, { closingDip: Number(e.target.value) })}
                                            className="text-lg font-mono mt-1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <Button onClick={() => setWizardStep(1)} variant="secondary" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={() => setWizardStep(3)} size="lg" className="bg-red-600 hover:bg-red-700">
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {wizardStep === 3 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="text-red-500" />
                            Step 3: Cash Submission
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700">Expected System Values</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <span>Fuel Revenue:</span>
                                        <span className="font-mono">₨ {totalRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <span>Float (Opening Cash):</span>
                                        <span className="font-mono">₨ {(activeShift?.cashInHand || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded font-bold text-blue-700 dark:text-blue-400">
                                        <span>Expected Cash:</span>
                                        <span className="font-mono text-lg">₨ {expectedCash.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700">Physical Cash Count</h3>
                                <div>
                                    <label className="text-xs text-gray-500">Enter Total Cash Counted</label>
                                    <Input 
                                        type="number" 
                                        value={actualCash || ''} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualCash(Number(e.target.value))}
                                        className="text-3xl h-16 font-mono font-bold mt-1"
                                        placeholder="0"
                                    />
                                </div>
                                
                                {actualCash > 0 && (
                                    <div className={`p-4 rounded-lg mt-4 ${variance === 0 ? 'bg-green-50 text-green-700' : isVarianceHigh ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                        <div className="flex justify-between items-center font-bold">
                                            <span>Variance:</span>
                                            <span className="font-mono">₨ {variance > 0 ? '+' : ''}{variance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <Button onClick={() => setWizardStep(2)} variant="secondary" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button onClick={() => setWizardStep(4)} size="lg" className="bg-red-600 hover:bg-red-700" disabled={!actualCash}>
                                Next Step <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {wizardStep === 4 && (
                <Card className="shadow-lg border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle2 className="text-red-500" />
                            Step 4: Final Confirmation & Sign-Off
                        </h3>
                    </div>
                    <div className="p-6">
                        
                        {isVarianceHigh && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-800 dark:text-red-400">High Variance Detected ({variancePercentage.toFixed(2)}%)</h4>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        Your submitted cash (₨ {actualCash.toLocaleString()}) has a discrepancy of ₨ {Math.abs(variance).toLocaleString()} from the expected system value.
                                    </p>
                                    <div className="mt-3">
                                        <label className="text-xs font-semibold text-red-800 dark:text-red-400">Mandatory Explanation</label>
                                        <Input 
                                            value={varianceNotes}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVarianceNotes(e.target.value)}
                                            placeholder="Explain the shortage/excess here..."
                                            className="mt-1 border-red-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center py-6">
                            <h2 className="text-2xl font-bold mb-2">Ready to Close Shift</h2>
                            <p className="text-gray-500 mb-8">Once closed, this data is permanently logged to the immutable ledger.</p>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <Button onClick={() => setWizardStep(3)} variant="secondary" size="lg">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button 
                                onClick={handleClose} 
                                size="lg" 
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isVarianceHigh && varianceNotes.length < 5}
                            >
                                <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm & Close Shift
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
