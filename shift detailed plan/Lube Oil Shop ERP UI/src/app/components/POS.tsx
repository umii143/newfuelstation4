import React, { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Banknote,
  CreditCard,
  Smartphone,
  Printer,
  Save,
  ShoppingCart,
  X,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode: string;
}

interface CartItem extends Product {
  quantity: number;
  discount: number;
}

const categories = [
  "All",
  "Engine Oil",
  "Transmission Oil",
  "Brake Fluid",
  "Coolant",
  "Additives",
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Castrol GTX 20W-50",
    price: 3200,
    stock: 120,
    category: "Engine Oil",
    barcode: "001",
  },
  {
    id: "2",
    name: "Shell Helix HX7 10W-40",
    price: 3500,
    stock: 85,
    category: "Engine Oil",
    barcode: "002",
  },
  {
    id: "3",
    name: "Mobil Super 3000 5W-40",
    price: 3800,
    stock: 95,
    category: "Engine Oil",
    barcode: "003",
  },
  {
    id: "4",
    name: "Total Quartz 9000 5W-30",
    price: 3600,
    stock: 65,
    category: "Engine Oil",
    barcode: "004",
  },
  {
    id: "5",
    name: "Gulf Formula G 20W-50",
    price: 2800,
    stock: 150,
    category: "Engine Oil",
    barcode: "005",
  },
  {
    id: "6",
    name: "ATF Transmission Fluid",
    price: 1500,
    stock: 80,
    category: "Transmission Oil",
    barcode: "006",
  },
  {
    id: "7",
    name: "DOT 4 Brake Fluid",
    price: 800,
    stock: 120,
    category: "Brake Fluid",
    barcode: "007",
  },
  {
    id: "8",
    name: "Coolant - Red",
    price: 600,
    stock: 140,
    category: "Coolant",
    barcode: "008",
  },
];

export function POS() {
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<
    string | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bank" | "easypaisa" | "jazzcash"
  >("cash");
  const [showCustomerModal, setShowCustomerModal] =
    useState(false);
  const [discount, setDiscount] = useState(0);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;
    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(
      (item) => item.id === product.id,
    );
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        { ...product, quantity: 1, discount: 0 },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item,
      ),
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              discount: Math.max(0, Math.min(100, discount)),
            }
          : item,
      ),
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discountAmount =
    cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      return sum + (itemTotal * item.discount) / 100;
    }, 0) +
    (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedCustomer(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
        {/* Search & Categories */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 shadow-3d"
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-11 pr-4 py-3 rounded-xl outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium smooth-transition ${
                  selectedCategory === category
                    ? "bg-[#0066cc] text-white shadow-lg"
                    : "bg-white/50 text-gray-700 hover:bg-white"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="flex-1 glass-card rounded-2xl p-4 shadow-3d overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto custom-scrollbar">
            {filteredProducts.map((product, index) => (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="glass-card rounded-xl p-4 text-left shadow-3d group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0066cc] to-[#00a896] flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      product.stock < 50
                        ? "bg-red-100 text-red-600"
                        : product.stock < 100
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {product.stock}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0066cc] smooth-transition">
                  {product.name}
                </h4>
                <p className="text-lg font-bold text-[#0066cc]">
                  ₨ {product.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {product.category}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-[420px] glass-card rounded-2xl p-6 shadow-3d flex flex-col"
      >
        {/* Customer Selection */}
        <div className="mb-4">
          <button
            onClick={() => setShowCustomerModal(true)}
            className="w-full glass-input rounded-xl p-3 flex items-center gap-3 hover:border-[#0066cc] smooth-transition"
          >
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">
              {selectedCustomer || "Select Customer (Optional)"}
            </span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-3">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-gray-400"
              >
                <ShoppingCart className="w-16 h-16 mb-3" />
                <p>Cart is empty</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card rounded-xl p-3"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-[#0066cc] font-semibold">
                        ₨ {item.price.toLocaleString()} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 smooth-transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, -1)
                        }
                        className="p-1.5 rounded-md hover:bg-white smooth-transition"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, 1)
                        }
                        className="p-1.5 rounded-md hover:bg-white smooth-transition"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="flex-1 flex items-center gap-2 bg-white/50 rounded-lg px-3 py-1.5">
                      <Percent className="w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount}
                        onChange={(e) =>
                          updateItemDiscount(
                            item.id,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full bg-transparent outline-none text-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-600">
                        %
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div className="space-y-3 mb-4 p-4 bg-white/50 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                ₨ {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Overall Discount
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) =>
                  setDiscount(parseFloat(e.target.value) || 0)
                }
                className="flex-1 glass-input rounded-lg px-3 py-1.5 text-sm"
                placeholder="0"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold text-red-600">
                  - ₨ {discountAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="h-px bg-gray-200" />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">
                Total
              </span>
              <span className="text-2xl font-bold text-[#0066cc]">
                ₨ {total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPaymentMethod("cash")}
            className={`p-3 rounded-xl smooth-transition flex flex-col items-center gap-1 ${
              paymentMethod === "cash"
                ? "bg-[#0066cc] text-white shadow-lg"
                : "glass-card text-gray-700"
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span className="text-xs">Cash</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPaymentMethod("bank")}
            className={`p-3 rounded-xl smooth-transition flex flex-col items-center gap-1 ${
              paymentMethod === "bank"
                ? "bg-[#0066cc] text-white shadow-lg"
                : "glass-card text-gray-700"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">Bank</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPaymentMethod("easypaisa")}
            className={`p-3 rounded-xl smooth-transition flex flex-col items-center gap-1 ${
              paymentMethod === "easypaisa"
                ? "bg-[#0066cc] text-white shadow-lg"
                : "glass-card text-gray-700"
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-xs">Easypaisa</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPaymentMethod("jazzcash")}
            className={`p-3 rounded-xl smooth-transition flex flex-col items-center gap-1 ${
              paymentMethod === "jazzcash"
                ? "bg-[#0066cc] text-white shadow-lg"
                : "glass-card text-gray-700"
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-xs">JazzCash</span>
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearCart}
            disabled={cart.length === 0}
            className="btn-glow px-6 py-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Clear
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={cart.length === 0}
            className="btn-glow px-6 py-4 rounded-xl bg-gradient-to-r from-[#0066cc] to-[#00a896] text-white font-semibold shadow-lg hover:shadow-xl smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print & Pay
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}