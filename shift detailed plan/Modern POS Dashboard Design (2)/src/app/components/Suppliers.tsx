import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, TruckIcon, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  productsSupplied: string[];
  totalPurchases: number;
  outstanding: number;
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Castrol Distributor Pakistan',
      contactPerson: 'Ahmed Ali',
      phone: '042-35678901',
      email: 'ahmed@castrol.pk',
      address: 'Industrial Area, Lahore',
      productsSupplied: ['Castrol Edge', 'Castrol Magnatec', 'Castrol GTX'],
      totalPurchases: 2850000,
      outstanding: 145000
    },
    {
      id: '2',
      name: 'Mobil Official Imports',
      contactPerson: 'Sara Khan',
      phone: '021-34567890',
      email: 'sara@mobil.com.pk',
      address: 'Port Qasim, Karachi',
      productsSupplied: ['Mobil 1', 'Mobil Super', 'Mobil Delvac'],
      totalPurchases: 3250000,
      outstanding: 0
    },
    {
      id: '3',
      name: 'Shell Pakistan Limited',
      contactPerson: 'Hassan Raza',
      phone: '051-8765432',
      email: 'hassan@shell.pk',
      address: 'I-9 Industrial, Islamabad',
      productsSupplied: ['Shell Helix', 'Shell Rimula', 'Shell Spirax'],
      totalPurchases: 1950000,
      outstanding: 85000
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    productsSupplied: '',
  });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ?
        {
          ...s,
          ...formData,
          productsSupplied: formData.productsSupplied.split(',').map(p => p.trim())
        } : s
      ));
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...formData,
        productsSupplied: formData.productsSupplied.split(',').map(p => p.trim()),
        totalPurchases: 0,
        outstanding: 0
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', productsSupplied: '' });
    setShowAddModal(false);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address,
      productsSupplied: supplier.productsSupplied.join(', ')
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);
  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstanding, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <TruckIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Total Suppliers</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">{suppliers.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Total Purchases</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">₨{(totalPurchases / 1000000).toFixed(2)}M</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Outstanding</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">₨{totalOutstanding.toLocaleString()}</p>
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
              placeholder="Search suppliers..."
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
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSuppliers.map(supplier => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-5 md:p-6 border-2 border-white/60 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <TruckIcon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 text-lg mb-2">{supplier.name}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{supplier.phone}</span>
                    </div>
                    
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 font-medium">{supplier.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{supplier.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 font-medium">{supplier.contactPerson}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {supplier.productsSupplied.map((product, idx) => (
                      <span key={idx} className="px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-700 rounded-lg border border-blue-200">
                        {product}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/60">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total Purchases</p>
                      <p className="text-lg font-black text-gray-900">₨{supplier.totalPurchases.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Outstanding</p>
                      <p className={`text-lg font-black ${supplier.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₨{supplier.outstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 lg:w-full px-4 py-3 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="flex-1 lg:w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
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
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Products Supplied (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={formData.productsSupplied}
                    onChange={(e) => setFormData({...formData, productsSupplied: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="e.g., Castrol Edge, Mobil 1, Shell Helix"
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
                    {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
