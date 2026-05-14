import fs from 'fs';

const path = 'e:/newfuelstation4/src/stores/productStore.ts';
let content = fs.readFileSync(path, 'utf8');

// Update deleteProduct
const deleteRegex = /deleteProduct: productId => \{[\s\S]*?set\(state => \(\{[\s\S]*?products: state\.products\.filter\(p => p\.productId !== productId\),[\s\S]*?\}\)\);/g;
const deleteReplacement = `deleteProduct: productId => {
                const product = get().products.find(p => p.productId === productId);
                if (product && product.currentStock > 0) {
                    useAntiFraudStore.getState().generateFraudAlert(
                        'FR-08',
                        'WARNING',
                        \`Attempted to delete product \${product.name} while it still has \${product.currentStock} in stock. Deletion blocked.\`,
                        product.currentStock,
                        getStationId() || 'UNKNOWN',
                        product.currentStock,
                        0
                    );
                    return; // Block deletion
                }

                set(state => ({
                    products: state.products.filter(p => p.productId !== productId),
                }));`;

content = content.replace(deleteRegex, deleteReplacement);

// Update adjustStock
const adjustRegex = /adjustStock: \(productId, adjustment\) => \{[\s\S]*?set\(state => \{[\s\S]*?const updatedProducts = state\.products\.map\(p =>[\s\S]*?p\.productId === productId[\s\S]*?\? \{ \.\.\.p, currentStock: Math\.max\(0, p\.currentStock \+ adjustment\) \}[\s\S]*?: p[\s\S]*?\);/g;
const adjustReplacement = `adjustStock: (productId, adjustment) => {
                const productBefore = get().products.find(p => p.productId === productId);
                
                if (adjustment < 0 && productBefore) {
                    useAntiFraudStore.getState().generateFraudAlert(
                        'FR-05',
                        'WARNING',
                        \`Manual stock reduction for \${productBefore.name}. Quantity: \${Math.abs(adjustment)} units. New Level: \${productBefore.currentStock + adjustment}\`,
                        Math.abs(adjustment),
                        getStationId() || 'UNKNOWN',
                        productBefore.currentStock,
                        productBefore.currentStock + adjustment
                    );
                }

                set(state => {
                    const updatedProducts = state.products.map(p =>
                        p.productId === productId
                            ? { ...p, currentStock: Math.max(0, p.currentStock + adjustment) }
                            : p
                    );`;

content = content.replace(adjustRegex, adjustReplacement);

fs.writeFileSync(path, content);
console.log('Successfully updated productStore.ts');
