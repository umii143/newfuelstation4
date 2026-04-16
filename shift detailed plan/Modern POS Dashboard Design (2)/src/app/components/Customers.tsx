import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, CreditCard, FileText, TrendingUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  credit: number;
  creditLimit: number;
  totalPurchases: number;
  tier: 'Gold' | 'Silver' | 'Bronze';
  registeredDate: string;
}

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'Ali Khan Motors', phone: '0300-1234567', email: 'ali@khan.com', address: 'Shop 12, Main Bazar', credit: 5000, creditLimit: 50000, totalPurchases: 145000, tier: 'Gold', registeredDate: '2024-01-15' },
    { id: '2', name: 'Sara Auto Care', phone: '0321-7654321', email: 'sara@autocare.com', address: 'Plaza 5, DHA', credit: 0, creditLimit: 30000, totalPurchases: 89000, tier: 'Silver', registeredDate: '2024-02-20' },
    { id: '3', name: 'Raza Workshop', phone: '0333-9876543', email: 'raza@workshop.com', address: 'Street 8, Gulberg', credit: 2500, creditLimit: 40000, totalPurchases: 125000, tier: 'Gold', registeredDate: '2023-11-10' },
    { id: '4', name: 'Shah Garage', phone: '0345-5556666', email: 'shah@garage.com', address: 'Main Road, Cantt', credit: 10000, creditLimit: 60000, totalPurchases: 210000, tier: 'Gold', registeredDate: '2023-09-05' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', creditLimit: 50000
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'Silver': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'Bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? 
        { ...c, ...formData } : c
      ));
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...formData,
        credit: 0,
        totalPurchases: 0,
        tier: 'Bronze',
        registeredDate: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, newCustomer]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', address: '', creditLimit: 50000 });
    setShowAddModal(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      creditLimit: customer.creditLimit
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const viewLedger = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowLedgerModal(true);
  };

  // Mock ledger data
  const getLedgerEntries = (customerId: string): LedgerEntry[] => {
    return [
      { id: '1', date: '2025-02-10', description: 'Invoice #2050-045 - Castrol Edge 5W-30', debit: 8500, credit: 0, balance: 8500 },
      { id: '2', date: '2025-02-09', description: 'Payment Received - Cash', debit: 0, credit: 5000, balance: 3500 },
      { id: '3', date: '2025-02-08', description: 'Invoice #2050-032 - Shell Helix Ultra', debit: 9200, credit: 0, balance: 8500 },
      { id: '4', date: '2025-02-05', description: 'Payment Received - Bank Transfer', debit: 0, credit: 10000, balance: -700 },
      { id: '5', date: '2025-02-03', description: 'Invoice #2050-018 - Mobil 1 ESP', debit: 12750, credit: 0, balance: 9300 },
    ];
  };

  const totalCredits = customers.reduce((sum, c) => sum + c.credit, 0);
  const totalPurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Total Customers</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">{customers.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Total Credits</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">₨{totalCredits.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Total Sales</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">₨{totalPurchases.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Gold Members</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">{customers.filter(c => c.tier === 'Gold').length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 border-2 border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map(customer => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-white/60 shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">{customer.name}</h3>
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${getTierBadgeColor(customer.tier)}`}>
                    {customer.tier} Member
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(customer)} className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(customer.id)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-medium">{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 font-medium">{customer.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-white/60">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total Purchases</p>
                <p className="text-lg font-black text-gray-900">₨{customer.totalPurchases.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Credit Balance</p>
                <p className={`text-lg font-black ${customer.credit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₨{customer.credit.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => viewLedger(customer)}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              View Ledger
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address (Optional)</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Credit Limit (₨)</label>
                  <input
                    type="number"
                    required
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({...formData, creditLimit: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ledger Modal */}
      <AnimatePresence>
        {showLedgerModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLedgerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Customer Ledger</h3>
                  <p className="text-gray-600 font-semibold">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                </div>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Ledger Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <p className="text-sm text-blue-700 font-semibold mb-1">Total Purchases</p>
                  <p className="text-2xl font-black text-blue-900">₨{selectedCustomer.totalPurchases.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-700 font-semibold mb-1">Outstanding</p>
                  <p className="text-2xl font-black text-red-900">₨{selectedCustomer.credit.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
                  <p className="text-sm text-green-700 font-semibold mb-1">Credit Limit</p>
                  <p className="text-2xl font-black text-green-900">₨{selectedCustomer.creditLimit.toLocaleString()}</p>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-black text-gray-900 text-sm">Description</th>
                      <th className="text-right py-3 px-4 font-black text-gray-900 text-sm">Debit</th>
                      <th className="text-right py-3 px-4 font-black text-gray-900 text-sm">Credit</th>
                      <th className="text-right py-3 px-4 font-black text-gray-900 text-sm">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLedgerEntries(selectedCustomer.id).map(entry => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-semibold text-gray-700">{entry.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{entry.description}</td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-red-600">
                          {entry.debit > 0 ? `₨${entry.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                          {entry.credit > 0 ? `₨${entry.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-gray-900">
                          ₨{entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
