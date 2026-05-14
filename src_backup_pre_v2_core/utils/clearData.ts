// Utility to clear all app data from localStorage
export const clearAllAppData = () => {
    const appPrefixes = [
        'auth-',
        'motorway-auth',
        'motorway-settings',
        'products-storage',
        'sales-storage',
        'ledger-',
        'fuel-',
        'cng-',
        'lube-',
        'discount-',
        'shifts-',
        'expenses-',
        'customers-',
        'suppliers-',
        'closing-',
        'recoveries-',
        'credits-',
        'audit-',
        'staff-',
        'accounting-',
        'profit-',
        'rate-impact-',
    ];

    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);

    // Filter and remove app-related keys
    const keysToRemove = allKeys.filter(key => appPrefixes.some(prefix => key.includes(prefix)));

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });

    return keysToRemove.length;
};

// Export for use in components
export default clearAllAppData;
