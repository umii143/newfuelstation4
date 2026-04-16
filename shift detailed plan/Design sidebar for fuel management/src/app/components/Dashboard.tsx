import { motion } from 'motion/react';
import { 
  DollarSign, 
  Droplet, 
  CreditCard, 
  Package, 
  Clock, 
  TrendingUp,
  TrendingDown,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { QuickActions, ActivityFeed, PerformanceMetrics } from './DashboardWidgets';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react';

// Sample data for charts
const revenueData = [
  { name: '00:00', value: 120 },
  { name: '04:00', value: 85 },
  { name: '08:00', value: 280 },
  { name: '12:00', value: 420 },
  { name: '16:00', value: 380 },
  { name: '20:00', value: 350 },
  { name: '23:59', value: 180 },
];

const fuelSalesData = [
  { name: 'Mon', petrol: 4500, diesel: 3200 },
  { name: 'Tue', petrol: 5200, diesel: 3800 },
  { name: 'Wed', petrol: 4800, diesel: 4200 },
  { name: 'Thu', petrol: 6100, diesel: 4800 },
  { name: 'Fri', petrol: 7200, diesel: 5500 },
  { name: 'Sat', petrol: 8100, diesel: 6200 },
  { name: 'Sun', petrol: 7500, diesel: 5800 },
];

const fuelTypeData = [
  { name: 'Petrol 92', value: 45, color: '#3B82F6' },
  { name: 'Diesel', value: 35, color: '#10B981' },
  { name: 'Petrol 95', value: 15, color: '#F59E0B' },
  { name: 'HSD', value: 5, color: '#8B5CF6' },
];

export function Dashboard() {
  const [animatedRevenue, setAnimatedRevenue] = useState(0);
  const [animatedLiters, setAnimatedLiters] = useState(0);
  
  const stats = [
    {
      title: "TODAY'S REVENUE",
      value: "Rs 485,320",
      rawValue: 485320,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      gradient: "from-blue-500/20 to-blue-600/20",
      iconBg: "from-blue-500 to-blue-600",
      iconColor: "text-white",
      borderColor: "border-blue-300/50",
      bgGradient: "from-blue-50/80 to-blue-100/50",
    },
    {
      title: "LITERS SOLD",
      value: "42,580 L",
      rawValue: 42580,
      change: "+8.2%",
      trend: "up",
      icon: Droplet,
      gradient: "from-emerald-500/20 to-emerald-600/20",
      iconBg: "from-emerald-500 to-emerald-600",
      iconColor: "text-white",
      borderColor: "border-emerald-300/50",
      bgGradient: "from-emerald-50/80 to-emerald-100/50",
    },
    {
      title: "OUTSTANDING CREDIT",
      value: "Rs 210.8K",
      change: "-3.1%",
      trend: "down",
      icon: CreditCard,
      gradient: "from-amber-500/20 to-amber-600/20",
      iconBg: "from-amber-500 to-amber-600",
      iconColor: "text-white",
      borderColor: "border-amber-300/50",
      bgGradient: "from-amber-50/80 to-amber-100/50",
    },
    {
      title: "LOW STOCK ITEMS",
      value: "3",
      icon: Package,
      gradient: "from-rose-500/20 to-rose-600/20",
      iconBg: "from-rose-500 to-rose-600",
      iconColor: "text-white",
      borderColor: "border-rose-300/50",
      bgGradient: "from-rose-50/80 to-rose-100/50",
      alert: true,
    },
  ];

  useEffect(() => {
    // Animate numbers
    const revenueTarget = 485320;
    const litersTarget = 42580;
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setAnimatedRevenue(Math.floor(revenueTarget * easeProgress));
      setAnimatedLiters(Math.floor(litersTarget * easeProgress));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const fuelTanks = [
    {
      name: "Petrol Tank - Petrol 92",
      nozzles: "2 nozzles • Rs260/L",
      current: 18459,
      capacity: 27000,
      percentage: 68,
      color: "emerald",
      status: "good"
    },
    {
      name: "Diesel Tank - Diesel",
      nozzles: "2 nozzles • Rs295/L",
      current: 28750,
      capacity: 35000,
      percentage: 82,
      color: "emerald",
      status: "good"
    },
    {
      name: "Petrol 95 Tank",
      nozzles: "1 nozzle • Rs275/L",
      current: 4200,
      capacity: 20000,
      percentage: 21,
      color: "amber",
      status: "warning"
    },
  ];

  const recentShifts = [
    {
      name: "Ahmed Hassan",
      status: "ACTIVE",
      date: "2/11/2026",
      shift: "Shift #2",
      amount: "Rs 125,320",
      change: "+Rs 45,200",
      trend: "up",
      statusColor: "emerald"
    },
    {
      name: "Muhammad Umar",
      status: "CLOSED",
      date: "2/10/2026",
      shift: "Shift #1",
      amount: "Rs 98,500",
      change: "+Rs 12,400",
      trend: "up",
      statusColor: "gray"
    },
    {
      name: "Ali Khan",
      status: "CLOSED",
      date: "2/9/2026",
      shift: "Shift #2",
      amount: "Rs 142,800",
      change: "+Rs 28,600",
      trend: "up",
      statusColor: "gray"
    },
    {
      name: "Sara Ahmed",
      status: "CLOSED",
      date: "2/8/2026",
      shift: "Shift #1",
      amount: "Rs 108,400",
      change: "-Rs 5,200",
      trend: "down",
      statusColor: "gray"
    },
  ];

  const lowStockItems = [
    { name: "Castrol Edge 5W-30 Synthetic", category: "Castrol", quantity: 24, unit: "bottles", level: "low", color: "amber" },
    { name: "ZIC X5 5W-40 Synthetic", category: "ZIC", quantity: 16, unit: "bottles", level: "low", color: "amber" },
    { name: "Total Quartz Coolant", category: "Total", quantity: 5, unit: "bottles", level: "critical", color: "rose" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-cyan-50/20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-6 lg:p-8 max-w-[1800px] mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent mb-2">
                Dashboard Overview
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Welcome back! Here's your station overview for Wednesday, February 11, 2026
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Start New Shift</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <QuickActions />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl rounded-2xl p-6 border-2 ${stat.borderColor} shadow-lg hover:shadow-2xl transition-all duration-500 group`}
            >
              {/* Animated background gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: index * 0.5,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </motion.div>
                  {stat.change && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                        stat.trend === 'up'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>{stat.change}</span>
                    </motion.div>
                  )}
                  {stat.alert && (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="p-2 bg-rose-100 rounded-lg"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    {stat.title}
                  </p>
                  <motion.p
                    className="text-2xl lg:text-3xl font-bold text-gray-900"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
          {/* Revenue Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Today's Revenue</h2>
                  <p className="text-xs text-gray-500">Hourly breakdown</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Details</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Fuel Sales Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Droplet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Weekly Fuel Sales</h2>
                  <p className="text-xs text-gray-500">By fuel type</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Details</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fuelSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="petrol" fill="#3B82F6" radius={[8, 8, 0, 0]} animationDuration={1500} />
                <Bar dataKey="diesel" fill="#10B981" radius={[8, 8, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
          {/* Fuel Tanks - Spans 2 columns */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Droplet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Fuel Tank Levels</h2>
                  <p className="text-xs text-gray-500">Real-time monitoring</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Manage Tanks</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-6">
              {fuelTanks.map((tank, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-white/50 hover:border-blue-300/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900">{tank.name}</h3>
                        {tank.status === 'good' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{tank.nozzles}</p>
                    </div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1, type: 'spring' }}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                        tank.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tank.percentage}%
                    </motion.span>
                  </div>
                  <div className="space-y-2">
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tank.percentage}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: 'easeOut' }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                          tank.color === 'emerald'
                            ? 'from-emerald-500 to-emerald-600'
                            : 'from-amber-500 to-amber-600'
                        } rounded-full shadow-lg`}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 font-semibold">
                      <span>{tank.current.toLocaleString()} L</span>
                      <span>Capacity: {tank.capacity.toLocaleString()} L</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Fuel Distribution Pie Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Fuel Distribution</h2>
                <p className="text-xs text-gray-500">By type</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fuelTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {fuelTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {fuelTypeData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Activity and Performance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-8">
          {/* Activity Feed */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-xs text-gray-500">Live updates</p>
                </div>
              </div>
            </div>
            <ActivityFeed />
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Performance Metrics</h2>
                  <p className="text-xs text-gray-500">Key indicators</p>
                </div>
              </div>
            </div>
            <PerformanceMetrics />
          </motion.div>
        </div>

        {/* Recent Shifts and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Shifts */}
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/60 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Shifts</h2>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-3">
              {recentShifts.map((shift, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/40 hover:from-white/80 hover:to-white/60 border border-white/50 hover:border-blue-300/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${
                      shift.statusColor === 'emerald' ? 'from-emerald-100 to-emerald-200' : 'from-gray-100 to-gray-200'
                    }`}>
                      <Clock className={`w-4 h-4 ${
                        shift.statusColor === 'emerald' ? 'text-emerald-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{shift.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          shift.statusColor === 'emerald'
                            ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {shift.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {shift.date} • {shift.shift}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bold text-gray-900 text-sm mb-1">{shift.amount}</p>
                    <div className={`flex items-center space-x-1 text-xs font-bold ${
                      shift.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {shift.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{shift.change}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Low Stock Alert */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-rose-50/90 to-pink-50/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-rose-300/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start space-x-4 mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 border-2 border-rose-300 shadow-lg"
              >
                <Package className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-rose-900 mb-1">Low Stock Alert</h2>
                <p className="text-sm text-rose-700 font-medium">3 products need reordering</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Order Now
              </motion.button>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-rose-200/50 hover:border-rose-300/70 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-600 font-medium">{item.category}</p>
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.3,
                      }}
                    >
                      <AlertCircle className={`w-5 h-5 ${
                        item.color === 'rose' ? 'text-rose-600' : 'text-amber-600'
                      }`} />
                    </motion.div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-lg font-bold ${
                        item.color === 'rose' ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{item.unit} left</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.level === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.level.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
