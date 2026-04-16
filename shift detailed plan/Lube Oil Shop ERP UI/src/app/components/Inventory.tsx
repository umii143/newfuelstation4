import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  BarChart3,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  barcode: string;
  supplier: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Castrol GTX 20W-50',
    category: 'Engine Oil',
    price: 3200,
    cost: 2800,
    stock: 120,
    minStock: 50,
    barcode: 'BO001',
    supplier: 'Castrol Distributor'
  },
  {
    id: '2',
    name: 'Shell Helix HX7 10W-40',
    category: 'Engine Oil',
    price: 3500,
    cost: 3100,
    stock: 35,
    minStock: 50,
    barcode: 'BO002',
    supplier: 'Shell Pakistan'
  },
  {
    id: '3',
    name: 'Mobil Super 3000 5W-40',
    category: 'Engine Oil',
    price: 3800,
    cost: 3300,
    stock: 95,
    minStock: 40,
    barcode: 'BO003',
    supplier: 'Mobil Distributor'
  },
  {
    id: '4',
    name: 'ATF Transmission Fluid',
    category: 'Transmission Oil',
    price: 1500,
    cost: 1200,
    stock: 80,
    minStock: 30,
    barcode: 'BO004',
    supplier: 'General Supplier'
  },
  {
    id: '5',
    name: 'DOT 4 Brake Fluid',
    category: 'Brake Fluid',
    price: 800,
    cost: 600,
    stock: 15,
    minStock: 40,
    barcode: 'BO005',
    supplier: 'Brake Parts Co'
  },
];

export function Inventory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = mockProducts.filter((p) => p.stock <= p.minStock).length;
  const totalValue = mockProducts.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const categories = ['All', ...Array.from(new Set(mockProducts.map((p) => p.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-glow px-4 py-2.5 rounded-xl glass-card text-gray-700 font-medium smooth-transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-medium shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#0066cc]" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <h3 className="text-2xl font-bold text-gray-900">{mockProducts.length}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
          <h3 className="text-2xl font-bold text-red-600">{lowStockCount}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Stock Value</p>
          <h3 className="text-2xl font-bold text-gray-900">₨ {totalValue.toLocaleString()}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 shadow-3d"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Categories</p>
          <h3 className="text-2xl font-bold text-gray-900">{categories.length - 1}</h3>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 shadow-3d"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-11 pr-4 py-3 rounded-xl outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2.5 rounded-xl whitespace-nowrap font-medium smooth-transition ${
                  selectedCategory === category
                    ? 'bg-[#0066cc] text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-6 shadow-3d overflow-hidden"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Barcode</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Cost</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-black/5 smooth-transition"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.supplier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{product.category}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm font-mono">
                      {product.barcode}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-700">
                    ₨ {product.cost.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">
                    ₨ {product.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`px-3 py-1 rounded-lg font-medium ${
                        product.stock <= product.minStock
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {product.stock <= product.minStock ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-medium">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-blue-50 text-[#0066cc] smooth-transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-red-600 smooth-transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="glass-input w-full px-4 py-2.5 rounded-xl outline-none">
                      <option>Engine Oil</option>
                      <option>Transmission Oil</option>
                      <option>Brake Fluid</option>
                      <option>Coolant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                    <input
                      type="text"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="BO001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                    <input
                      type="text"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                    <input
                      type="number"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price
                    </label>
                    <input
                      type="number"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Stock
                    </label>
                    <input
                      type="number"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Stock Level
                    </label>
                    <input
                      type="number"
                      className="glass-input w-full px-4 py-2.5 rounded-xl outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold smooth-transition"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 btn-glow px-6 py-3 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-semibold shadow-lg">
                    Add Product
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
