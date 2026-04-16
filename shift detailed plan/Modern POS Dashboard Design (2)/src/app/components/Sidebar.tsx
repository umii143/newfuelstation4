import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  TruckIcon, 
  Wallet, 
  Building2, 
  RefreshCw, 
  CreditCard, 
  FileText, 
  Settings,
  Fuel
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pos', icon: ShoppingCart, label: 'POS Sales' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'suppliers', icon: TruckIcon, label: 'Suppliers' },
    { id: 'expenses', icon: Wallet, label: 'Expenses' },
    { id: 'bank', icon: Building2, label: 'Bank Accounts' },
    { id: 'recoveries', icon: RefreshCw, label: 'Recoveries' },
    { id: 'credits', icon: CreditCard, label: 'Credits' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-screen w-72 backdrop-blur-2xl bg-white/70 border-r border-white/40 shadow-2xl overflow-y-auto scrollbar-hide">
      {/* Logo Section */}
      <div className="p-8 border-b border-white/30 backdrop-blur-xl bg-gradient-to-br from-white/50 to-white/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
              <Fuel className="w-8 h-8 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                MOTORWAY OIL
              </h1>
              <p className="text-xs text-gray-600 font-semibold tracking-wider">Enterprise v2050</p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200/50 backdrop-blur-sm">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider text-center">
              Premium Lubricants
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
