import { useState } from 'react';
import { FileText, TrendingUp, Package, Users, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export function Reports() {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'customers' | 'profit'>('sales');
  const [dateRange, setDateRange] = useState('today');

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
    { id: 'inventory', name: 'Inventory Report', icon: Package, color: 'from-purple-500 to-indigo-500' },
    { id: 'customers', name: 'Customer Report', icon: Users, color: 'from-green-500 to-emerald-500' },
    { id: 'profit', name: 'Profit & Loss', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  const salesData = {
    totalSales: 845830,
    transactions: 342,
    avgTransaction: 2472,
    topProducts: [
      { name: 'Castrol Edge 5W-30', quantity: 45, revenue: 382500 },
      { name: 'Mobil 1 ESP', quantity: 38, revenue: 484500 },
      { name: 'Shell Helix Ultra', quantity: 35, revenue: 322000 },
    ],
    salesByCategory: [
      { category: 'Engine Oil', sales: 562000, percentage: 66 },
      { category: 'Transmission Oil', sales: 185000, percentage: 22 },
      { category: 'Others', sales: 98830, percentage: 12 },
    ]
  };

  const inventoryData = {
    totalProducts: 36,
    totalValue: 4250000,
    lowStock: 8,
    outOfStock: 2,
    topMoving: [
      { name: 'Castrol Edge 5W-30', movement: 145 },
      { name: 'Mobil 1 ESP', movement: 128 },
      { name: 'Shell Helix Ultra', movement: 112 },
    ]
  };

  const customerData = {
    totalCustomers: 167,
    newThisMonth: 23,
    goldTier: 45,
    totalCredit: 389450,
    topCustomers: [
      { name: 'Shah Garage', purchases: 210000 },
      { name: 'Ali Khan Motors', purchases: 145000 },
      { name: 'Raza Workshop', purchases: 125000 },
    ]
  };

  const profitData = {
    revenue: 845830,
    cost: 678664,
    grossProfit: 167166,
    expenses: 45000,
    netProfit: 122166,
    profitMargin: 14.4
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-white/60 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Business Reports
            </h1>
            <p className="text-gray-600 font-medium">Comprehensive business analytics and insights</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/90 border-2 border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-semibold"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {reportTypes.map(type => {
          const Icon = type.icon;
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReportType(type.id as any)}
              className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all ${
                reportType === type.id
                  ? 'bg-gradient-to-br ' + type.color + ' text-white border-transparent shadow-2xl'
                  : 'backdrop-blur-xl bg-white/70 border-white/60 shadow-xl hover:shadow-2xl'
              }`}
            >
              <Icon className={`w-8 h-8 md:w-10 md:h-10 mb-3 ${reportType === type.id ? 'text-white' : 'text-gray-700'}`} />
              <p className={`font-black text-sm md:text-base ${reportType === type.id ? 'text-white' : 'text-gray-900'}`}>
                {type.name}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Total Sales</p>
              <p className="text-3xl font-black text-gray-900">₨{salesData.totalSales.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-bold mt-2">↑ 18.5% from yesterday</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Transactions</p>
              <p className="text-3xl font-black text-gray-900">{salesData.transactions}</p>
              <p className="text-xs text-green-600 font-bold mt-2">↑ 12.8% from yesterday</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Avg Transaction</p>
              <p className="text-3xl font-black text-gray-900">₨{salesData.avgTransaction.toLocaleString()}</p>
              <p className="text-xs text-green-600 font-bold mt-2">↑ 5.2% from yesterday</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Payment Methods</p>
              <p className="text-sm font-bold text-gray-900">Cash: 65%</p>
              <p className="text-sm font-bold text-gray-900">Bank: 30%</p>
              <p className="text-sm font-bold text-gray-900">Mobile: 5%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 border-2 border-white/60 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                {salesData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-white/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <p className="font-black text-green-600">₨{product.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 border-2 border-white/60 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-4">Sales by Category</h3>
              <div className="space-y-4">
                {salesData.salesByCategory.map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{cat.category}</span>
                      <span className="font-black text-purple-600">₨{cat.sales.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 font-semibold mt-1">{cat.percentage}% of total sales</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Total Products</p>
              <p className="text-3xl font-black text-gray-900">{inventoryData.totalProducts}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Inventory Value</p>
              <p className="text-3xl font-black text-gray-900">₨{(inventoryData.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Low Stock</p>
              <p className="text-3xl font-black text-orange-600">{inventoryData.lowStock}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Out of Stock</p>
              <p className="text-3xl font-black text-red-600">{inventoryData.outOfStock}</p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 border-2 border-white/60 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-4">Fast Moving Products</h3>
            <div className="space-y-3">
              {inventoryData.topMoving.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black">
                      {index + 1}
                    </div>
                    <p className="font-bold text-gray-900">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">{product.movement} units</p>
                    <p className="text-xs text-gray-600">sold this period</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Customer Report */}
      {reportType === 'customers' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Total Customers</p>
              <p className="text-3xl font-black text-gray-900">{customerData.totalCustomers}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">New This Month</p>
              <p className="text-3xl font-black text-green-600">{customerData.newThisMonth}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Gold Tier</p>
              <p className="text-3xl font-black text-yellow-600">{customerData.goldTier}</p>
            </div>
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 border-2 border-white/60 shadow-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Total Credit</p>
              <p className="text-3xl font-black text-red-600">₨{(customerData.totalCredit / 1000).toFixed(0)}K</p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 border-2 border-white/60 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {customerData.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/80 border border-white/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <p className="font-bold text-gray-900">{customer.name}</p>
                  </div>
                  <p className="font-black text-purple-600">₨{customer.purchases.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Profit & Loss Report */}
      {reportType === 'profit' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 border-2 border-white/60 shadow-xl">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Profit & Loss Statement</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                <span className="font-bold text-gray-900">Revenue</span>
                <span className="text-2xl font-black text-blue-600">₨{profitData.revenue.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                <span className="font-bold text-gray-900">Cost of Goods Sold</span>
                <span className="text-2xl font-black text-gray-900">₨{profitData.cost.toLocaleString()}</span>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border-2 border-green-200">
                <span className="font-bold text-gray-900">Gross Profit</span>
                <span className="text-2xl font-black text-green-600">₨{profitData.grossProfit.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                <span className="font-bold text-gray-900">Operating Expenses</span>
                <span className="text-2xl font-black text-gray-900">₨{profitData.expenses.toLocaleString()}</span>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-purple-400">
                <span className="font-black text-white text-lg">Net Profit</span>
                <span className="text-3xl font-black text-white">₨{profitData.netProfit.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50 border-2 border-yellow-200">
                <span className="font-bold text-gray-900">Profit Margin</span>
                <span className="text-2xl font-black text-yellow-600">{profitData.profitMargin}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
