import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  BookOpen, 
  Receipt, 
  Wallet, 
  FileText, 
  Settings,
  ChevronLeft,
  Search,
  Bell,
  User,
  LogOut,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'ledgers', label: 'Ledgers', icon: BookOpen },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'banks', label: 'Banks & Digital', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="gradient-bg min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar fixed left-0 top-0 h-screen z-30 hidden md:flex flex-col"
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-black/5">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">LubeOil ERP</h1>
                  <p className="text-xs text-gray-500">Premium Edition</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-black/5 smooth-transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft
              className={`w-5 h-5 text-gray-600 smooth-transition ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
            />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl smooth-transition relative overflow-hidden group ${
                    isActive
                      ? 'nav-active text-[#0066cc]'
                      : 'text-gray-700 hover:bg-black/5'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#0066cc]' : ''}`} />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-black/5">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center">
                  <span className="text-white font-semibold">OM</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">Owner</p>
                  <p className="text-xs text-gray-500 truncate">owner@lubeoil.com</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center">
                  <span className="text-white font-semibold">OM</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="glass-sidebar fixed left-0 top-0 h-screen z-50 w-72 md:hidden flex flex-col"
            >
              {/* Mobile Navigation Content (same as desktop) */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">LubeOil ERP</h1>
                    <p className="text-xs text-gray-500">Premium Edition</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl smooth-transition ${
                          isActive
                            ? 'nav-active text-[#0066cc]'
                            : 'text-gray-700 hover:bg-black/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#0066cc]' : ''}`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: isMobile ? '0' : (sidebarCollapsed ? '80px' : '280px') }}
      >
        {/* Topbar */}
        <header className="glass-topbar h-20 flex items-center justify-between px-6 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 smooth-transition"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:block flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, customers, invoices..."
                  className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Today Sales Counter */}
            <div className="hidden lg:flex items-center gap-2 glass-card px-4 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-xs text-gray-500">Today Sales</p>
                <p className="font-semibold text-[#0066cc]">₨ 45,280</p>
              </div>
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-xl hover:bg-black/5 smooth-transition"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 smooth-transition"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl shadow-xl p-2"
                  >
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-black/5 smooth-transition text-left">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-black/5 smooth-transition text-left">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </button>
                    <div className="h-px bg-black/5 my-2" />
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 smooth-transition text-left text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}