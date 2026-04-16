import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { POSSales } from './components/POSSales';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { Suppliers } from './components/Suppliers';
import { Reports } from './components/Reports';
import { PlaceholderView } from './components/PlaceholderView';
import { Wallet, Building2, RefreshCw, CreditCard, Settings } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POSSales />;
      case 'inventory':
        return <Inventory />;
      case 'customers':
        return <Customers />;
      case 'reports':
        return <Reports />;
      case 'suppliers':
        return <Suppliers />;
      case 'expenses':
        return (
          <PlaceholderView
            title="Expense Tracking"
            description="Monitor and categorize all business expenses for better financial control."
            icon={<Wallet className="w-12 h-12 text-white" />}
          />
        );
      case 'bank':
        return (
          <PlaceholderView
            title="Bank Accounts"
            description="Manage multiple bank accounts and track all financial transactions."
            icon={<Building2 className="w-12 h-12 text-white" />}
          />
        );
      case 'recoveries':
        return (
          <PlaceholderView
            title="Recoveries"
            description="Track and manage outstanding payments and recovery schedules."
            icon={<RefreshCw className="w-12 h-12 text-white" />}
          />
        );
      case 'credits':
        return (
          <PlaceholderView
            title="Credit Management"
            description="Monitor customer credits, set limits, and track payment schedules."
            icon={<CreditCard className="w-12 h-12 text-white" />}
          />
        );
      case 'settings':
        return (
          <PlaceholderView
            title="System Settings"
            description="Configure system preferences, user permissions, and business settings."
            icon={<Settings className="w-12 h-12 text-white" />}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/40 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">MO</span>
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MOTORWAY OIL
              </h1>
              <p className="text-xs text-gray-600 font-semibold">Enterprise v2050</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-12 h-12 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-purple-600" />
            ) : (
              <Menu className="w-6 h-6 text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div className={`
        fixed top-0 left-0 h-screen transition-transform duration-300 z-50
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activeView={activeView} setActiveView={handleViewChange} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 pt-20 lg:pt-0 p-4 md:p-6 lg:p-8 relative z-10">
        {renderView()}
      </div>
    </div>
  );
}
