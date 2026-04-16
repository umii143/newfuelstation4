import { Search, Bell, Moon, Sun, Maximize2, User, LogOut, Settings as SettingsIcon, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function TopNavigation() {
  const [searchFocus, setSearchFocus] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="h-20 bg-white/60 backdrop-blur-2xl border-b-2 border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sticky top-0 z-50"
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search Bar */}
        <motion.div
          className="flex-1 max-w-2xl"
          animate={{ scale: searchFocus ? 1.02 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <motion.div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                searchFocus
                  ? 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-xl'
                  : 'bg-transparent'
              }`}
            />
            <div className="relative flex items-center">
              <Search className={`absolute left-4 w-5 h-5 transition-colors duration-300 ${
                searchFocus ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search transactions, customers, reports..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-300/60 transition-all duration-300 shadow-md hover:shadow-lg"
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />
            </div>
          </div>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 ml-8">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="p-3 rounded-xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-blue-600"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Fullscreen */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-blue-600"
          >
            <Maximize2 className="w-5 h-5" />
          </motion.button>

          {/* Help */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-blue-600"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-xl bg-white/70 backdrop-blur-xl border-2 border-white/60 shadow-md hover:shadow-lg transition-all duration-300 text-gray-700 hover:text-blue-600"
          >
            <Bell className="w-5 h-5" />
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              3
            </motion.div>
          </motion.button>

          {/* User Menu */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 pl-4 pr-5 py-2.5 rounded-xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl border-2 border-white/60 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur opacity-50"
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
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white/50 shadow-lg">
                MO
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500 font-medium">Super Admin</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
