import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { LoginPage } from '@/pages/Login';
import { useAuthStore, useSettingsStore } from '@/stores/authStore';
import { useFirestoreInit } from '@/hooks/useFirestoreInit';
import React, { Suspense, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/db';

// ── Lazy-loaded pages (code splitting) ──────────────────────
const CNGActivityPage = React.lazy(() => import('@/pages/cng/CNGActivity').then(m => ({ default: m.CNGActivityPage })));
const CNGBanksPage = React.lazy(() => import('@/pages/cng/CNGBanks').then(m => ({ default: m.CNGBanksPage })));
const CNGDashboard = React.lazy(() => import('@/pages/cng/CNGDashboard').then(m => ({ default: m.CNGDashboard })));
const CNGDiscountsPage = React.lazy(() => import('@/pages/cng/CNGDiscounts').then(m => ({ default: m.CNGDiscountsPage })));
const CNGInventoryPage = React.lazy(() => import('@/pages/cng/CNGInventory').then(m => ({ default: m.CNGInventoryPage })));
const CNGRatesPage = React.lazy(() => import('@/pages/cng/CNGRates').then(m => ({ default: m.CNGRatesPage })));
const CNGReportsPage = React.lazy(() => import('@/pages/cng/CNGReports').then(m => ({ default: m.CNGReportsPage })));
const CNGSettingsPage = React.lazy(() => import('@/pages/cng/CNGSettings').then(m => ({ default: m.CNGSettingsPage })));
const CNGShiftsPage = React.lazy(() => import('@/pages/cng/CNGShifts').then(m => ({ default: m.CNGShiftsPage })));
const CNGStaffPage = React.lazy(() => import('@/pages/cng/CNGStaff').then(m => ({ default: m.CNGStaffPage })));
const ConfigurationSettingsPage = React.lazy(() => import('@/pages/ConfigurationSettings').then(m => ({ default: m.ConfigurationSettingsPage })));
const DashboardPage = React.lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const BankCashPage = React.lazy(() => import('@/pages/financials/BankCash').then(m => ({ default: m.BankCashPage })));
const CashReconciliation = React.lazy(() => import('@/pages/financials/CashReconciliation'));
const CustomersPage = React.lazy(() => import('@/pages/financials/Customers').then(m => ({ default: m.CustomersPage })));
const DigitalCashPage = React.lazy(() => import('@/pages/financials/DigitalCash').then(m => ({ default: m.DigitalCashPage })));
const ExpensesPage = React.lazy(() => import('@/pages/financials/Expenses').then(m => ({ default: m.ExpensesPage })));
const SuppliersPage = React.lazy(() => import('@/pages/financials/Suppliers').then(m => ({ default: m.SuppliersPage })));
const FuelDashboard = React.lazy(() => import('@/pages/fuel/FuelDashboard').then(m => ({ default: m.FuelDashboard })));
const PriceManagement = React.lazy(() => import('@/pages/fuel/PriceManagement'));
const PurchaseOrdersPage = React.lazy(() => import('@/pages/fuel/PurchaseOrders').then(m => ({ default: m.PurchaseOrdersPage })));
const ShiftActivityPage = React.lazy(() => import('@/pages/fuel/ShiftActivity').then(m => ({ default: m.ShiftActivityPage })));
const ShiftsPage = React.lazy(() => import('@/pages/fuel/Shifts'));
const TanksPage = React.lazy(() => import('@/pages/fuel/Tanks').then(m => ({ default: m.TanksPage })));
const CashBankPage = React.lazy(() => import('@/pages/lube/CashBank'));
const CreditsPage = React.lazy(() => import('@/pages/lube/Credits').then(m => ({ default: m.CreditsPage })));
const LubeDashboard = React.lazy(() => import('@/pages/lube/Dashboard').then(m => ({ default: m.LubeDashboard })));
const LubeSettingsPage = React.lazy(() => import('@/pages/lube/LubeSettings').then(m => ({ default: m.LubeSettingsPage })));
const POSPage = React.lazy(() => import('@/pages/lube/POS').then(m => ({ default: m.POSPage })));
const ProductsPage = React.lazy(() => import('@/pages/lube/Products').then(m => ({ default: m.ProductsPage })));
const LubePurchaseOrdersPage = React.lazy(() => import('@/pages/lube/PurchaseOrders').then(m => ({ default: m.LubePurchaseOrdersPage })));
const RecoveriesPage = React.lazy(() => import('@/pages/lube/Recoveries').then(m => ({ default: m.RecoveriesPage })));
const LubeReportsPage = React.lazy(() => import('@/pages/lube/Reports').then(m => ({ default: m.LubeReportsPage })));
const RateImpactPage = React.lazy(() => import('@/pages/RateImpact').then(m => ({ default: m.RateImpactPage })));
const ReportsPage = React.lazy(() => import('@/pages/reports/Reports').then(m => ({ default: m.ReportsPage })));
const SecuritySettings = React.lazy(() => import('@/pages/SecuritySettings'));
const AttendancePage = React.lazy(() => import('@/pages/staff/Attendance').then(m => ({ default: m.AttendancePage })));
const PerformancePage = React.lazy(() => import('@/pages/staff/Performance').then(m => ({ default: m.PerformancePage })));
const StaffAccountsPage = React.lazy(() => import('@/pages/staff/StaffAccounts'));
const StaffManagerPage = React.lazy(() => import('@/pages/staff/StaffManager'));

const App: React.FC = () => {
    const { isAuthenticated, checkAuth } = useAuthStore();
    const { settings } = useSettingsStore();
    const [currentPath, setCurrentPath] = useState('/');
    const [authInitialized, setAuthInitialized] = useState(false);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const initAuth = async () => {
            try {
                const { onAuthChange } = await import('@/lib/firebase');
                const unsubscribe = onAuthChange(async user => {
                    if (user) {
                        try {
                            // Fetch user's station mapping from Firestore
                            const userRef = doc(db, 'users', user.uid);
                            const userSnap = await getDoc(userRef);
                            
                            let userStationId = 'STN-001'; // Default legacy fallback
                            
                            if (userSnap.exists()) {
                                userStationId = userSnap.data().stationId || 'STN-001';
                            } else {
                                // First time login - provision their profile
                                await setDoc(userRef, {
                                    email: user.email,
                                    name: user.displayName || user.email || 'Admin',
                                    role: 'admin',
                                    stationId: 'STN-001',
                                    createdAt: new Date().toISOString()
                                });
                            }

                            // Firebase user detected, update auth store
                            useAuthStore.setState({
                                isAuthenticated: true,
                                user: {
                                    userId: user.uid,
                                    name: user.displayName || user.email || 'User',
                                    email: user.email || '',
                                    phone: user.phoneNumber || '',
                                    role: 'admin',
                                    theme: 'glassy-white',
                                    language: 'en',
                                    businessUnit: localStorage.getItem('businessUnit') || 'FUEL',
                                    stationId: userStationId,
                                    organizationId: user.uid, // use Firebase UID as org until backend is connected
                                },
                            });
                        } catch (err) {
                            console.error('Failed to fetch user profile:', err);
                            // Fallback if firestore fails
                            useAuthStore.setState({
                                isAuthenticated: true,
                                user: {
                                    userId: user.uid,
                                    name: user.displayName || 'User',
                                    email: user.email || '',
                                    phone: '', role: 'admin', theme: 'glassy-white', language: 'en',
                                    businessUnit: 'FUEL', stationId: 'STN-001', organizationId: user.uid
                                }
                            });
                        }
                    } else {
                        // No Firebase user - clear auth state
                        useAuthStore.setState({
                            isAuthenticated: false,
                            user: null,
                        });
                    }
                    setAuthInitialized(true);
                });

                return unsubscribe;
            } catch (error) {
                console.error('Firebase init error:', error);
                setAuthInitialized(true);
            }
        };

        initAuth();
    }, []);

    // Check auth on app load (after Firebase initializes)
    useEffect(() => {
        if (authInitialized) {
            checkAuth();
        }
    }, [authInitialized]);

    // Initialize Firestore and hydrate stores on login
    const { isLoading: isFirestoreLoading } = useFirestoreInit();

    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };
        handleLocationChange();
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const navigate = (path: string) => {
        setCurrentPath(path);
        window.history.pushState({}, '', path);
        window.scrollTo(0, 0);
    };

    // Show loading while Firebase initializes
    if (!authInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    const renderPage = () => {
        switch (currentPath) {
            case '/':
                if (settings.businessUnit === 'LUBE') return <LubeDashboard />;
                if (settings.businessUnit === 'CNG') return <CNGDashboard onNavigate={navigate} />;
                if (settings.businessUnit === 'FUEL')
                    return <FuelDashboard onNavigate={navigate} />;
                return <DashboardPage onNavigate={navigate} />;
            // Fuel Management
            case '/fuel':
            case '/fuel/shifts':
                return <ShiftsPage onNavigate={navigate} />;
            case '/fuel/activity':
                return <ShiftActivityPage />;
            case '/fuel/tanks':
                return <TanksPage />;
            case '/fuel/orders':
                return <PurchaseOrdersPage />;
            case '/fuel/pricing':
                return <PriceManagement />;

            // Lube Management
            case '/lube/dashboard':
                return <LubeDashboard />;
            case '/lube/pos':
                return <POSPage />;
            case '/lube/products':
                return <ProductsPage onNavigate={navigate} />;
            case '/lube/orders':
                return <LubePurchaseOrdersPage />;
            case '/lube/credits':
                return <CreditsPage />;
            case '/lube/recoveries':
                return <RecoveriesPage />;
            case '/lube/suppliers':
                return <SuppliersPage />;
            case '/lube/expenses':
                return <ExpensesPage />;
            case '/lube/cash-bank':
                return <CashBankPage />;
            case '/lube/reports':
                return <LubeReportsPage />;
            case '/lube/settings':
                return <LubeSettingsPage />;

            // CNG Management
            case '/cng/dashboard':
                return <CNGDashboard onNavigate={navigate} />;
            case '/cng/shifts':
                return <CNGShiftsPage />;
            case '/cng/activity':
                return <CNGActivityPage />;
            case '/cng/tanks':
                return <CNGInventoryPage />;
            case '/cng/credits':
                return <CreditsPage />;
            case '/cng/recoveries':
                return <RecoveriesPage />;
            case '/cng/rates':
                return <CNGRatesPage />;
            case '/cng/reports':
                return <CNGReportsPage />;
            case '/cng/settings':
                return <CNGSettingsPage />;
            case '/cng/staff':
                return <CNGStaffPage />;
            case '/cng/banks':
                return <CNGBanksPage />;
            case '/cng/discounts':
                return <CNGDiscountsPage />;

            // Shared / Financials
            case '/customers':
                return <CustomersPage />;
            case '/suppliers':
                return <SuppliersPage />;
            case '/expenses':
                return <ExpensesPage />;
            case '/cash-banks':
                return <BankCashPage />;
            case '/financials/reconciliation':
                return <CashReconciliation />;
            case '/financials/digital-cash':
                return <DigitalCashPage />;

            // Staff Management
            case '/staff':
                return <StaffManagerPage />;
            case '/staff/attendance':
                return <AttendancePage />;
            case '/staff/performance':
                return <PerformancePage />;
            case '/staff/accounts':
                return <StaffAccountsPage />;

            // System
            case '/reports':
                return <ReportsPage />;
            case '/security':
                return <SecuritySettings />;
            case '/settings':
                return <ConfigurationSettingsPage />;
            case '/rate-impact':
                return <RateImpactPage />;

            case '/digital-cash':
                return <DigitalCashPage />;

            default:
                return <DashboardPage onNavigate={navigate} />;
        }
    };

    if (isAuthenticated && isFirestoreLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#f1f5f9]">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-slate-800">Connecting to Cloud...</h2>
                <p className="text-slate-500">Syncing station data in real-time</p>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <Layout currentPath={currentPath} onNavigate={navigate}>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    }
                >
                    {renderPage()}
                </Suspense>
            </Layout>
        </ErrorBoundary>
    );
};

export default App;
