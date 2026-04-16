import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, TrendingDown, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  viscosity?: string;
  price: number;
  costPrice: number;
  unit: string;
  stock: number;
  reorderLevel: number;
  supplier: string;
}

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Edge Professional 5W-30', brand: 'Castrol', category: 'Engine Oil', viscosity: '5W-30', price: 8500, costPrice: 6800, unit: '4L', stock: 145, reorderLevel: 50, supplier: 'Castrol Distributor' },
    { id: '2', name: 'ESP Formula 5W-30', brand: 'Mobil 1', category: 'Engine Oil', viscosity: '5W-30', price: 12750, costPrice: 10200, unit: '5L', stock: 98, reorderLevel: 40, supplier: 'Mobil Official' },
    { id: '3', name: 'Helix Ultra 5W-40', brand: 'Shell', category: 'Engine Oil', viscosity: '5W-40', price: 9200, costPrice: 7400, unit: '4L', stock: 167, reorderLevel: 60, supplier: 'Shell Pakistan' },
    { id: '4', name: 'ATF+4 Transmission Fluid', brand: 'Valvoline', category: 'Transmission Oil', price: 6800, costPrice: 5400, unit: '4L', stock: 25, reorderLevel: 30, supplier: 'Valvoline Int' },
    { id: '5', name: 'DOT 4 Brake Fluid', brand: 'Castrol', category: 'Brake Fluid', price: 1850, costPrice: 1480, unit: '1L', stock: 220, reorderLevel: 100, supplier: 'Castrol Distributor' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Engine Oil', viscosity: '', price: 0, costPrice: 0, unit: '4L', stock: 0, reorderLevel: 50, supplier: ''
  });

  const categories = ['ALL', 'Engine Oil', 'Transmission Oil', 'Brake Fluid', 'Coolant', 'Gear Oil', 'Hydraulic Oil', 'Grease', 'Specialty'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      setProducts([...products, { ...formData, id: Date.now().toString() }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', brand: '', category: 'Engine Oil', viscosity: '', price: 0, costPrice: 0, unit: '4L', stock: 0, reorderLevel: 50, supplier: '' });
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Total Products</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">{products.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Inventory Value</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">₨{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Low Stock Items</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Filter className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold">Categories</p>
              <p className="text-xl md:text-2xl font-black text-gray-900">8</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/90 border-2 border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-xl bg-red-50/80 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-red-200 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-black text-red-900 text-lg mb-2">Low Stock Alert!</h3>
              <p className="text-red-700 font-medium text-sm mb-3">{lowStockProducts.length} products are running low on stock</p>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 3).map(p => (
                  <span key={p.id} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                    {p.name} ({p.stock} left)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Table/Grid */}
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/60 shadow-xl">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Products</h2>
          <button className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 font-semibold text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-white/90 border-2 border-white/60 shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase">{product.brand}</p>
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  {product.viscosity && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-700 rounded">
                      {product.viscosity}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Price</p>
                  <p className="font-bold text-gray-900">₨{product.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Stock</p>
                  <p className={`font-bold ${product.stock <= product.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock} {product.unit}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Product</th>
                <th className="text-left py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Category</th>
                <th className="text-left py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Price</th>
                <th className="text-left py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Cost</th>
                <th className="text-left py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Stock</th>
                <th className="text-left py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Supplier</th>
                <th className="text-center py-4 px-4 font-black text-gray-900 text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 hover:bg-white/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase">{product.brand}</p>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      {product.viscosity && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-700 rounded">
                          {product.viscosity}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-500/10 text-blue-700 rounded-lg">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">₨{product.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{product.unit}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-700">₨{product.costPrice.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className={`font-bold ${product.stock <= product.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock}
                      </p>
                      {product.stock <= product.reorderLevel && (
                        <p className="text-xs text-red-600 font-semibold">Low Stock!</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700 font-medium">{product.supplier}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(product)} className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      {categories.filter(c => c !== 'ALL').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Viscosity (Optional)</label>
                    <input
                      type="text"
                      value={formData.viscosity}
                      onChange={(e) => setFormData({...formData, viscosity: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="e.g., 5W-30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sale Price (₨)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cost Price (₨)</label>
                    <input
                      type="number"
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="e.g., 4L, 1kg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Stock</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reorder Level</label>
                    <input
                      type="number"
                      required
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({...formData, reorderLevel: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Supplier</label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
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
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
