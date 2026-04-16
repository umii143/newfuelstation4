import { useState } from 'react';
import { Search, Minus, Plus, X, User, Percent, CreditCard, Banknote, Smartphone, ShoppingCart, Droplet, Tag, Package, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Engine Oil' | 'Transmission Oil' | 'Brake Fluid' | 'Coolant' | 'Gear Oil' | 'Hydraulic Oil' | 'Grease' | 'Specialty';
  viscosity?: string;
  price: number;
  unit: string;
  stock: number;
  featured?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  credit: number;
  totalPurchases: number;
  tier: 'Gold' | 'Silver' | 'Bronze';
}

export function POSSales() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'Engine Oil' | 'Transmission Oil' | 'Brake Fluid' | 'Coolant' | 'Gear Oil' | 'Hydraulic Oil' | 'Grease' | 'Specialty'>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const products: Product[] = [
    // Engine Oils - Premium Brands
    { id: '1', name: 'Edge Professional 5W-30', brand: 'Castrol', category: 'Engine Oil', viscosity: '5W-30', price: 8500, unit: '4L', stock: 145, featured: true },
    { id: '2', name: 'ESP Formula 5W-30', brand: 'Mobil 1', category: 'Engine Oil', viscosity: '5W-30', price: 12750, unit: '5L', stock: 98, featured: true },
    { id: '3', name: 'Helix Ultra 5W-40', brand: 'Shell', category: 'Engine Oil', viscosity: '5W-40', price: 9200, unit: '4L', stock: 167, featured: true },
    { id: '4', name: 'Quartz 9000 5W-40', brand: 'Total', category: 'Engine Oil', viscosity: '5W-40', price: 10500, unit: '5L', stock: 120 },
    { id: '5', name: 'SynPower 5W-30', brand: 'Valvoline', category: 'Engine Oil', viscosity: '5W-30', price: 7800, unit: '4L', stock: 185 },
    { id: '6', name: 'Formula 1 10W-40', brand: 'Castrol', category: 'Engine Oil', viscosity: '10W-40', price: 6500, unit: '4L', stock: 210 },
    { id: '7', name: 'Super 3000 X1 5W-40', brand: 'Mobil', category: 'Engine Oil', viscosity: '5W-40', price: 5200, unit: '4L', stock: 156 },
    { id: '8', name: 'Helix HX8 5W-30', brand: 'Shell', category: 'Engine Oil', viscosity: '5W-30', price: 7400, unit: '4L', stock: 178 },
    { id: '9', name: 'Magnatec 10W-40', brand: 'Castrol', category: 'Engine Oil', viscosity: '10W-40', price: 5800, unit: '4L', stock: 195 },
    { id: '10', name: 'Turbo Diesel 15W-40', brand: 'Total', category: 'Engine Oil', viscosity: '15W-40', price: 8900, unit: '5L', stock: 142 },
    
    // Transmission Oils
    { id: '11', name: 'ATF+4 Transmission Fluid', brand: 'Valvoline', category: 'Transmission Oil', price: 6800, unit: '4L', stock: 85 },
    { id: '12', name: 'Multi-Vehicle ATF', brand: 'Castrol', category: 'Transmission Oil', price: 7200, unit: '4L', stock: 92 },
    { id: '13', name: 'ATF Dexron VI', brand: 'Mobil', category: 'Transmission Oil', price: 8500, unit: '4L', stock: 78 },
    { id: '14', name: 'CVT Fluid NS-2', brand: 'Shell', category: 'Transmission Oil', price: 9200, unit: '4L', stock: 65 },
    { id: '15', name: 'Manual Transmission 75W-90', brand: 'Total', category: 'Transmission Oil', price: 5600, unit: '4L', stock: 110 },
    
    // Brake Fluids
    { id: '16', name: 'DOT 4 Brake Fluid', brand: 'Castrol', category: 'Brake Fluid', price: 1850, unit: '1L', stock: 220 },
    { id: '17', name: 'DOT 4 ESP Brake Fluid', brand: 'Mobil', category: 'Brake Fluid', price: 2100, unit: '1L', stock: 185 },
    { id: '18', name: 'DOT 5.1 Racing Brake Fluid', brand: 'Shell', category: 'Brake Fluid', price: 2850, unit: '1L', stock: 95 },
    { id: '19', name: 'DOT 3 Brake Fluid', brand: 'Valvoline', category: 'Brake Fluid', price: 1450, unit: '1L', stock: 240 },
    
    // Coolants
    { id: '20', name: 'Extended Life Coolant', brand: 'Castrol', category: 'Coolant', price: 2200, unit: '5L', stock: 165 },
    { id: '21', name: 'Premium Antifreeze 50/50', brand: 'Shell', category: 'Coolant', price: 2650, unit: '5L', stock: 142 },
    { id: '22', name: 'Universal Coolant', brand: 'Total', category: 'Coolant', price: 1850, unit: '5L', stock: 188 },
    { id: '23', name: 'OAT Coolant Concentrate', brand: 'Valvoline', category: 'Coolant', price: 3200, unit: '5L', stock: 98 },
    
    // Gear Oils
    { id: '24', name: 'Axle Oil 75W-90', brand: 'Castrol', category: 'Gear Oil', price: 4500, unit: '4L', stock: 125 },
    { id: '25', name: 'Differential Oil 80W-90', brand: 'Mobil', category: 'Gear Oil', price: 5200, unit: '4L', stock: 102 },
    { id: '26', name: 'Gear Oil GL-5 85W-140', brand: 'Shell', category: 'Gear Oil', price: 4800, unit: '4L', stock: 115 },
    { id: '27', name: 'Synthetic Gear 75W-90', brand: 'Total', category: 'Gear Oil', price: 6200, unit: '4L', stock: 87 },
    
    // Hydraulic Oils
    { id: '28', name: 'AW Hydraulic 32', brand: 'Shell', category: 'Hydraulic Oil', price: 7500, unit: '20L', stock: 65 },
    { id: '29', name: 'AW Hydraulic 46', brand: 'Mobil', category: 'Hydraulic Oil', price: 7800, unit: '20L', stock: 58 },
    { id: '30', name: 'AW Hydraulic 68', brand: 'Total', category: 'Hydraulic Oil', price: 8200, unit: '20L', stock: 52 },
    
    // Greases
    { id: '31', name: 'Multi-Purpose Grease EP2', brand: 'Castrol', category: 'Grease', price: 2800, unit: '5kg', stock: 145 },
    { id: '32', name: 'Lithium Complex Grease', brand: 'Shell', category: 'Grease', price: 3200, unit: '5kg', stock: 132 },
    { id: '33', name: 'High-Temp Bearing Grease', brand: 'Mobil', category: 'Grease', price: 4500, unit: '5kg', stock: 95 },
    
    // Specialty
    { id: '34', name: 'Power Steering Fluid', brand: 'Valvoline', category: 'Specialty', price: 1650, unit: '1L', stock: 175 },
    { id: '35', name: 'Two-Stroke Engine Oil', brand: 'Castrol', category: 'Specialty', price: 2400, unit: '4L', stock: 105 },
    { id: '36', name: 'Diesel Exhaust Fluid (AdBlue)', brand: 'Shell', category: 'Specialty', price: 1200, unit: '10L', stock: 220 },
  ];

  const customers: Customer[] = [
    { id: '1', name: 'Ali Khan Motors', phone: '0300-1234567', email: 'ali@khan.com', credit: 5000, totalPurchases: 145000, tier: 'Gold' },
    { id: '2', name: 'Sara Ahmed Auto Care', phone: '0321-7654321', email: 'sara@autocare.com', credit: 0, totalPurchases: 89000, tier: 'Silver' },
    { id: '3', name: 'Ahmed Raza Workshop', phone: '0333-9876543', email: 'raza@workshop.com', credit: 2500, totalPurchases: 125000, tier: 'Gold' },
    { id: '4', name: 'Fatima Shah Garage', phone: '0345-5556666', email: 'fatima@garage.com', credit: 10000, totalPurchases: 210000, tier: 'Gold' },
    { id: '5', name: 'Hassan Ali Traders', phone: '0312-8887777', credit: 0, totalPurchases: 45000, tier: 'Bronze' },
    { id: '6', name: 'Zainab Imports', phone: '0322-4445555', email: 'zainab@imports.com', credit: 15000, totalPurchases: 325000, tier: 'Gold' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'ALL' || product.category === activeCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.viscosity && product.viscosity.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Engine Oil': return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'Transmission Oil': return 'bg-purple-500/10 text-purple-700 border-purple-300';
      case 'Brake Fluid': return 'bg-red-500/10 text-red-700 border-red-300';
      case 'Coolant': return 'bg-cyan-500/10 text-cyan-700 border-cyan-300';
      case 'Gear Oil': return 'bg-indigo-500/10 text-indigo-700 border-indigo-300';
      case 'Hydraulic Oil': return 'bg-orange-500/10 text-orange-700 border-orange-300';
      case 'Grease': return 'bg-green-500/10 text-green-700 border-green-300';
      case 'Specialty': return 'bg-pink-500/10 text-pink-700 border-pink-300';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'Silver': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'Bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const categories = ['ALL', 'Engine Oil', 'Transmission Oil', 'Brake Fluid', 'Coolant', 'Gear Oil', 'Hydraulic Oil', 'Grease', 'Specialty'];

  return (
    <div className="flex gap-6 h-[calc(100vh-3rem)]">
      {/* Products Section */}
      <div className="flex-1 space-y-4 overflow-hidden">
        {/* Search and Categories */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-3xl p-6 border border-white/50 shadow-2xl">
          <div className="relative mb-5">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name, brand, or viscosity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/90 border-2 border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300 transition-all text-gray-700 placeholder-gray-400 shadow-inner"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as any)}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-white/60'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Product Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Showing <span className="font-bold text-purple-600">{filteredProducts.length}</span> products
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-3xl p-6 border border-white/50 shadow-2xl overflow-y-auto h-[calc(100vh-18rem)] custom-scrollbar">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="backdrop-blur-xl bg-white/90 rounded-2xl p-5 border-2 border-white/60 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 text-left group relative overflow-hidden"
                >
                  {/* Featured Badge */}
                  {product.featured && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  
                  {/* Brand Logo Placeholder */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
                      <Droplet className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Brand Name */}
                  <p className="text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">{product.brand}</p>
                  
                  {/* Product Name */}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                  
                  {/* Viscosity Badge */}
                  {product.viscosity && (
                    <span className="inline-block px-3 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-700 rounded-lg border border-indigo-200 mb-3">
                      {product.viscosity}
                    </span>
                  )}
                  
                  {/* Category Badge */}
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-lg border mb-3 ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                  
                  {/* Price and Stock */}
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-black text-gray-900">₨{product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 font-medium">{product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">Stock</p>
                      <p className={`text-sm font-bold ${product.stock < 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[480px] backdrop-blur-2xl bg-white/70 rounded-3xl p-7 border border-white/50 shadow-2xl flex flex-col">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-white/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-xl relative">
            <ShoppingCart className="w-7 h-7 text-white" />
            {cart.length > 0 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {cart.length}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">Current Sale</h2>
            <p className="text-sm text-gray-600 font-medium">{cart.length} items in cart</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 font-semibold text-sm transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Customer Selection */}
        <button
          onClick={() => setShowCustomerModal(true)}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-white/90 to-white/70 border-2 border-white/70 hover:border-purple-300 hover:shadow-xl transition-all mb-4 text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Customer</p>
              {selectedCustomer ? (
                <>
                  <p className="font-bold text-gray-900">{selectedCustomer.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${getTierBadgeColor(selectedCustomer.tier)}`}>
                      {selectedCustomer.tier}
                    </span>
                    <span className="text-xs text-gray-500">{selectedCustomer.phone}</span>
                  </div>
                </>
              ) : (
                <p className="font-bold text-purple-600 group-hover:text-purple-700">Select Customer</p>
              )}
            </div>
          </div>
          {selectedCustomer ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCustomer(null);
              }}
              className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <Plus className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Discount */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-white/90 to-white/70 border-2 border-white/70 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-bold text-gray-900">Discount</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDiscount(Math.max(0, discount - 5))}
                className="w-8 h-8 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-purple-600" />
              </button>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-20 px-3 py-2 rounded-xl bg-white border-2 border-purple-200 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                onClick={() => setDiscount(Math.min(100, discount + 5))}
                className="w-8 h-8 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-purple-600" />
              </button>
              <span className="font-bold text-gray-900 text-lg">%</span>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-5 space-y-3 custom-scrollbar pr-2">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold text-lg">Cart is empty</p>
              <p className="text-sm text-gray-400 mt-2">Add lubricants to get started</p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-white/90 to-white/70 border-2 border-white/70 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-purple-600 uppercase">{item.brand}</span>
                        {item.viscosity && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/10 text-indigo-700 rounded border border-indigo-200">
                            {item.viscosity}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 leading-tight">{item.name}</h4>
                      <p className="text-sm text-gray-600 font-medium">₨{item.price.toLocaleString()} / {item.unit}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 flex items-center justify-center transition-colors flex-shrink-0 ml-3"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors font-bold"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-14 text-center font-black text-gray-900 text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors font-bold"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      ₨{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-3 mb-5 p-5 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border-2 border-white/70 shadow-inner">
          <div className="flex justify-between text-gray-700">
            <span className="font-semibold">Subtotal</span>
            <span className="font-bold">₨{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-purple-600">
              <span className="font-semibold">Discount ({discount}%)</span>
              <span className="font-bold">-₨{discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className="flex justify-between text-2xl font-black text-gray-900">
            <span>Total</span>
            <span className="text-purple-600">₨{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPaymentModal(true)}
          disabled={cart.length === 0}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white font-black text-lg shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <CreditCard className="w-6 h-6" />
            Process Payment
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.button>

        {/* Customer Modal */}
        <AnimatePresence>
          {showCustomerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setShowCustomerModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900">Select Customer</h3>
                    <p className="text-gray-600 mt-1">Choose from registered customers</p>
                  </div>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {customers.map((customer) => (
                    <motion.button
                      key={customer.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerModal(false);
                      }}
                      className="w-full p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-purple-300 transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-black text-gray-900 text-lg">{customer.name}</p>
                            <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getTierBadgeColor(customer.tier)}`}>
                              {customer.tier}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1">{customer.phone}</p>
                          {customer.email && (
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          )}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold">Total Purchases</p>
                          <p className="text-sm font-bold text-gray-900">₨{customer.totalPurchases.toLocaleString()}</p>
                        </div>
                        {customer.credit > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-orange-600 font-semibold">Outstanding Credit</p>
                            <p className="text-sm font-bold text-orange-600">₨{customer.credit.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900">Payment Method</h3>
                    <p className="text-gray-600 mt-1">Select payment option</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Total Amount Display */}
                <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 shadow-2xl">
                  <p className="text-white/90 font-semibold mb-2 text-sm uppercase tracking-wider">Total Amount</p>
                  <p className="text-5xl font-black text-white">₨{total.toLocaleString()}</p>
                  {selectedCustomer && (
                    <div className="mt-4 pt-4 border-t border-white/30">
                      <p className="text-white/90 text-sm font-semibold">Customer: {selectedCustomer.name}</p>
                    </div>
                  )}
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      alert(`Payment of ₨${total.toLocaleString()} completed with Cash!\n\nThank you for your business!`);
                      setCart([]);
                      setSelectedCustomer(null);
                      setDiscount(0);
                      setShowPaymentModal(false);
                    }}
                    className="w-full p-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Banknote className="w-7 h-7" />
                    Cash Payment
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      alert(`Payment of ₨${total.toLocaleString()} completed with Bank Transfer!\n\nReceipt will be sent shortly.`);
                      setCart([]);
                      setSelectedCustomer(null);
                      setDiscount(0);
                      setShowPaymentModal(false);
                    }}
                    className="w-full p-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <CreditCard className="w-7 h-7" />
                    Bank / Card
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      alert(`Payment of ₨${total.toLocaleString()} completed with JazzCash!\n\nTransaction ID: JC${Date.now()}`);
                      setCart([]);
                      setSelectedCustomer(null);
                      setDiscount(0);
                      setShowPaymentModal(false);
                    }}
                    className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Smartphone className="w-7 h-7" />
                    JazzCash
                  </motion.button>
                  
                  {selectedCustomer && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        alert(`₨${total.toLocaleString()} recorded as Credit for ${selectedCustomer.name}!\n\nTotal Outstanding: ₨${(selectedCustomer.credit + total).toLocaleString()}`);
                        setCart([]);
                        setSelectedCustomer(null);
                        setDiscount(0);
                        setShowPaymentModal(false);
                      }}
                      className="w-full p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <TrendingUp className="w-7 h-7" />
                      Credit Sale
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
