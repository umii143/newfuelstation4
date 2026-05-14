$path = "e:\newfuelstation4\src\stores\productStore.ts"
$content = Get-Content $path -Raw

# Replace deleteProduct
$oldDelete = '            deleteProduct: productId => {
                set(state => ({
                    products: state.products.filter(p => p.productId !== productId),
                }));
                
                const sid = getStationId();
                if (sid) {
                    import(''@/services/firestoreService'').then(({ fsDelete }) => {
                        fsDelete(sid, COLLECTIONS.PRODUCTS, productId);
                    });
                    auditLogger.log(''LUBE'', ''PRODUCT_DELETE'', `Product #${productId} removed from inventory.`, productId);
                }
            },'

$newDelete = '            deleteProduct: productId => {
                const product = get().products.find(p => p.productId === productId);
                if (product && product.currentStock > 0) {
                    useAntiFraudStore.getState().generateFraudAlert(
                        ''FR-08'',
                        ''WARNING'',
                        `Attempted to delete product ${product.name} while it still has ${product.currentStock} in stock. Deletion blocked.`,
                        product.currentStock,
                        getStationId() || ''UNKNOWN'',
                        product.currentStock,
                        0
                    );
                    return; // Block deletion
                }

                set(state => ({
                    products: state.products.filter(p => p.productId !== productId),
                }));
                
                const sid = getStationId();
                if (sid) {
                    import(''@/services/firestoreService'').then(({ fsDelete }) => {
                        fsDelete(sid, COLLECTIONS.PRODUCTS, productId);
                    });
                    auditLogger.log(''LUBE'', ''PRODUCT_DELETE'', `Product #${productId} removed from inventory.`, productId);
                }
            },'

# Replace adjustStock
$oldAdjust = '            adjustStock: (productId, adjustment) => {
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
                        auditLogger.log(''LUBE'', ''STOCK_ADJUSTMENT'', `Stock adjusted for ${updatedProduct.name}: ${adjustment > 0 ? ''+'' : ''''}${adjustment}. New Level: ${updatedProduct.currentStock}`, productId);
                    }
                    
                    return { products: updatedProducts };
                });
            },'

$newAdjust = '            adjustStock: (productId, adjustment) => {
                const productBefore = get().products.find(p => p.productId === productId);
                
                if (adjustment < 0 && productBefore) {
                    useAntiFraudStore.getState().generateFraudAlert(
                        ''FR-05'',
                        ''WARNING'',
                        `Manual stock reduction for ${productBefore.name}. Quantity: ${Math.abs(adjustment)} units. New Level: ${productBefore.currentStock + adjustment}`,
                        Math.abs(adjustment),
                        getStationId() || ''UNKNOWN'',
                        productBefore.currentStock,
                        productBefore.currentStock + adjustment
                    );
                }

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
                        auditLogger.log(''LUBE'', ''STOCK_ADJUSTMENT'', `Stock adjusted for ${updatedProduct.name}: ${adjustment > 0 ? ''+'' : ''''}${adjustment}. New Level: ${updatedProduct.currentStock}`, productId);
                    }
                    
                    return { products: updatedProducts };
                });
            },'

# Very careful string replacement
$content = $content.Replace($oldDelete, $newDelete)
$content = $content.Replace($oldAdjust, $newAdjust)

$content | Set-Content $path -NoNewline
