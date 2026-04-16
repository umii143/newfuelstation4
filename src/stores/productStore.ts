import { useSettingsStore } from '@/stores/authStore';
import type { HoldOrder, Product, ProductCategory, Sale, SaleItem } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStationId } from '@/lib/authHelpers';
import { fsSet } from '@/services/firestoreService';
import { COLLECTIONS } from '@/lib/db';

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    selectedCategory: ProductCategory | string | 'ALL';
    categories: string[];

    // Actions
    addProduct: (product: Omit<Product, 'productId'>) => void;
    updateProduct: (productId: string, updates: Partial<Product>) => void;
    deleteProduct: (productId: string) => void;
    adjustStock: (productId: string, adjustment: number, reason: string) => void;
    setSearchQuery: (query: string) => void;
    setCategory: (category: ProductCategory | string | 'ALL') => void;

    // Category Actions
    addCategory: (name: string) => void;
    updateCategory: (oldName: string, newName: string) => void;
    deleteCategory: (name: string) => void;

    // Computed
    getFilteredProducts: () => Product[];
    getLowStockProducts: () => Product[];
    getProductById: (productId: string) => Product | undefined;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            products: [],
            isLoading: false,
            error: null,
            searchQuery: '',
            selectedCategory: 'ALL',
            categories: [
                'ENGINE_OIL',
                'GEAR_OIL',
                'BRAKE_FLUID',
                'COOLANT',
                'GREASE',
                'FILTER',
                'ACCESSORY',
            ],

            addProduct: product => {
                const { settings } = useSettingsStore.getState();
                // Generate truly unique ID using timestamp + random string
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 9);
                const productId = `PRD-${timestamp}-${randomStr}`;

                const newProduct: Product = {
                    ...product,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    productId,
                };
                set(state => ({ products: [...state.products, newProduct] }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.PRODUCTS, productId, newProduct);
            },

            updateProduct: (productId, updates) => {
                set(state => {
                    const updatedProducts = state.products.map(p =>
                        p.productId === productId ? { ...p, ...updates } : p
                    );
                    
                    const sid = getStationId();
                    const updatedProduct = updatedProducts.find(p => p.productId === productId);
                    if (sid && updatedProduct) {
                        fsSet(sid, COLLECTIONS.PRODUCTS, productId, updatedProduct);
                    }
                    
                    return { products: updatedProducts };
                });
            },

            deleteProduct: productId => {
                set(state => ({
                    products: state.products.filter(p => p.productId !== productId),
                }));
                
                const sid = getStationId();
                if (sid) {
                    import('@/services/firestoreService').then(({ fsDelete }) => {
                        fsDelete(sid, COLLECTIONS.PRODUCTS, productId);
                    });
                }
            },

            adjustStock: (productId, adjustment) => {
                set(state => {
                    const updatedProducts = state.products.map(p =>
                        p.productId === productId
                            ? { ...p, currentStock: Math.max(0, p.currentStock + adjustment) }
                            : p
                    );
                    
                    const sid = getStationId();
                    const updatedProduct = updatedProducts.find(p => p.productId === productId);
                    if (sid && updatedProduct) {
                        fsSet(sid, COLLECTIONS.PRODUCTS, productId, updatedProduct);
                    }
                    
                    return { products: updatedProducts };
                });
            },

            setSearchQuery: query => set({ searchQuery: query }),
            setCategory: category => set({ selectedCategory: category }),

            addCategory: name => {
                if (!get().categories.includes(name)) {
                    set(state => ({ categories: [...state.categories, name] }));
                }
            },

            updateCategory: (oldName, newName) => {
                set(state => ({
                    categories: state.categories.map(c => (c === oldName ? newName : c)),
                    products: state.products.map(p =>
                        p.category === oldName ? { ...p, category: newName as ProductCategory } : p
                    ),
                }));
            },

            deleteCategory: name => {
                set(state => ({
                    categories: state.categories.filter(c => c !== name),
                    // Optionally reset products with this category to GENERAL
                    products: state.products.map(p =>
                        p.category === name ? { ...p, category: 'GENERAL' as ProductCategory } : p
                    ),
                }));
            },

            getFilteredProducts: () => {
                const { products, searchQuery, selectedCategory } = get();
                const { settings } = useSettingsStore.getState();
                return products.filter(p => {
                    const matchesBU = p.businessUnit === settings.businessUnit;
                    const matchesSearch =
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory =
                        selectedCategory === 'ALL' || p.category === selectedCategory;
                    return matchesBU && matchesSearch && matchesCategory;
                });
            },

            getLowStockProducts: () => {
                const { settings } = useSettingsStore.getState();
                return get().products.filter(
                    p =>
                        p.currentStock <= p.reorderPoint && p.businessUnit === settings.businessUnit
                );
            },

            getProductById: productId => {
                return get().products.find(p => p.productId === productId);
            },
        }),
        {
            name: 'motorway-products',
            partialize: state => ({ products: state.products, categories: state.categories }),
        }
    )
);

