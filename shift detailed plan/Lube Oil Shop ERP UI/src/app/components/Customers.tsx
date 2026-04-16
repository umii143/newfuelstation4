import React from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Search, Mail, Phone, MapPin } from 'lucide-react';

const mockCustomers = [
  { id: 1, name: 'Ahmed Transport Co.', email: 'ahmed@transport.com', phone: '+92 300 1234567', balance: 15000, orders: 28 },
  { id: 2, name: 'City Auto Workshop', email: 'info@cityauto.com', phone: '+92 321 9876543', balance: 8500, orders: 24 },
  { id: 3, name: 'Express Logistics', email: 'express@logistics.pk', phone: '+92 333 5555555', balance: 0, orders: 22 },
  { id: 4, name: 'Metro Car Service', email: 'metro@carservice.com', phone: '+92 300 7777777', balance: 12000, orders: 18 },
  { id: 5, name: 'Royal Motors', email: 'royal@motors.pk', phone: '+92 321 8888888', balance: 0, orders: 15 },
];

export function Customers() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-medium shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 shadow-3d"
      >
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="glass-input w-full pl-11 pr-4 py-3 rounded-xl outline-none"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-5 shadow-3d group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#0066cc] smooth-transition">
                    {customer.name}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Total Orders</p>
                      <p className="font-semibold text-gray-900">{customer.orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className={`font-semibold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₨ {customer.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
