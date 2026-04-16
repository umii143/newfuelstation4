import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Banknote, 
  AlertCircle, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
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
  Cell
} from 'recharts';

// Animated Counter Component
function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
  index: number;
}

function KPICard({ title, value, prefix = '₨ ', suffix = '', icon: Icon, trend, color, index }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="glass-card rounded-2xl p-6 shadow-3d"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </h3>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  // Mock data for sales chart
  const salesData = [
    { name: 'Jan', sales: 42000, target: 45000 },
    { name: 'Feb', sales: 48000, target: 45000 },
    { name: 'Mar', sales: 51000, target: 50000 },
    { name: 'Apr', sales: 45000, target: 50000 },
    { name: 'May', sales: 58000, target: 55000 },
    { name: 'Jun', sales: 62000, target: 60000 },
    { name: 'Jul', sales: 67000, target: 65000 },
  ];

  // Mock data for expense breakdown
  const expenseData = [
    { name: 'Purchases', value: 45000, color: '#0066cc' },
    { name: 'Salaries', value: 25000, color: '#00a896' },
    { name: 'Rent', value: 15000, color: '#ff6b6b' },
    { name: 'Utilities', value: 8000, color: '#ffd93d' },
    { name: 'Other', value: 7000, color: '#a78bfa' },
  ];

  // Mock data for top products
  const topProducts = [
    { id: 1, name: 'Castrol GTX 20W-50', sold: 450, revenue: 135000, stock: 120 },
    { id: 2, name: 'Shell Helix HX7 10W-40', sold: 380, revenue: 128000, stock: 85 },
    { id: 3, name: 'Mobil Super 3000 5W-40', sold: 320, revenue: 112000, stock: 95 },
    { id: 4, name: 'Total Quartz 9000 5W-30', sold: 285, revenue: 98000, stock: 65 },
    { id: 5, name: 'Gulf Formula G 20W-50', sold: 240, revenue: 78000, stock: 150 },
  ];

  // Mock data for top customers
  const topCustomers = [
    { id: 1, name: 'Ahmed Transport Co.', purchases: 28, amount: 285000, outstanding: 0 },
    { id: 2, name: 'City Auto Workshop', purchases: 24, amount: 245000, outstanding: 15000 },
    { id: 3, name: 'Express Logistics', purchases: 22, amount: 198000, outstanding: 0 },
    { id: 4, name: 'Metro Car Service', purchases: 18, amount: 165000, outstanding: 8500 },
    { id: 5, name: 'Royal Motors', purchases: 15, amount: 142000, outstanding: 12000 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl">
          <p className="text-sm text-gray-600">Today</p>
          <p className="font-semibold text-gray-900">Friday, Feb 13, 2026</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Today Sales"
          value={45280}
          icon={TrendingUp}
          trend={12.5}
          color="#0066cc"
          index={0}
        />
        <KPICard
          title="Cash in Hand"
          value={128500}
          icon={Wallet}
          color="#00a896"
          index={1}
        />
        <KPICard
          title="Bank Balance"
          value={456780}
          icon={Banknote}
          color="#a78bfa"
          index={2}
        />
        <KPICard
          title="Receivables"
          value={185600}
          icon={AlertCircle}
          trend={-5.2}
          color="#ff6b6b"
          index={3}
        />
        <KPICard
          title="Stock Value"
          value={892340}
          icon={Package}
          color="#ffd93d"
          index={4}
        />
        <KPICard
          title="Monthly Profit"
          value={234500}
          icon={DollarSign}
          trend={18.3}
          color="#00a896"
          index={5}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Sales Overview</h3>
              <p className="text-sm text-gray-600">Monthly sales vs target</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#0066cc]" />
                <span className="text-xs text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#e5e7eb]" />
                <span className="text-xs text-gray-600">Target</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066cc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#0066cc"
                strokeWidth={3}
                fill="url(#salesGradient)"
              />
              <Line type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Expense Breakdown</h3>
            <p className="text-sm text-gray-600">This month's expenses</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {expenseData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{item.name}</p>
                  <p className="text-sm font-semibold text-gray-900">₨ {item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Products</h3>
              <p className="text-sm text-gray-600">Best selling this month</p>
            </div>
            <button className="text-sm text-[#0066cc] hover:text-[#0052a3] font-medium smooth-transition">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 smooth-transition"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center text-white font-semibold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">{product.sold} sold</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs ${product.stock < 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₨ {product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">revenue</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Customers</h3>
              <p className="text-sm text-gray-600">Highest spending customers</p>
            </div>
            <button className="text-sm text-[#0066cc] hover:text-[#0052a3] font-medium smooth-transition">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 smooth-transition"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#00a896] to-[#0066cc] flex items-center justify-center text-white font-semibold">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">{customer.purchases} orders</span>
                    {customer.outstanding > 0 && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-red-600">₨ {customer.outstanding.toLocaleString()} due</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₨ {customer.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">total</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
