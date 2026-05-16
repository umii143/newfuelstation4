import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ShieldAlert, Lock } from 'lucide-react';
import { auditLogger } from '@/lib/auditLogger';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    featureName: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, featureName }) => {
    const { user, isAuthenticated } = useAuthStore();
    const currentRole = user?.role?.toUpperCase() || 'GUEST';
    const isAllowed = allowedRoles.map(r => r.toUpperCase()).includes(currentRole);

    React.useEffect(() => {
        if (user && !isAllowed) {
            console.warn(`[SECURITY] Unauthorized access attempt to ${featureName} by ${user?.email} (Role: ${currentRole})`);
            auditLogger.log('SECURITY', 'UNAUTHORIZED_ACCESS', `Unauthorized access attempt to ${featureName} by role ${currentRole}`, featureName);
        }
    }, [isAuthenticated, isAllowed, currentRole, user, featureName]);

    if (!isAuthenticated) return null;

    if (!isAllowed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-rose-50/50 rounded-3xl border-2 border-dashed border-rose-200">
                <div className="bg-rose-100 p-4 rounded-full mb-6">
                    <Lock className="text-rose-600" size={48} />
                </div>
                <h2 className="text-2xl font-black text-rose-900 mb-2">Access Restricted</h2>
                <p className="text-rose-700 text-center max-w-md mb-8">
                    This high-security module ({featureName}) is reserved for <strong>{allowedRoles.join(' or ')}</strong> roles only. 
                    Your attempt has been logged in the Group Forensic Audit.
                </p>
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest">
                    <ShieldAlert size={14} />
                    <span>Forensic Lock Active</span>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