// POS Store
interface POSState {
    cart: SaleItem[];
    holdOrders: HoldOrder[];
    currentCustomerId: string | null;
    currentCustomerName: string | null;
    discount: number;

    // Actions
    addToCart: (productOrId: Product | string, quantity?: number) => void;
    updateCartItem: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    setDiscount: (discount: number) => void;
    setCustomer: (customerId: string | null, customerName: string | null) => void;

    holdCurrentOrder: (customerName: string) => void;
    retrieveHoldOrder: (holdId: string) => void;
    deleteHoldOrder: (holdId: string) => void;

    // Computed
    getSubtotal: () => number;
    getTaxAmount: () => number;
    getTotalAmount: () => number;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            cart: [],
            holdOrders: [],
            currentCustomerId: null,
            currentCustomerName: null,
            discount: 0,

            addToCart: (productOrId, quantity = 1) => {
                const { cart } = get();
                const product =
                    typeof productOrId === 'string'
                        ? useProductStore.getState().getProductById(productOrId)
                        : productOrId;

                if (!product) return;

                const existingItem = cart.find(item => item.productId === product.productId);

                if (existingItem) {
                    get().updateCartItem(product.productId, existingItem.quantity + quantity);
                } else {
                    const { settings } = useSettingsStore.getState() as any;
                    const taxConfig = settings?.taxConfig || {
                        enabled: true,
                        mode: 'EXCLUSIVE',
                        defaultRate: 17,
                    };
                    const { enabled, mode } = taxConfig;

                    let taxAmount = 0;
                    let unitPrice = product.salePrice;

                    if (enabled) {
                        if (mode === 'INCLUSIVE') {
                            taxAmount =
                                (product.salePrice * product.taxRate) / (1 + product.taxRate);
                        } else {
                            taxAmount = product.salePrice * product.taxRate;
                        }
                    }

                    const newItem: SaleItem = {
                        productId: product.productId,
                        productName: product.name,
                        sku: product.sku,
                        quantity,
                        unitPrice,
                        discount: 0,
                        taxAmount: taxAmount * quantity,
                        subtotal:
                            mode === 'INCLUSIVE' || !enabled
                                ? unitPrice * quantity
                                : (unitPrice + taxAmount) * quantity,
                    };
                    set({ cart: [...cart, newItem] });
                }
            },

