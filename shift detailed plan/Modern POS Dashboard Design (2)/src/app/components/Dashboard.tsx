import { TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Droplet, Zap, Package, Fuel, Sparkles, Crown } from 'lucide-react';
import { motion } from 'motion/react';

export function Dashboard() {
  const stats = [
    {
      title: 'Today\'s Sales',
      value: '₨845,830',
      change: '+18.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Transactions',
      value: '342',
      change: '+12.8%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Active Customers',
      value: '167',
      change: '+9.4%',
      trend: 'up',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Credit Outstanding',
      value: '₨389,450',
      change: '-5.2%',
      trend: 'down',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    },
  ];

  const recentSales = [
    { id: 'INV-2050-001', customer: 'Ali Khan Motors', product: 'Castrol Edge 5W-30 4L', amount: 8500, time: '2 mins ago' },
    { id: 'INV-2050-002', customer: 'Sara Auto Care', product: 'Mobil 1 ESP 5W-30 5L', amount: 12750, time: '5 mins ago' },
    { id: 'INV-2050-003', customer: 'Raza Workshop', product: 'Shell Helix Ultra 5W-40', amount: 9200, time: '12 mins ago' },
    { id: 'INV-2050-004', customer: 'Shah Garage', product: 'Valvoline ATF+4', amount: 6800, time: '18 mins ago' },
    { id: 'INV-2050-005', customer: 'Ali Traders', product: 'Total Quartz 9000', amount: 10500, time: '25 mins ago' },
    { id: 'INV-2050-006', customer: 'Premium Auto', product: 'Castrol Transmission Oil', amount: 7200, time: '32 mins ago' },
  ];

  const productStats = [
    { category: 'Engine Oils', sales: 45, icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-200' },
    { category: 'Transmission Oils', sales: 28, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-200' },
    { category: 'Specialty Fluids', sales: 27, icon: Fuel, color: 'text-indigo-600', bg: 'bg-indigo-500/10', border: 'border-indigo-200' },
  ];

  const topProducts = [
    { name: 'Castrol Edge 5W-30', brand: 'Castrol', sales: 45, revenue: 382500 },
    { name: 'Mobil 1 ESP 5W-30', brand: 'Mobil', sales: 38, revenue: 484500 },
    { name: 'Shell Helix Ultra', brand: 'Shell', sales: 35, revenue: 322000 },
    { name: 'Total Quartz 9000', brand: 'Total', sales: 28, revenue: 294000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-2xl bg-white/70 rounded-3xl p-8 border-2 border-white/60 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-600 font-medium text-lg">Here's your business performance today</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="backdrop-blur-2xl bg-white/70 rounded-3xl p-7 border-2 border-white/60 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl ${
                    stat.trend === 'up' ? 'text-green-600 bg-green-500/10 border-2 border-green-200' : 'text-red-600 bg-red-500/10 border-2 border-red-200'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-bold uppercase tracking-wider mb-2">{stat.title}</h3>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Product Categories Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="backdrop-blur-2xl bg-white/70 rounded-3xl p-8 border-2 border-white/60 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Today's Product Performance</h2>
            <p className="text-gray-600 text-sm font-medium">Sales distribution by category</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productStats.map((product, index) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`${product.bg} ${product.border} border-2 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-5 mb-4">
                    <div className={`w-20 h-20 rounded-2xl ${product.bg} border-2 ${product.border} flex items-center justify-center shadow-lg`}>
                      <Icon className={`w-10 h-10 ${product.color}`} />
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm font-bold uppercase tracking-wider mb-2">{product.category}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-gray-900">{product.sales}%</p>
                    <p className="text-sm text-gray-600 font-semibold">of total sales</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="backdrop-blur-2xl bg-white/70 rounded-3xl p-8 border-2 border-white/60 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Recent Sales</h2>
                <p className="text-gray-600 text-sm font-medium">Latest transactions</p>
              </div>
            </div>
            <button className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20">
              View All
            </button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {recentSales.map((sale, index) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-white/90 to-white/70 border-2 border-white/60 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 mb-1">{sale.customer}</p>
                    <p className="text-sm text-gray-600 font-medium">{sale.product}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">{sale.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg">₨{sale.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">{sale.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="backdrop-blur-2xl bg-white/70 rounded-3xl p-8 border-2 border-white/60 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Top Products</h2>
                <p className="text-gray-600 text-sm font-medium">Best sellers today</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-white/90 to-white/70 border-2 border-white/60 hover:border-yellow-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                      'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{product.name}</p>
                      <p className="text-sm text-purple-600 font-bold">{product.brand}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-white/60">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Sales</p>
                    <p className="text-lg font-black text-gray-900">{product.sales} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase">Revenue</p>
                    <p className="text-lg font-black text-green-600">₨{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(168, 85, 247), rgb(99, 102, 241));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(147, 51, 234), rgb(79, 70, 229));
        }
      `}</style>
    </div>
  );
}
