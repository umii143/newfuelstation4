import { Badge, Button, Card, Input, Modal, PageHeader } from '@/components/ui';
import { useSettingsStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productStore';
import type { Product, ProductCategory } from '@/types';
import clsx from 'clsx';
import { AlertTriangle, BarChart3, Edit2, Plus, Search, Trash2, Truck } from 'lucide-react';
import React, { useState } from 'react';

// Categories are now managed via productStore

interface ProductsPageProps {
    onNavigate?: (path: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate }) => {
    const {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setCategory,
        categories,
        getFilteredProducts,
        getLowStockProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        isLoading,
        error: storeError,
    } = useProductStore();

    const { settings } = useSettingsStore();

    const [showProductModal, setShowProductModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [stockAdjustment, setStockAdjustment] = useState(0);
    const [stockReason, setStockReason] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'ENGINE_OIL' as ProductCategory,
        brand: '',
        costPrice: 0,
        salePrice: 0,
        currentStock: 0,
        reorderPoint: 10,
    });

    const formatCurrency = (value: number) => `₨${value.toLocaleString()}`;

    // Strictly filter for lube products only on the Lube Inventory page
    const filteredProducts = getFilteredProducts().filter(p => {
        return p.category !== 'FUEL_PETROL' && p.category !== 'FUEL_DIESEL';
    });

    const lowStockProducts = getLowStockProducts().filter(p => {
        return p.category !== 'FUEL_PETROL' && p.category !== 'FUEL_DIESEL';
    });

    const handleOpenProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                category: product.category,
                brand: product.brand,
                costPrice: product.costPrice,
                salePrice: product.salePrice,
                currentStock: product.currentStock,
                reorderPoint: product.reorderPoint,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: '',
                category: 'ENGINE_OIL',
                brand: '',
                costPrice: 0,
                salePrice: 0,
                currentStock: 0,
                reorderPoint: 10,
            });
        }
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        // Validation
        setLocalError(null);
        if (!formData.name.trim()) {
            setLocalError('Product name is required');
            return;
        }
        if (!formData.sku.trim()) {
            setLocalError('SKU is required');
            return;
        }
        if (formData.costPrice < 0 || formData.salePrice < 0) {
            setLocalError('Prices cannot be negative');
            return;
        }
        if (formData.salePrice <= formData.costPrice) {
            setLocalError('Sale price must be greater than cost price');
            return;
        }
        if (formData.currentStock < 0) {
            setLocalError('Stock cannot be negative');
            return;
        }

        // Check SKU uniqueness (skip if editing the same product)
        const { products } = useProductStore.getState();
        const existingProduct = products.find(p => p.sku === formData.sku);
        if (
            existingProduct &&
            (!editingProduct || existingProduct.productId !== editingProduct.productId)
        ) {
            setLocalError(
                `SKU "${formData.sku}" already exists for product "${existingProduct.name}"`
            );
            return;
        }

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.productId, formData);
            } else {
                await addProduct({
                    ...formData,
                    stationId: 'STN-001',
                    businessUnit: settings.businessUnit as 'LUBE',
                    unit: 'PIECE',
                    packSize: 1,
                    taxRate: 0.17,
                    reorderQty: 20,
                });
            }
            setShowProductModal(false);
        } catch (error: any) {
            setLocalError(error.message || 'Failed to save product');
        }
    };

    const handleOpenStockModal = (product: Product) => {
        setEditingProduct(product);
        setStockAdjustment(0);
        setStockReason('');
        setShowStockModal(true);
    };

    const handleAdjustStock = () => {
        if (editingProduct) {
            adjustStock(editingProduct.productId, stockAdjustment, stockReason);
            setShowStockModal(false);
        }
    };

    const totalValue = filteredProducts.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
    const totalVolume = filteredProducts.reduce((sum, p) => sum + p.currentStock, 0);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <PageHeader
                title="Lube Inventory"
                subtitle="Manage your lubricants, oils and other retail products"
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => onNavigate?.('/lube/orders')}>
                            <Truck size={18} />
                            View Orders
                        </Button>
                        <Button variant="primary" onClick={() => handleOpenProductModal()}>
                            <Plus size={18} />
                            Add Product
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-white/70 backdrop-blur-3xl border-2 border-slate-200/60 shadow-2xl shadow-slate-300/40 hover:shadow-3xl hover:shadow-slate-400/50 hover:scale-[1.02] transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Products</p>
                            <h3 className="text-2xl font-bold mt-1">{filteredProducts.length}</h3>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-lg shadow-sm">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 col-span-3">
                    <Card className="p-6 bg-white/70 backdrop-blur-3xl border-2 border-l-4 border-l-rose-500 border-slate-200/60 shadow-2xl shadow-rose-200/30 hover:shadow-3xl hover:shadow-rose-300/40 hover:scale-[1.02] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Low Stock</p>
                                <h3 className="text-2xl font-bold mt-1 text-rose-600">
                                    {lowStockProducts.length}
                                </h3>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 rounded-lg shadow-sm">
                                <AlertTriangle size={20} />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-white/70 backdrop-blur-3xl border-2 border-slate-200/60 shadow-2xl shadow-slate-300/40 hover:shadow-3xl hover:shadow-indigo-300/40 hover:scale-[1.02] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Stock</p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {totalVolume.toLocaleString()} pcs
                                </h3>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-lg shadow-sm">
                                <Truck size={20} />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-white/70 backdrop-blur-3xl border-2 border-slate-200/60 shadow-2xl shadow-slate-300/40 hover:shadow-3xl hover:shadow-emerald-300/40 hover:scale-[1.02] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Inventory Value
                                </p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {formatCurrency(totalValue)}
                                </h3>
                            </div>
                            <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                                <BarChart3 size={20} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search products..."
                        icon={<Search size={18} />}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white/70 backdrop-blur-3xl border-2 border-slate-200/60 shadow-lg focus:shadow-xl transition-all duration-300"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat as any)}
                            className={clsx(
                                'px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105',
                                selectedCategory === cat
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-300/50 scale-105'
                                    : 'bg-white/70 backdrop-blur-xl border-2 border-slate-200/60 text-slate-600 hover:bg-white/90 hover:shadow-lg'
                            )}
                        >
                            {cat.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <Card className="p-0 overflow-hidden shadow-2xl bg-white/70 backdrop-blur-3xl border-2 border-slate-200/60 hover:shadow-3xl transition-shadow duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-200/50">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Product
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    SKU
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Stock
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Price
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600">
                                    Margin
                                </th>
                                <th className="px-6 py-4 text-right font-bold text-slate-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                            {filteredProducts.map(product => {
                                const isLowStock = product.currentStock <= product.reorderPoint;
                                const margin =
                                    product.costPrice > 0
                                        ? (
                                              ((product.salePrice - product.costPrice) /
                                                  product.costPrice) *
                                              100
                                          ).toFixed(1)
                                        : '0.0';

                                return (
                                    <tr
                                        key={product.productId}
                                        className="hover:bg-white/40 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {product.brand}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                {product.sku}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                color={
                                                    product.category.startsWith('FUEL')
                                                        ? 'blue'
                                                        : 'amber'
                                                }
                                            >
                                                {product.category.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={clsx(
                                                        'font-bold',
                                                        isLowStock
                                                            ? 'text-rose-600'
                                                            : 'text-slate-900'
                                                    )}
                                                >
                                                    {product.currentStock} {product.unit || 'L'}
                                                </span>
                                                {isLowStock && (
                                                    <AlertTriangle
                                                        size={14}
                                                        className="text-rose-500"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <p className="text-slate-500">
                                                    Cost: {formatCurrency(product.costPrice)}
                                                </p>
                                                <p className="font-bold text-slate-900">
                                                    Sale: {formatCurrency(product.salePrice)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge color="emerald">+{margin}%</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenStockModal(product)}
                                                    className="text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
                                                >
                                                    <BarChart3 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenProductModal(product)}
                                                    className="text-amber-600 hover:text-amber-700 h-8 w-8 p-0"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteProduct(product.productId)}
                                                    className="text-rose-600 hover:text-rose-700 h-8 w-8 p-0"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Product Modal */}
            <Modal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Product Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="SKU"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Brand"
                            value={formData.brand}
                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        />
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        category: e.target.value as ProductCategory,
                                    })
                                }
                                className="w-full p-2 bg-gray-50 rounded-xl border font-bold outline-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Cost Price"
                            type="number"
                            value={formData.costPrice}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    costPrice: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                        <Input
                            label="Sale Price"
                            type="number"
                            value={formData.salePrice}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    salePrice: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Current Stock"
                            type="number"
                            value={formData.currentStock}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    currentStock: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                        <Input
                            label="Reorder Point"
                            type="number"
                            value={formData.reorderPoint}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    reorderPoint: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                    </div>

                    {(localError || storeError) && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold uppercase tracking-widest animate-shake">
                            {localError || storeError}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                                setShowProductModal(false);
                                setLocalError(null);
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleSaveProduct}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            ) : null}
                            {isLoading
                                ? 'Saving...'
                                : editingProduct
                                  ? 'Update Product'
                                  : 'Add Product'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Stock Adjustment Modal */}
            <Modal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                title="Adjust Stock"
                size="sm"
            >
                {editingProduct && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="font-bold text-gray-900">{editingProduct.name}</p>
                            <p className="text-xs text-gray-500">
                                Current Stock: {editingProduct.currentStock}L
                            </p>
                        </div>
                        <Input
                            label="Adjustment (+/- Liters)"
                            type="number"
                            value={stockAdjustment}
                            onChange={e => setStockAdjustment(parseInt(e.target.value) || 0)}
                        />
                        <Input
                            label="Reason"
                            value={stockReason}
                            onChange={e => setStockReason(e.target.value)}
                            placeholder="e.g., Tanker arrival, Damage, Count correction"
                        />
                        <div className="p-3 rounded-lg bg-blue-50">
                            <p className="text-sm text-blue-600 font-bold">
                                Projected Stock: {editingProduct.currentStock + stockAdjustment}L
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowStockModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleAdjustStock}
                            >
                                Adjust Stock
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
