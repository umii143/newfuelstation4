import { useToastStore, type Toast } from '@/stores/toastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, Zap } from 'lucide-react';
import React, { useEffect } from 'react';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const removeToast = useToastStore((state) => state.removeToast);

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, toast.duration || 5000);
        return () => clearTimeout(timer);
    }, [toast, removeToast]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-rose-400" />,
        warning: <Zap className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    const bgColors = {
        success: 'bg-emerald-500/10 border-emerald-500/20',
        error: 'bg-rose-500/10 border-rose-500/20',
        warning: 'bg-amber-500/10 border-amber-500/20',
        info: 'bg-blue-500/10 border-blue-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            layout
            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden relative ${bgColors[toast.type]}`}
        >
            {/* Animated glow background */}
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-[shimmer_2s_infinite]`} />
            
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0 pr-8 z-10">
                <h4 className="text-sm font-bold text-white mb-0.5">{toast.title}</h4>
                {toast.message && <p className="text-sm text-slate-300 line-clamp-2">{toast.message}</p>}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors z-10"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToastStore();

    return (
        <div className="fixed bottom-0 right-0 p-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
};
