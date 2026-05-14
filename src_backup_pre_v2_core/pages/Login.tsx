import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { PINLogin } from '@/components/auth/PINLogin';
import { useAuthStore } from '@/stores/authStore';
import { useStaffStore } from '@/stores/dataStores';
import * as Tabs from '@radix-ui/react-tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint, Globe, KeyRound, Lightbulb, Shield, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';

export const LoginPage: React.FC = () => {
    const { isLoading, error, loginWithPIN, loginWithBackend, loginWithGoogle, setError } =
        useAuthStore();

    const { users: staffUsers } = useStaffStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [activeTab, setActiveTab] = useState('quick');

    const handlePINSubmit = async (pin: string) => {
        await loginWithPIN(pin, staffUsers);
    };

    const handleGoogleLogin = async () => {
        await loginWithGoogle();
    };

    const handleEmailAuth = async (e: React.FormEvent, isSignupMode: boolean) => {
        e.preventDefault();
        if (isSignupMode) {
            // Future: signup logic
            setError(
                'Self-registration is disabled for this organization. Contact your administrator.'
            );
        } else {
            await loginWithBackend(email, password);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Advanced Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            </div>

            {/* Animated Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Branding & Features */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:block space-y-8 text-white"
                >
                    {/* Logo & Title */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <Zap className="w-8 h-8 text-white" fill="white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                    Motorway Oil
                                </h1>
                                <p className="text-sm text-slate-400 italic">
                                    Next-Gen Fuel Management Hub
                                </p>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Unified Platform for
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                Elite Fuel Operations
                            </span>
                        </h2>
                        <p className="text-lg text-slate-300">
                            Experience the future of station management with deep analytics,
                            immutable security, and real-time station-wide sync.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            {
                                icon: Shield,
                                title: 'Multi-Factor Defense',
                                desc: 'Enterprise-grade security with real-time session monitoring.',
                            },
                            {
                                icon: Lightbulb,
                                title: 'Shift Intelligence',
                                desc: 'Automated variance detection and recovery tracking.',
                            },
                            {
                                icon: Sparkles,
                                title: 'Premium Interface',
                                desc: 'High-performance glassmorphic UI optimized for speed.',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">99.9%</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">
                                Uptime
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">256-bit</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">
                                AES-SEC
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">ISO 27001</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">
                                COMPLIANT
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Login Hub */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
                >
                    <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] p-1 shadow-2xl border border-white/20 relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full filter blur-[100px] opacity-10" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500 rounded-full filter blur-[100px] opacity-10" />

                        <div className="bg-slate-900/40 rounded-[2.25rem] p-8 relative z-10">
                            <Tabs.Root
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-white mb-2">
                                        Member Login
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Select your preferred entry mode
                                    </p>
                                </div>

                                <Tabs.List className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                                    <Tabs.Trigger
                                        value="quick"
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white"
                                    >
                                        <Fingerprint className="w-4 h-4" />
                                        Quick
                                    </Tabs.Trigger>
                                    <Tabs.Trigger
                                        value="sso"
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white"
                                    >
                                        <Globe className="w-4 h-4" />
                                        SSO
                                    </Tabs.Trigger>
                                    <Tabs.Trigger
                                        value="staff"
                                        className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 hover:text-white"
                                    >
                                        <KeyRound className="w-4 h-4" />
                                        Staff
                                    </Tabs.Trigger>
                                </Tabs.List>

                                <div className="min-h-[300px] flex flex-col justify-center overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="w-full"
                                        >
                                            <Tabs.Content value={activeTab} forceMount>
                                                {activeTab === 'quick' && (
                                                    <PINLogin
                                                        onPINSubmit={handlePINSubmit}
                                                        isLoading={isLoading}
                                                        error={error}
                                                    />
                                                )}

                                                {activeTab === 'sso' && (
                                                    <div className="space-y-6 text-center">
                                                        <div className="space-y-2">
                                                            <h3 className="text-xl font-bold text-white">
                                                                Enterprise SSO
                                                            </h3>
                                                            <p className="text-sm text-slate-400">
                                                                Secure login for corporate accounts
                                                                and managers.
                                                            </p>
                                                        </div>
                                                        <GoogleSignInButton
                                                            onClick={handleGoogleLogin}
                                                            isLoading={isLoading}
                                                        />
                                                    </div>
                                                )}

                                                {activeTab === 'staff' && (
                                                    <EmailPasswordForm
                                                        email={email}
                                                        setEmail={setEmail}
                                                        password={password}
                                                        setPassword={setPassword}
                                                        isLoading={isLoading}
                                                        error={error}
                                                        isSignup={isSignup}
                                                        setIsSignup={setIsSignup}
                                                        onSubmit={handleEmailAuth}
                                                    />
                                                )}
                                            </Tabs.Content>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Hub Footer */}
                                <div className="pt-6 border-t border-white/5 text-center">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">
                                        Enterprise Security Infrastructure
                                    </p>
                                    <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 font-medium">
                                        <span className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-default">
                                            <Shield className="w-3.5 h-3.5" />
                                            SECURE ENCLAVE
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-default">
                                            <Fingerprint className="w-3.5 h-3.5" />
                                            BIOMETRIC READY
                                        </span>
                                    </div>
                                    <p className="mt-8 text-[11px] text-slate-500">
                                        Powered by{' '}
                                        <span className="text-transparent bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text font-bold">
                                            Umar Ali ⚡
                                        </span>
                                    </p>
                                </div>
                            </Tabs.Root>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
