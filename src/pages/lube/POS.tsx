import { useCustomerStore } from '@/stores/dataStores';
import { useCustomerLedgerStore } from '@/stores/ledgerStore';
import { usePOSStore, useProductStore, useSalesStore } from '@/stores/productStore';
import type { Customer } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Archive,
    Banknote,
    CheckCircle,
    CreditCard,
    Droplet,
    Minus,
    Percent,
    Plus,
    Printer,
    Search,
    ShoppingCart,
    Smartphone,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';

type PaymentMethod = 'CASH' | 'CARD' | 'DIGITAL' | 'CREDIT';

interface CompletedSale {
    receiptNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
    customerName?: string;
    itemCount: number;
    timestamp: string;
}

export const POSPage = () => {
    const { products } = useProductStore();
    const { adjustStock } = useProductStore();
    const { cart, addToCart, updateCartItem, clearCart, getSubtotal } = usePOSStore();
    const { addSale } = useSalesStore();
    const { customers, addCustomer, isLoading: isCustomerLoading } = useCustomerStore();
    const { addEntry: addCustomerLedgerEntry } = useCustomerLedgerStore();

    const [activeCategory, setActiveCategory] = useState<'ALL' | string>('ALL');
    const [searchInput, setSearchInput] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [discount, setDiscount] = useState(0);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
    const [quickAddError, setQuickAddError] = useState<string | null>(null);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        cnic: '',
        creditLimit: 0,
        paymentTerms: 'CASH' as const,
        status: 'ACTIVE' as const,
    });

    const lubeProducts = products.filter(
        p => p.category !== 'FUEL_PETROL' && p.category !== 'FUEL_DIESEL'
    );

    const filteredProducts = lubeProducts.filter(product => {
        const matchesCategory = activeCategory === 'ALL' || product.category === activeCategory;
        const matchesSearch =
            product.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchInput.toLowerCase()) ||
            product.category.toLowerCase().includes(searchInput.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const updateQuantity = (productId: string, change: number) => {
        const cartItem = cart.find(item => item.productId === productId);
        if (cartItem) {
            const newQuantity = cartItem.quantity + change;
            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCartItem(productId, newQuantity);
            }
        }
    };

    const removeFromCart = (productId: string) => {
        const newCart = cart.filter(item => item.productId !== productId);
        clearCart();
        newCart.forEach(item => addToCart(item.productId, item.quantity));
    };

    const subtotal = getSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    /**
     * Core sale completion logic.
     * 1. Saves a Sale record to useSalesStore (persisted to localStorage)
     * 2. Deducts stock from each product via adjustStock()
     * 3. If CREDIT + customer selected → posts to customer ledger
     * 4. Shows receipt modal with sale details
     */
    const handleCompleteSale = async (paymentMethod: PaymentMethod) => {
        if (cart.length === 0 || isProcessing) return;
        setIsProcessing(true);

        try {
            const now = new Date().toISOString();

            // 1. Create sale record in persistent store
            const sale = addSale({
                stationId: 'STN-001',
                timestamp: now,
                items: cart.map(item => ({
                    ...item,
                    discount: item.discount ?? 0,
                })),
                subtotal,
                discount: discountAmount,
                taxAmount: 0,
                totalAmount: total,
                paymentMethod,
                customerId: selectedCustomer?.customerId ?? undefined,
                customerName: selectedCustomer?.name ?? undefined,
                cashierId: 'CURRENT_USER',
                cashierName: 'Manager',
                shiftId: `LUBE-${now.split('T')[0]}`,
                status: 'COMPLETED',
                businessUnit: 'LUBE',
            });

            // 2. Deduct stock for each sold item
            cart.forEach(item => {
                adjustStock(item.productId, -item.quantity, `POS Sale — ${sale.receiptNumber}`);
            });

            // 3. Post to customer ledger if credit sale
            if (paymentMethod === 'CREDIT' && selectedCustomer) {
                addCustomerLedgerEntry({
                    customerId: selectedCustomer.customerId,
                    customerName: selectedCustomer.name,
                    type: 'CREDIT_SALE',
                    date: now,
                    shiftId: `LUBE-${now.split('T')[0]}`,
                    staffId: 'POS',
                    staffName: 'POS Operator',
                    reference: sale.receiptNumber,
                    debit: total,
                    credit: 0,
                    description: `Credit Sale — Receipt ${sale.receiptNumber}`,
                    remarks: `${cart.length} item(s) sold on credit`,
                });
            }

            // 4. Show receipt
            setCompletedSale({
                receiptNumber: sale.receiptNumber,
                total,
                paymentMethod,
                customerName: selectedCustomer?.name,
                itemCount: cart.length,
                timestamp: now,
            });

            // 5. Reset POS state
            clearCart();
            setSelectedCustomer(null);
            setDiscount(0);
            setShowPaymentModal(false);
            setShowReceiptModal(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const getCategoryColor = (category: string) => {
        const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
            ENGINE_OIL: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
            TRANSMISSION_OIL: {
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
            },
            BRAKE_FLUID: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
            COOLANT: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
            GEAR_OIL: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
            HYDRAULIC_OIL: {
                bg: 'bg-orange-50',
                text: 'text-orange-700',
                border: 'border-orange-200',
            },
            GREASE: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
            SPECIALTY: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
        };
        return (
            categoryColors[category] || {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                border: 'border-gray-200',
            }
        );
    };

    const categories = [
        { value: 'ALL', label: 'All Products' },
        { value: 'ENGINE_OIL', label: 'Engine Oil' },
        { value: 'TRANSMISSION_OIL', label: 'Transmission' },
        { value: 'BRAKE_FLUID', label: 'Brake Fluid' },
        { value: 'COOLANT', label: 'Coolant' },
        { value: 'GEAR_OIL', label: 'Gear Oil' },
    ];

    return (
        <div className="flex gap-5 h-[calc(100vh-5rem)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* PRODUCTS SECTION */}
            <div className="flex-1 flex flex-col gap-4 p-5">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-5">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400"
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                    activeCategory === cat.value
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                        <div className="flex-1" />
                        <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
                            <span className="text-indigo-600 font-bold">
                                {filteredProducts.length}
                            </span>
                            products
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200/80 p-5 overflow-y-auto">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                                <Archive className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 tracking-tight mb-2">No Products Configured</h3>
                            <p className="text-sm text-gray-500 font-medium max-w-md">
                                The Lube POS requires at least one product in inventory to operate. Please add products using the Products section.
                            </p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="font-bold text-gray-400">No products found</p>
                            <p className="text-sm text-gray-400">
                                Try a different search or category
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                            <AnimatePresence>
                                {filteredProducts.map(product => {
                                    const colors = getCategoryColor(product.category);
                                    const outOfStock = product.currentStock <= 0;
                                    return (
                                        <motion.button
                                            key={product.productId}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            whileHover={outOfStock ? {} : { y: -2 }}
                                            whileTap={outOfStock ? {} : { scale: 0.98 }}
                                            onClick={() =>
                                                !outOfStock && addToCart(product.productId, 1)
                                            }
                                            disabled={outOfStock}
                                            className={`group bg-white border border-gray-200 rounded-xl p-4 transition-all text-left relative overflow-hidden ${
                                                outOfStock
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:border-indigo-300 hover:shadow-xl'
                                            }`}
                                        >
                                            {/* Stock indicator dot */}
                                            <div
                                                className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                                                    product.currentStock > 100
                                                        ? 'bg-green-500'
                                                        : product.currentStock > 20
                                                          ? 'bg-yellow-500'
                                                          : product.currentStock > 0
                                                            ? 'bg-orange-500'
                                                            : 'bg-red-500'
                                                }`}
                                            />
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 shadow-md">
                                                <Droplet className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                                                {product.brand}
                                            </p>
                                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">
                                                {product.name}
                                            </h3>
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${colors.bg} ${colors.text} border ${colors.border} mb-3`}
                                            >
                                                {product.category.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xl font-black text-gray-900">
                                                        ₨{product.salePrice.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        per {product.unit}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 mb-0.5">
                                                        Stock
                                                    </p>
                                                    <p
                                                        className={`text-sm font-bold ${
                                                            product.currentStock <= 0
                                                                ? 'text-red-600'
                                                                : product.currentStock < 20
                                                                  ? 'text-orange-600'
                                                                  : 'text-green-600'
                                                        }`}
                                                    >
                                                        {product.currentStock <= 0
                                                            ? 'OUT'
                                                            : product.currentStock}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* CART SIDEBAR */}
            <div className="w-[420px] flex flex-col gap-4 p-5 pr-6">
                {/* Cart Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg relative">
                            <ShoppingCart className="w-7 h-7 text-white" />
                            {cart.length > 0 && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                    {cart.length}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-gray-900">Current Sale</h2>
                            <p className="text-sm text-gray-500">
                                {cart.length} item{cart.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {cart.length > 0 && (
                            <button
                                onClick={() => {
                                    clearCart();
                                    setDiscount(0);
                                    setSelectedCustomer(null);
                                }}
                                className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Clear cart"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Customer Selection */}
                    <button
                        onClick={() => setShowCustomerModal(true)}
                        className="w-full p-4 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            {selectedCustomer ? (
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">
                                        {selectedCustomer.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedCustomer.phone}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                                        Add Customer
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Optional — required for credit
                                    </p>
                                </div>
                            )}
                        </div>
                        {selectedCustomer ? (
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setSelectedCustomer(null);
                                }}
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        )}
                    </button>
                </div>

                {/* Discount */}
                {cart.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Percent className="w-5 h-5 text-amber-600" />
                                </div>
                                <span className="font-bold text-gray-900">Discount</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDiscount(Math.max(0, discount - 5))}
                                    className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-4 h-4 text-gray-700" />
                                </button>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={e =>
                                        setDiscount(
                                            Math.max(0, Math.min(100, Number(e.target.value)))
                                        )
                                    }
                                    className="w-16 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={() => setDiscount(Math.min(100, discount + 5))}
                                    className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-4 h-4 text-gray-700" />
                                </button>
                                <span className="font-bold text-gray-700">%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200/80 p-5 overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                <ShoppingCart className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-bold text-lg mb-1">Cart is Empty</p>
                            <p className="text-sm text-gray-500">Add products to start a sale</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {cart.map(item => {
                                    const product = products.find(
                                        p => p.productId === item.productId
                                    );
                                    if (!product) return null;
                                    return (
                                        <motion.div
                                            key={item.productId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <Droplet className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-indigo-600 uppercase mb-0.5">
                                                        {product.brand}
                                                    </p>
                                                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        ₨{product.salePrice.toLocaleString()} / unit
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.productId, -1)
                                                        }
                                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
                                                    >
                                                        <Minus className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    <span className="w-12 text-center font-black text-gray-900 text-base">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.productId, 1)
                                                        }
                                                        disabled={
                                                            item.quantity >= product.currentStock
                                                        }
                                                        className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm disabled:opacity-40"
                                                    >
                                                        <Plus className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                </div>
                                                <p className="text-lg font-black text-gray-900">
                                                    ₨
                                                    {(
                                                        product.salePrice * item.quantity
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Totals & Checkout */}
                {cart.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-5">
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-bold">₨{subtotal.toLocaleString()}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-amber-600">
                                    <span className="font-medium">Discount ({discount}%)</span>
                                    <span className="font-bold">
                                        -₨{discountAmount.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="h-px bg-gray-200" />
                            <div className="flex justify-between text-gray-900">
                                <span className="text-xl font-black">Total</span>
                                <span className="text-2xl font-black text-indigo-600">
                                    ₨{total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            Process Payment — ₨{total.toLocaleString()}
                        </motion.button>
                    </div>
                )}

                {/* ── Customer Modal ── */}
                <AnimatePresence>
                    {showCustomerModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowCustomerModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            >
                                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-center justify-between">
	                                    <div>
	                                        <h3 className="text-2xl font-black text-gray-900">
	                                            Select Customer
	                                        </h3>
	                                        <p className="text-sm text-gray-500 mt-1">
	                                            Required for credit sales
	                                        </p>
	                                    </div>
	                                    <button
	                                        onClick={() => {
	                                            setQuickAddError(null);
	                                            setShowQuickAddCustomer(v => !v);
	                                        }}
	                                        className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-bold text-sm flex items-center gap-2"
	                                        type="button"
	                                    >
	                                        <UserPlus className="w-4 h-4" />
	                                        Quick Add
	                                    </button>
	                                    <button
	                                        onClick={() => setShowCustomerModal(false)}
	                                        className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
	                                    >
	                                        <X className="w-5 h-5" />
	                                    </button>
	                                </div>
	                                <div className="p-6 space-y-3">
	                                    {showQuickAddCustomer && (
	                                        <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-4">
	                                            <div className="flex items-center justify-between mb-3">
	                                                <div>
	                                                    <p className="font-black text-gray-900">
	                                                        Create Customer
	                                                    </p>
	                                                    <p className="text-xs text-gray-500">
	                                                        Adds customer without leaving POS
	                                                    </p>
	                                                </div>
	                                                <button
	                                                    onClick={() => setShowQuickAddCustomer(false)}
	                                                    className="p-2 rounded-xl bg-white/70 hover:bg-white transition-colors"
	                                                    type="button"
	                                                >
	                                                    <X className="w-4 h-4" />
	                                                </button>
	                                            </div>

	                                            {quickAddError && (
	                                                <div className="mb-3 text-sm font-bold text-red-600">
	                                                    {quickAddError}
	                                                </div>
	                                            )}

	                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
	                                                <div>
	                                                    <label className="text-xs font-bold text-gray-600">
	                                                        Name *
	                                                    </label>
	                                                    <input
	                                                        value={newCustomer.name}
	                                                        onChange={e =>
	                                                            setNewCustomer(s => ({
	                                                                ...s,
	                                                                name: e.target.value,
	                                                            }))
	                                                        }
	                                                        className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	                                                        placeholder="Customer name"
	                                                    />
	                                                </div>
	                                                <div>
	                                                    <label className="text-xs font-bold text-gray-600">
	                                                        Phone *
	                                                    </label>
	                                                    <input
	                                                        value={newCustomer.phone}
	                                                        onChange={e =>
	                                                            setNewCustomer(s => ({
	                                                                ...s,
	                                                                phone: e.target.value,
	                                                            }))
	                                                        }
	                                                        className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	                                                        placeholder="03xx-xxxxxxx"
	                                                    />
	                                                </div>
	                                                <div>
	                                                    <label className="text-xs font-bold text-gray-600">
	                                                        CNIC (optional)
	                                                    </label>
	                                                    <input
	                                                        value={newCustomer.cnic}
	                                                        onChange={e =>
	                                                            setNewCustomer(s => ({
	                                                                ...s,
	                                                                cnic: e.target.value,
	                                                            }))
	                                                        }
	                                                        className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	                                                        placeholder="xxxxx-xxxxxxx-x"
	                                                    />
	                                                </div>
	                                                <div>
	                                                    <label className="text-xs font-bold text-gray-600">
	                                                        Credit Limit
	                                                    </label>
	                                                    <input
	                                                        value={newCustomer.creditLimit}
	                                                        onChange={e =>
	                                                            setNewCustomer(s => ({
	                                                                ...s,
	                                                                creditLimit: Number(e.target.value || 0),
	                                                            }))
	                                                        }
	                                                        className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
	                                                        type="number"
	                                                        min={0}
	                                                        step={1}
	                                                    />
	                                                </div>
	                                            </div>

	                                            <div className="mt-4 flex items-center justify-end gap-2">
	                                                <button
	                                                    onClick={() => {
	                                                        setNewCustomer({
	                                                            name: '',
	                                                            phone: '',
	                                                            cnic: '',
	                                                            creditLimit: 0,
	                                                            paymentTerms: 'CASH',
	                                                            status: 'ACTIVE',
	                                                        });
	                                                        setQuickAddError(null);
	                                                    }}
	                                                    className="px-4 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors font-bold text-sm"
	                                                    type="button"
	                                                >
	                                                    Clear
	                                                </button>
	                                                <button
	                                                    disabled={
	                                                        isCustomerLoading ||
	                                                        !newCustomer.name.trim() ||
	                                                        !newCustomer.phone.trim()
	                                                    }
	                                                    onClick={async () => {
	                                                        if (
	                                                            !newCustomer.name.trim() ||
	                                                            !newCustomer.phone.trim()
	                                                        ) {
	                                                            setQuickAddError(
	                                                                'Name and phone are required'
	                                                            );
	                                                            return;
	                                                        }

	                                                        setQuickAddError(null);
	                                                        try {
	                                                            await addCustomer({
	                                                                stationId: '',
	                                                                name: newCustomer.name.trim(),
	                                                                phone: newCustomer.phone.trim(),
	                                                                cnic: newCustomer.cnic.trim() || undefined,
	                                                                creditLimit: Number(
	                                                                    newCustomer.creditLimit || 0
	                                                                ),
	                                                                paymentTerms: newCustomer.paymentTerms,
	                                                                status: newCustomer.status,
	                                                                businessUnit: 'LUBE',
	                                                            });

	                                                            const nextCustomers =
	                                                                useCustomerStore.getState().customers;
	                                                            const matches = [...nextCustomers]
	                                                                .filter(
	                                                                    c =>
	                                                                        c.name ===
	                                                                            newCustomer.name.trim() &&
	                                                                        c.phone ===
	                                                                            newCustomer.phone.trim()
	                                                                )
	                                                                .sort((a, b) =>
	                                                                    a.createdAt > b.createdAt ? 1 : -1
	                                                                );
	                                                            const created =
	                                                                matches.length > 0
	                                                                    ? matches[matches.length - 1]
	                                                                    : undefined;

	                                                            if (created) {
	                                                                setSelectedCustomer(created);
	                                                                setShowCustomerModal(false);
	                                                            }

	                                                            setShowQuickAddCustomer(false);
	                                                            setNewCustomer({
	                                                                name: '',
	                                                                phone: '',
	                                                                cnic: '',
	                                                                creditLimit: 0,
	                                                                paymentTerms: 'CASH',
	                                                                status: 'ACTIVE',
	                                                            });
	                                                        } catch (e: any) {
	                                                            setQuickAddError(
	                                                                e?.message || 'Failed to add customer'
	                                                            );
	                                                        }
	                                                    }}
	                                                    className="px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-black text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
	                                                    type="button"
	                                                >
	                                                    <Plus className="w-4 h-4" />
	                                                    Create
	                                                </button>
	                                            </div>
	                                        </div>
	                                    )}
	                                    {customers.length === 0 ? (
	                                        <div className="text-center py-10 text-gray-400">
	                                            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
	                                            <p className="font-semibold">No customers yet</p>
                                            <p className="text-sm">
                                                Add customers in Financials → Customers
                                            </p>
                                        </div>
                                    ) : (
                                        customers.map(customer => (
                                            <button
                                                key={customer.customerId}
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setShowCustomerModal(false);
                                                }}
                                                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left flex items-center gap-4"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {customer.phone}
                                                    </p>
                                                </div>
                                                {selectedCustomer?.customerId ===
                                                    customer.customerId && (
                                                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Payment Modal ── */}
                <AnimatePresence>
                    {showPaymentModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => !isProcessing && setShowPaymentModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
                            >
                                <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">
                                            Choose Payment
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Select payment method to complete sale
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                        disabled={isProcessing}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
                                        <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">
                                            Total Amount
                                        </p>
                                        <p className="text-4xl font-black text-white">
                                            ₨{total.toLocaleString()}
                                        </p>
                                        {discount > 0 && (
                                            <p className="text-white/70 text-sm mt-1">
                                                Includes {discount}% discount (₨
                                                {discountAmount.toLocaleString()} off)
                                            </p>
                                        )}
                                        {selectedCustomer && (
                                            <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                                                <User className="w-4 h-4 text-white/80" />
                                                <p className="text-white/90 text-sm">
                                                    {selectedCustomer.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleCompleteSale('CASH')}
                                            disabled={isProcessing}
                                            className="w-full p-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
                                        >
                                            <Banknote className="w-6 h-6" />
                                            Cash Payment
                                        </button>

                                        <button
                                            onClick={() => handleCompleteSale('CARD')}
                                            disabled={isProcessing}
                                            className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
                                        >
                                            <CreditCard className="w-6 h-6" />
                                            Card / Bank Transfer
                                        </button>

                                        <button
                                            onClick={() => handleCompleteSale('DIGITAL')}
                                            disabled={isProcessing}
                                            className="w-full p-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-60"
                                        >
                                            <Smartphone className="w-6 h-6" />
                                            Mobile / Digital Payment
                                        </button>

                                        <button
                                            onClick={() => handleCompleteSale('CREDIT')}
                                            disabled={isProcessing || !selectedCustomer}
                                            title={
                                                !selectedCustomer
                                                    ? 'Select a customer first for credit sales'
                                                    : ''
                                            }
                                            className="w-full p-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <User className="w-6 h-6" />
                                            Credit Sale
                                            {!selectedCustomer && (
                                                <span className="text-xs font-normal">
                                                    (Select customer first)
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {isProcessing && (
                                        <div className="mt-4 flex items-center justify-center gap-3 text-gray-600">
                                            <span className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                                            <span className="font-medium">Processing sale...</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Receipt Modal ── */}
                <AnimatePresence>
                    {showReceiptModal && completedSale && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                            >
                                <div className="p-8 text-center">
                                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-1">
                                        Sale Complete!
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Receipt:{' '}
                                        <span className="font-mono font-bold text-indigo-600">
                                            {completedSale.receiptNumber}
                                        </span>
                                    </p>

                                    <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount</span>
                                            <span className="font-black text-gray-900 text-lg">
                                                ₨{completedSale.total.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment</span>
                                            <span className="font-bold text-gray-900">
                                                {completedSale.paymentMethod}
                                            </span>
                                        </div>
                                        {completedSale.customerName && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Customer</span>
                                                <span className="font-bold text-gray-900">
                                                    {completedSale.customerName}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Items</span>
                                            <span className="font-bold text-gray-900">
                                                {completedSale.itemCount}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowReceiptModal(false);
                                                setCompletedSale(null);
                                            }}
                                            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
                                        >
                                            New Sale
                                        </button>
                                        <button
                                            onClick={() => {
                                                window.print();
                                            }}
                                            className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors flex items-center gap-2"
                                        >
                                            <Printer className="w-5 h-5" />
                                            Print
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
