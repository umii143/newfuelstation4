import { motion } from 'motion/react';
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'New Sale',
      description: 'Record a fuel sale',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    {
      title: 'Add Customer',
      description: 'Register new customer',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
    },
    {
      title: 'Credit Payment',
      description: 'Record payment',
      icon: CreditCard,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
    },
    {
      title: 'Stock Update',
      description: 'Update inventory',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`group relative overflow-hidden bg-gradient-to-br ${action.color} ${action.hoverColor} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500`}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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

          <div className="relative z-10 flex items-start justify-between">
            <div className="text-left flex-1">
              <h3 className="text-lg font-bold mb-1">{action.title}</h3>
              <p className="text-sm text-white/80 font-medium">{action.description}</p>
            </div>
            <motion.div
              whileHover={{ rotate: -45, scale: 1.2 }}
              transition={{ duration: 0.3 }}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <action.icon className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Hover indicator */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
      ))}
    </div>
  );
}

export function ActivityFeed() {
  const activities = [
    {
      type: 'sale',
      message: 'New sale recorded - Rs 12,450',
      user: 'Ahmed Hassan',
      time: '2 min ago',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      type: 'alert',
      message: 'Tank level warning - Petrol 95',
      user: 'System',
      time: '15 min ago',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      type: 'payment',
      message: 'Credit payment received - Rs 50,000',
      user: 'Muhammad Umar',
      time: '1 hour ago',
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      type: 'shift',
      message: 'Shift #2 started',
      user: 'Ahmed Hassan',
      time: '2 hours ago',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ x: 4 }}
          className="flex items-start space-x-3 p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/50 hover:border-blue-300/50 transition-all duration-300 cursor-pointer"
        >
          <div className={`p-2.5 rounded-lg ${activity.bgColor} ${activity.color}`}>
            <activity.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-0.5">{activity.message}</p>
            <p className="text-xs text-gray-500 font-medium">
              {activity.user} • {activity.time}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PerformanceMetrics() {
  const metrics = [
    { label: 'Avg. Transaction', value: 'Rs 8,450', change: '+5.2%', trend: 'up' },
    { label: 'Customer Count', value: '142', change: '+12', trend: 'up' },
    { label: 'Peak Hour', value: '2-4 PM', change: '28% sales', trend: 'up' },
    { label: 'Efficiency', value: '94%', change: '+2%', trend: 'up' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.03 }}
          className="p-4 rounded-xl bg-gradient-to-br from-white/70 to-white/50 border border-white/50 hover:border-blue-300/50 transition-all duration-300"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {metric.label}
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold text-gray-900">{metric.value}</p>
            <span className="text-xs font-bold text-emerald-600">{metric.change}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