            updateCartItem: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }

                set(state => ({
                    cart: state.cart.map(item => {
                        if (item.productId === productId) {
                            const { settings } = useSettingsStore.getState() as any;
                            const taxConfig = settings?.taxConfig || {
                                enabled: true,
                                mode: 'EXCLUSIVE',
                                defaultRate: 17,
                            };
                            const { enabled, mode } = taxConfig;
                            const product = useProductStore.getState().getProductById(productId);
                            const taxRate = product?.taxRate || 0.17;

                            let taxAmount = 0;
                            if (enabled) {
                                if (mode === 'INCLUSIVE') {
                                    taxAmount = (item.unitPrice * taxRate) / (1 + taxRate);
                                } else {
                                    taxAmount = item.unitPrice * taxRate;
                                }
                            }

                            return {
                                ...item,
                                quantity,
                                taxAmount: taxAmount * quantity,
                                subtotal:
                                    mode === 'INCLUSIVE' || !enabled
                                        ? item.unitPrice * quantity
                                        : (item.unitPrice + taxAmount) * quantity,
                            };
                        }
                        return item;
                    }),
                }));
            },

            removeFromCart: productId => {
                set(state => ({
                    cart: state.cart.filter(item => item.productId !== productId),
                }));
            },

            clearCart: () => {
                set({
                    cart: [],
                    currentCustomerId: null,
                    currentCustomerName: null,
                    discount: 0,
                });
            },

            setDiscount: discount => set({ discount }),

            setCustomer: (customerId, customerName) => {
                set({ currentCustomerId: customerId, currentCustomerName: customerName });
            },

            holdCurrentOrder: customerName => {
                const { cart } = get();
                if (cart.length === 0) return;

                const { settings } = useSettingsStore.getState();
                const holdOrder: HoldOrder = {
                    holdId: `HOLD-${Date.now()}`,
                    customerName,
                    items: cart,
                    subtotal: get().getSubtotal(),
                    timestamp: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                };

                set(state => ({
                    holdOrders: [...state.holdOrders, holdOrder],
                    cart: [],
                }));
            },

            retrieveHoldOrder: holdId => {
                const holdOrder = get().holdOrders.find(ho => ho.holdId === holdId);
                if (holdOrder) {
                    set({
                        cart: holdOrder.items,
                        holdOrders: get().holdOrders.filter(ho => ho.holdId !== holdId),
                    });
                }
            },

            deleteHoldOrder: holdId => {
                set(state => ({
                    holdOrders: state.holdOrders.filter(ho => ho.holdId !== holdId),
                }));
            },

            getSubtotal: () => {
                return get().cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            },

            getTaxAmount: () => {
                return get().cart.reduce((sum, item) => sum + item.taxAmount, 0);
            },

            getTotalAmount: () => {
                const { settings } = useSettingsStore.getState() as any;
                const taxConfig = settings?.taxConfig || {
                    enabled: true,
                    mode: 'EXCLUSIVE',
                    defaultRate: 17,
                };
                const subtotal = get().getSubtotal();
                const tax = get().getTaxAmount();
                const discount = get().discount;

                if (taxConfig.mode === 'INCLUSIVE' || !taxConfig.enabled) {
                    return subtotal - discount;
                }
                return subtotal + tax - discount;
            },
        }),
        {
            name: 'motorway-pos',
            partialize: state => ({ holdOrders: state.holdOrders }),
        }
    )
);

// Sales Store (completed transactions)
interface SalesState {
    sales: Sale[];
    isLoading: boolean;

    addSale: (sale: Omit<Sale, 'saleId' | 'receiptNumber'>) => Sale;
    voidSale: (saleId: string, reason: string, voidedBy: string) => void;
    getSalesForShift: (shiftId: string) => Sale[];
    getTodaySales: () => Sale[];
}

export const useSalesStore = create<SalesState>()(
    persist(
        (set, get) => ({
            sales: [],
            isLoading: false,

            addSale: saleData => {
                const { settings } = useSettingsStore.getState();
                const saleId = `SAL-${Date.now()}`;
                const receiptNumber = `R-${new Date().getFullYear()}-${String(get().sales.length + 1).padStart(6, '0')}`;

                const sale: Sale = {
                    ...saleData,
                    businessUnit: settings.businessUnit as 'FUEL' | 'LUBE' | 'CNG',
                    saleId,
                    receiptNumber,
                };

                set(state => ({ sales: [sale, ...state.sales] }));
                
                const sid = getStationId();
                if (sid) fsSet(sid, COLLECTIONS.SALES, saleId, sale);
                
                return sale;
            },

            voidSale: (saleId, reason, voidedBy) => {
                set(state => {
                    const updatedSales = state.sales.map(sale =>
                        sale.saleId === saleId
                            ? { ...sale, status: 'VOIDED' as const, voidReason: reason, voidedBy }
                            : sale
                    );
                    
                    const sid = getStationId();
                    const updatedSale = updatedSales.find(s => s.saleId === saleId);
                    if (sid && updatedSale) {
                        fsSet(sid, COLLECTIONS.SALES, saleId, updatedSale);
                    }
                    
                    return { sales: updatedSales };
                });
            },

            getSalesForShift: shiftId => {
                return get().sales.filter(s => s.shiftId === shiftId);
            },

            getTodaySales: () => {
                const today = new Date().toISOString().split('T')[0];
                const { settings } = useSettingsStore.getState();
                return get().sales.filter(
                    s => s.timestamp.startsWith(today) && s.businessUnit === settings.businessUnit
                );
            },
        }),
        {
            name: 'motorway-sales',
            partialize: state => ({ sales: state.sales }),
        }
    )
);
