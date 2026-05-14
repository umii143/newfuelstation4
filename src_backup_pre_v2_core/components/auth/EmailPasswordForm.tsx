import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';

interface EmailPasswordFormProps {
    onSubmit: (e: React.FormEvent, isSignup: boolean) => void;
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    isLoading: boolean;
    error: string | null;
    isSignup: boolean;
    setIsSignup: (v: boolean) => void;
}

export const EmailPasswordForm: React.FC<EmailPasswordFormProps> = ({
    onSubmit,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    isSignup,
    setIsSignup,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={e => onSubmit(e, isSignup)} className="space-y-5">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                        disabled={isLoading}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="text-center text-sm text-slate-300">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                    type="button"
                    onClick={() => setIsSignup(!isSignup)}
                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                    {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
            </div>
        </form>
    );
};
