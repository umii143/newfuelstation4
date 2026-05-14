import { AlertCircle, Delete, Lock } from 'lucide-react';
import React, { useState } from 'react';

interface PINLoginProps {
    onPINSubmit: (pin: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const PINLogin: React.FC<PINLoginProps> = ({ onPINSubmit, isLoading, error }) => {
    const [pin, setPin] = useState('');

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            const nextPin = pin + num;
            setPin(nextPin);
            if (nextPin.length === 4) {
                onPINSubmit(nextPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                                pin.length >= i
                                    ? 'bg-blue-500 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                    : 'border-white/20 bg-white/5'
                            }`}
                        />
                    ))}
                </div>
                <p className="text-sm text-slate-400">Enter your 4-digit PIN for quick access</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        disabled={isLoading}
                        className="h-16 rounded-2xl bg-white/5 border border-white/10 text-2xl font-semibold text-white hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {num}
                    </button>
                ))}
                <div />
                <button
                    onClick={() => handleNumberClick('0')}
                    disabled={isLoading}
                    className="h-16 rounded-2xl bg-white/5 border border-white/10 text-2xl font-semibold text-white hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                    0
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isLoading || pin.length === 0}
                    className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-rose-500/50 active:scale-95 transition-all flex items-center justify-center disabled:opacity-20"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            <div className="pt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <Lock className="w-5 h-5 text-blue-400" />
                    <p className="text-xs text-blue-300">
                        Secure on-site access. PINs rotate every 30 days for enhanced safety.
                    </p>
                </div>
            </div>
        </div>
    );
};
