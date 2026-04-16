import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Clock,
  Activity,
  Fuel,
  TrendingUp,
  ShoppingCart,
  Users,
  Building2,
  Receipt,
  Tag,
  Landmark,
  UsersRound,
  FileText,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type BusinessType = 'fuel' | 'cng' | 'lube';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { id: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'shift-management',
    label: 'Shift Management',
    icon: Clock,
    badge: 2,
    subItems: [
      { id: 'shifts', label: 'Shifts' },
      { id: 'activity-log', label: 'Activity Log' },
    ],
  },
  { id: 'tanks', label: 'Tanks', icon: Fuel },
  { id: 'rate-impact', label: 'Rate Impact', icon: TrendingUp },
  { id: 'fuel-orders', label: 'Fuel Orders', icon: ShoppingCart, badge: 5 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Building2 },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'discounts', label: 'Discounts', icon: Tag },
  { id: 'cash-banks', label: 'Cash & Banks', icon: Landmark },
  { id: 'staff-payroll', label: 'Staff & Payroll', icon: UsersRound },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface EnterpriseNavigationProps {
  onMenuChange?: (menuId: string) => void;
  isCollapsed?: boolean;
}

export function EnterpriseNavigation({ onMenuChange, isCollapsed = false }: EnterpriseNavigationProps) {
  const [businessType, setBusinessType] = useState<BusinessType>('fuel');
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['shift-management']));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleMenuClick = (itemId: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      toggleExpanded(itemId);
    } else {
      setActiveMenuItem(itemId);
      onMenuChange?.(itemId);
    }
  };

  const businessTypes = [
    { id: 'fuel' as BusinessType, label: 'Fuel Station', color: 'from-blue-500 to-cyan-500', shadowColor: 'rgba(59, 130, 246, 0.4)' },
    { id: 'cng' as BusinessType, label: 'CNG', color: 'from-emerald-500 to-teal-500', shadowColor: 'rgba(16, 185, 129, 0.4)' },
    { id: 'lube' as BusinessType, label: 'Lube', color: 'from-amber-500 to-orange-500', shadowColor: 'rgba(245, 158, 11, 0.4)' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={isLoaded ? 'visible' : 'hidden'}
      variants={containerVariants}
      className="h-screen w-80 flex flex-col relative overflow-hidden"
    >
      {/* Animated Background with Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50/50"></div>
        <motion.div
          className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 -right-20 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Glassmorphism Layer */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/40"></div>

      {/* Enhanced Border with Shimmer Effect */}
      <div className="absolute inset-0 border-r-2 border-transparent overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200/60 via-cyan-200/40 to-purple-200/60"></div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-transparent"
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="p-6 border-b-2 border-white/60 backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/50 to-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]"
        >
          <div className="relative">
            {/* Decorative Corner Accents */}
            <motion.div
              className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative flex items-center space-x-3 mb-1">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur opacity-60"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 shadow-[0_8px_24px_rgba(59,130,246,0.4)] flex items-center justify-center border-2 border-white/50">
                  <Fuel className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              </motion.div>
              <div>
                <motion.h1
                  className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent drop-shadow-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  MOTORWAY OIL
                </motion.h1>
                <motion.div
                  className="flex items-center space-x-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-gray-500 font-semibold">Enterprise v2050</p>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-cyan-500" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Business Type Switcher */}
        <motion.div variants={itemVariants} className="p-4">
          <div className="relative">
            {/* Animated Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-emerald-400/20 to-amber-400/20 rounded-2xl blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative bg-gradient-to-br from-white/80 via-white/70 to-white/50 backdrop-blur-2xl rounded-2xl p-2 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border-2 border-white/60">
              <div className="flex gap-1.5">
                {businessTypes.map((type, index) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setBusinessType(type.id)}
                    className={`relative flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all duration-500 overflow-hidden group ${
                      businessType === type.id ? 'text-white' : 'text-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <AnimatePresence mode="wait">
                      {businessType === type.id && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`absolute inset-0 bg-gradient-to-br ${type.color}`}
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                          <motion.div
                            className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-50 blur-xl`}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        </>
                      )}
                    </AnimatePresence>
                    {businessType !== type.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/50 group-hover:bg-white/80 transition-all duration-300"
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                      />
                    )}
                    <span className="relative z-10 drop-shadow-sm">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <motion.nav variants={containerVariants} className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedItems.has(item.id);
              const isActive = activeMenuItem === item.id;
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.03 }}
                >
                  <motion.button
                    onClick={() => handleMenuClick(item.id, hasSubItems)}
                    className={`relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-500 group overflow-hidden ${
                      isActive ? 'shadow-[0_8px_24px_rgba(59,130,246,0.25)]' : 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                    }`}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Background Layers */}
                    <AnimatePresence mode="wait">
                      {isActive ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20"></div>
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-xl"></div>
                          <motion.div
                            className="absolute inset-0 border-2 border-blue-300/60 rounded-xl"
                            animate={{
                              boxShadow: [
                                '0 0 0 0 rgba(59, 130, 246, 0.4)',
                                '0 0 0 4px rgba(59, 130, 246, 0)',
                              ],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeOut',
                            }}
                          />
                          <motion.div
                            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full"
                            initial={{ height: 0 }}
                            animate={{ height: '100%' }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0"
                        >
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-md group-hover:bg-white/70 transition-all duration-300"></div>
                          <div className="absolute inset-0 border border-white/50 group-hover:border-white/80 rounded-xl transition-all duration-300"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative flex items-center space-x-3 z-10">
                      <motion.div
                        className={`relative p-2.5 rounded-xl transition-all duration-500 ${
                          isActive
                            ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)]'
                            : 'bg-gradient-to-br from-white/80 to-white/60 text-gray-600 group-hover:from-blue-50 group-hover:to-cyan-50 group-hover:text-blue-600 border border-white/60'
                        }`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur opacity-50"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}
                        <Icon className="relative w-4 h-4" />
                      </motion.div>
                      <span
                        className={`text-sm font-semibold transition-colors duration-300 ${
                          isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg"
                        >
                          {item.badge}
                        </motion.div>
                      )}
                    </div>

                    {hasSubItems && (
                      <motion.div
                        className="relative z-10"
                        animate={{ rotate: isExpanded ? 0 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-100/50' : 'bg-gray-100/50'}`}>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Sub Items */}
                  <AnimatePresence>
                    {hasSubItems && isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 ml-14 mr-2 space-y-1.5">
                          {item.subItems!.map((subItem, subIndex) => (
                            <motion.button
                              key={subItem.id}
                              onClick={() => {
                                setActiveMenuItem(subItem.id);
                                onMenuChange?.(subItem.id);
                              }}
                              className={`relative w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-300 overflow-hidden group ${
                                activeMenuItem === subItem.id ? 'shadow-md' : 'hover:shadow-sm'
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: subIndex * 0.05 }}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {activeMenuItem === subItem.id ? (
                                <>
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50"></div>
                                  <motion.div
                                    className="absolute inset-0 border-l-3 border-blue-500"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 0.3 }}
                                  />
                                  <div className="absolute inset-0 border border-blue-200/60 rounded-lg"></div>
                                </>
                              ) : (
                                <>
                                  <div className="absolute inset-0 bg-white/30 group-hover:bg-white/60 backdrop-blur-sm transition-all duration-300"></div>
                                  <div className="absolute inset-0 border border-transparent group-hover:border-gray-200/50 rounded-lg transition-all duration-300"></div>
                                  <div className="absolute inset-y-0 left-0 w-0.5 bg-gray-300/50 group-hover:bg-blue-400/50 transition-all duration-300"></div>
                                </>
                              )}
                              <span
                                className={`relative z-10 font-medium ${
                                  activeMenuItem === subItem.id ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-900'
                                }`}
                              >
                                {subItem.label}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.nav>
        </div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="p-4 border-t-2 border-white/60 backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/50 to-white/30"
        >
          <motion.div
            className="relative overflow-hidden rounded-xl group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-cyan-400/20 to-blue-400/0"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <div className="relative flex items-center space-x-3 px-4 py-3.5 bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-xl border-2 border-white/60 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <motion.div
                className="relative"
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-md opacity-60"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/50">
                  MO
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate font-medium">admin@motorwayoil.com</p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
