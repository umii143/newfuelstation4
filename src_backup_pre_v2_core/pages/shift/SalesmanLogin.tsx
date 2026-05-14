import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Fingerprint, Lock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function SalesmanLogin({ onSuccess }: { onSuccess: () => void }) {
    const { user } = useAuthStore();
    const [pin, setPin] = useState('');
    const [mode, setMode] = useState<'IDLE' | 'BIOMETRIC' | 'PIN'>('IDLE');
    const [error, setError] = useState('');

    const handlePinSubmit = () => {
        if (pin === '123456' || pin === '000000') {
            // Mock authentication success
            onSuccess();
        } else {
            setError('Invalid PIN. Please try again.');
            setPin('');
        }
    };

    const handleBiometricMock = () => {
        setMode('BIOMETRIC');
        setTimeout(() => {
            onSuccess();
        }, 1500); // simulate 1.5s biometric scan
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-xl border-gray-200 dark:border-gray-800">
                <div className="text-center pb-2 border-b p-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Shift Authentication</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        {(user as any)?.name || 'Salesman'}, please verify your identity to begin the shift.
                    </p>
                </div>
                <div className="p-6 space-y-6">
                    {mode === 'IDLE' && (
                        <div className="flex flex-col gap-4">
                            <Button 
                                onClick={handleBiometricMock} 
                                className="h-16 text-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Fingerprint className="mr-3 h-6 w-6" /> Scan Biometric
                            </Button>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                            </div>
                            <Button 
                                onClick={() => setMode('PIN')} 
                                variant="secondary" 
                                className="h-14 text-lg border-2"
                            >
                                <Lock className="mr-3 h-5 w-5" /> Use 6-Digit PIN
                            </Button>
                        </div>
                    )}

                    {mode === 'BIOMETRIC' && (
                        <div className="flex flex-col items-center py-8">
                            <Fingerprint className="h-24 w-24 text-emerald-500 animate-pulse" />
                            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Scanning...</p>
                            <p className="text-sm text-gray-500 mt-2">Place your finger on the sensor</p>
                        </div>
                    )}

                    {mode === 'PIN' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="flex justify-center gap-2 mb-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold
                                                ${pin.length > i ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
                                            `}
                                        >
                                            {pin.length > i ? '•' : ''}
                                        </div>
                                    ))}
                                </div>
                                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                                
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((key) => (
                                        <Button
                                            key={key}
                                            variant={key === 'OK' ? 'primary' : key === 'C' ? 'danger' : 'secondary'}
                                            className="h-14 text-xl font-medium"
                                            onClick={() => {
                                                if (key === 'C') setPin('');
                                                else if (key === 'OK') handlePinSubmit();
                                                else if (pin.length < 6) setPin(prev => prev + key);
                                            }}
                                        >
                                            {key}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full text-gray-500" onClick={() => setMode('IDLE')}>
                                Back to Biometric
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
