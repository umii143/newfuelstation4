import { ReportDefinition } from './ReportRegistry';

export const LUBE_REPORTS: ReportDefinition[] = [
    {
        id: 'lube_dead_stock_matrix',
        title: 'Dead Stock Matrix',
        description: 'Identifies products with zero movement over the last 90 days to free up capital.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_dead_stock_matrix',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_fast_moving_index',
        title: 'Fast-Moving SKUs Index',
        description: 'Tracks top 20% products generating 80% of revenue (Pareto Principle).',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_fast_moving_index',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_slow_moving_alert',
        title: 'Slow-Moving Stock Alerts',
        description: 'Flags items that fall below 1 sale per month.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_slow_moving_alert',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_stock_out_frequency',
        title: 'Stock-Out Frequency',
        description: 'Calculates how often highly demanded items hit zero inventory.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_stock_out_frequency',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_shrinkage_audit',
        title: 'Physical Shrinkage Audit',
        description: 'Matches physical bin counts with system ledger to find stolen or lost items.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_shrinkage_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_expiring_stock',
        title: 'Expiring Stock Log',
        description: 'Tracks shelf-life of specialized coolants and biodegradable oils.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_expiring_stock',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_brand_yield',
        title: 'Brand Profitability Yield',
        description: 'Compares net margin earned from ZIC vs Havoline vs Shell.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_brand_yield',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_inventory_turnover',
        title: 'Inventory Turnover Ratio',
        description: 'Calculates how many times the total stock was sold and replaced in a year.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_inventory_turnover',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_safety_stock_breach',
        title: 'Safety Stock Breach Log',
        description: 'Alerts when crucial items drop below their defined minimum threshold.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_safety_stock_breach',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_bulk_oil_variance',
        title: 'Bulk Oil Drum Variance',
        description: 'Tracks decanting loss from 208L drums to 3L/4L retail dispensers.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_bulk_oil_variance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_filter_cross_ref',
        title: 'Oil Filter Cross-Reference Log',
        description: 'Analyzes stock of generic filters (e.g., Guard) vs OEM filters (Toyota/Honda).',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_filter_cross_ref',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_packaging_damage',
        title: 'Damaged Packaging Write-off',
        description: 'Logs items written off due to leaking bottles or ruined labels.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_packaging_damage',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_reorder_point_accuracy',
        title: 'Reorder Point Accuracy',
        description: 'Evaluates if the automatic reorder triggers are set too high or low.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_reorder_point_accuracy',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_stock_value_aging',
        title: 'Stock Value Aging',
        description: 'Monetizes the exact capital trapped in inventory older than 6 months.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_stock_value_aging',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_promo_stock_depletion',
        title: 'Promotional Stock Depletion',
        description: 'Tracks specialized stock arriving with company promotional bundles.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_promo_stock_depletion',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_consignment_stock',
        title: 'Consignment Stock Audit',
        description: 'Tracks inventory placed by suppliers that is only paid upon sale.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_consignment_stock',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_bin_location_accuracy',
        title: 'Bin Location Accuracy',
        description: 'Audits if items are placed in their assigned warehouse racks.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_bin_location_accuracy',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_return_to_vendor',
        title: 'Return To Vendor (RTV) Log',
        description: 'Tracks defective stock successfully returned to suppliers for credit.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_return_to_vendor',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_warranty_claims',
        title: 'Battery Warranty Claims',
        description: 'Specifically tracks defective batteries returned under warranty.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_warranty_claims',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_seasonal_stock',
        title: 'Seasonal Anti-Freeze Index',
        description: 'Tracks winter specific coolants or summer specific high-viscosity oils.',
        module: 'LUBE',
        category: 'LUBE_INVENTORY',
        dataSource: 'lube_seasonal_stock',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_bay_utilization',
        title: 'Service Bay Utilization Rate',
        description: 'Percentage of time service bays are occupied vs idle.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_bay_utilization',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_mechanic_commission',
        title: 'Mechanic Commission Yield',
        description: 'Calculates exact performance commission owed to each mechanic based on labor tasks.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_mechanic_commission',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_avg_service_time',
        title: 'Average Oil Change Turnaround',
        description: 'Tracks minutes taken per vehicle from entry to exit.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_avg_service_time',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_upsell_conversion',
        title: 'Filter/Additive Upsell Conversion',
        description: 'Tracks how often mechanics successfully sell engine flush or additives.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_upsell_conversion',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_customer_retention',
        title: 'Service Customer Retention',
        description: 'Measures the percentage of vehicles returning for their next 5,000km service.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_customer_retention',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_bay_revenue_per_hour',
        title: 'Revenue Per Bay Hour',
        description: 'Financial yield per service bay per hour.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_bay_revenue_per_hour',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_mechanic_error_log',
        title: 'Mechanic Rework & Error Log',
        description: 'Tracks instances where customers returned due to leaks or faulty service.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_mechanic_error_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_peak_service_hours',
        title: 'Peak Service Congestion',
        description: 'Identifies the busiest hours for lube changes to optimize staff scheduling.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_peak_service_hours',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_service_ticket_value',
        title: 'Average Service Ticket Value',
        description: 'Mean revenue generated per individual vehicle service.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_service_ticket_value',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_labor_vs_parts',
        title: 'Labor vs Parts Revenue Ratio',
        description: 'Breaks down total revenue into pure labor charges vs physical parts sold.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_labor_vs_parts',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_supplier_price_variance',
        title: 'Supplier Price Variance',
        description: 'Tracks hidden wholesale price hikes from major oil companies.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_supplier_price_variance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_supplier_lead_time',
        title: 'Purchase Order Lead Time',
        description: 'Measures days taken from PO issuance to physical delivery.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_supplier_lead_time',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_supplier_fill_rate',
        title: 'Supplier Order Fill Rate',
        description: 'Percentage of requested items actually delivered vs out-of-stock at vendor.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_supplier_fill_rate',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_bulk_discount_yield',
        title: 'Volume Rebate & Discount Yield',
        description: 'Calculates extra margin earned by hitting supplier volume targets.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_bulk_discount_yield',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_accounts_payable_aging',
        title: 'Supplier Payable Aging',
        description: 'Tracks overdue payments to suppliers (30, 60, 90 days).',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_accounts_payable_aging',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_payment_discount_loss',
        title: 'Lost Early-Payment Discounts',
        description: 'Calculates money lost by not paying suppliers within the 10-day 2% discount window.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_payment_discount_loss',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_vendor_return_rate',
        title: 'Vendor Defect Return Rate',
        description: 'Tracks percentage of inventory received defective from a specific supplier.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_vendor_return_rate',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_freight_cost_impact',
        title: 'Inbound Freight Cost Impact',
        description: 'Measures the logistics cost added to the base wholesale price.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_freight_cost_impact',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_supplier_dependency',
        title: 'Supplier Dependency Matrix',
        description: 'Analyzes risk if a single major supplier (e.g. PSO/Shell) stops delivery.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_supplier_dependency',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_minimum_order_penalty',
        title: 'Minimum Order Quantity Penalty',
        description: 'Calculates forced inventory buildup due to vendor MOQ requirements.',
        module: 'LUBE',
        category: 'LUBE_SUPPLIER',
        dataSource: 'lube_minimum_order_penalty',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_fleet_consumption',
        title: 'Corporate Fleet Consumption',
        description: 'Detailed lube usage by commercial transport companies.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_fleet_consumption',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_overdue_receivables',
        title: 'Fleet Receivables Aging',
        description: 'Identifies corporate accounts with overdue payments (30, 60, 90 days).',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_overdue_receivables',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_credit_limit_breach',
        title: 'Customer Credit Limit Breach',
        description: 'Alerts when a fleet exceeds its authorized credit cap.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_credit_limit_breach',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_customer_lifetime_value',
        title: 'Customer Lifetime Value (CLV)',
        description: 'Calculates total historical profit generated by a single customer.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_customer_lifetime_value',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_churn_prediction',
        title: 'Fleet Churn Prediction',
        description: 'Identifies customers whose purchasing frequency has dropped by 50%.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_churn_prediction',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_top_tier_customers',
        title: 'Top 10% Customer Index',
        description: 'Identifies the most valuable clients requiring VIP retention efforts.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_top_tier_customers',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_discount_utilization',
        title: 'Customer Discount Utilization',
        description: 'Measures margin lost to special corporate pricing structures.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_discount_utilization',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_dispute_resolution',
        title: 'Invoice Dispute Log',
        description: 'Tracks commercial invoices contested by the customer.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_dispute_resolution',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_b2b_contract_expiry',
        title: 'B2B Contract Expiry Alerts',
        description: 'Tracks when fixed-rate commercial lube supply contracts expire.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_b2b_contract_expiry',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_statement_delivery',
        title: 'Statement of Account Delivery',
        description: 'Logs exact timestamp when monthly statements were emailed to fleets.',
        module: 'LUBE',
        category: 'LUBE_CUSTOMER',
        dataSource: 'lube_statement_delivery',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_daily_pnl',
        title: 'Daily Profit & Loss (Lube)',
        description: 'Comprehensive daily closure showing gross sales, COGS, opex, and net profit.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_daily_pnl',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_gross_margin_category',
        title: 'Gross Margin by Category',
        description: 'Compares margins between Engine Oils, Filters, Batteries, and Accessories.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_gross_margin_category',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_cash_reconciliation',
        title: 'Daily Cash & POS Reconciliation',
        description: 'Matches POS receipts with physical drawer cash.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_cash_reconciliation',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_credit_card_fees',
        title: 'Digital Payment Fee Impact',
        description: 'Calculates margin lost to Visa/Mastercard processing fees.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_credit_card_fees',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_discount_expense',
        title: 'Total Discount Expense Ledger',
        description: 'Aggregates all ad-hoc retail discounts given by managers.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_discount_expense',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_petty_cash_burn',
        title: 'Service Center Petty Cash Burn',
        description: 'Tracks small daily expenses (cleaning supplies, rags, tea).',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_petty_cash_burn',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_tax_liability',
        title: 'Sales Tax (GST) Liability',
        description: 'Calculates exact output tax owed to the government.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_tax_liability',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_utility_allocation',
        title: 'Utility Cost Allocation',
        description: 'Portion of the main station electricity bill assigned to the Lube center.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_utility_allocation',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_asset_depreciation',
        title: 'Service Asset Depreciation',
        description: 'Tracks value loss on hydraulic lifts, pneumatic tools, and diagnostic scanners.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_asset_depreciation',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_net_cash_flow',
        title: 'Weekly Net Cash Flow',
        description: 'Actual cash in hand vs cash trapped in inventory or receivables.',
        module: 'LUBE',
        category: 'LUBE_FINANCIAL',
        dataSource: 'lube_net_cash_flow',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_void_transaction_log',
        title: 'Voided POS Transactions',
        description: 'Forensic log of bills cancelled after being punched.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_void_transaction_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_price_override_log',
        title: 'Retail Price Overrides',
        description: 'Tracks instances where a cashier manually altered a selling price.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_price_override_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_inventory_adjustment',
        title: 'Manual Inventory Adjustments',
        description: 'Audits who artificially added/removed stock without a Purchase Order.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_inventory_adjustment',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_after_hours_sales',
        title: 'After-Hours Sales Activity',
        description: 'Flags transactions occurring outside normal operational hours.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_after_hours_sales',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_system_login_failures',
        title: 'POS Login Failure Matrix',
        description: 'Security log tracking unauthorized access attempts to the Lube POS.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_system_login_failures',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_cash_drawer_opens',
        title: 'No-Sale Drawer Opens',
        description: 'Tracks how many times the cash drawer was opened without a transaction.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_cash_drawer_opens',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_backdated_invoices',
        title: 'Backdated Invoice Audit',
        description: 'Flags any sales invoice punched with a past date.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_backdated_invoices',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_deleted_pos_items',
        title: 'Line-Item Deletion Trace',
        description: 'Tracks items scanned and then deleted from the cart before payment.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_deleted_pos_items',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_discount_abuse',
        title: 'Employee Discount Abuse',
        description: 'Monitors if staff are excessively using their employee discount code.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_discount_abuse',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_database_backup_status',
        title: 'Local POS Backup Status',
        description: 'Ensures the offline POS database is successfully syncing to the cloud.',
        module: 'LUBE',
        category: 'LUBE_AUDIT',
        dataSource: 'lube_database_backup_status',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_hydraulic_lift_health',
        title: 'Hydraulic Lift Maintenance Log',
        description: 'Tracks statutory safety inspections and oil checks for 2-post lifts.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_hydraulic_lift_health',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_air_compressor_audit',
        title: 'Pneumatic Air Compressor Health',
        description: 'Logs run hours and moisture draining for the pneumatic tool compressor.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_air_compressor_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_waste_oil_disposal',
        title: 'Waste Oil Disposal Ledger',
        description: 'Environmental compliance log tracking sold/disposed used engine oil.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_waste_oil_disposal',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_tool_inventory',
        title: 'Specialized Tool Inventory',
        description: 'Tracks expensive mechanic tools (torque wrenches, OBD2 scanners) to prevent theft.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_tool_inventory',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_spill_kit_deployment',
        title: 'Hazardous Spill Kit Deployments',
        description: 'Logs instances of major oil spills and sand/chemical usage.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_spill_kit_deployment',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_hvac_efficiency',
        title: 'Customer Lounge HVAC Efficiency',
        description: 'Tracks maintenance of AC units in the lube waiting area.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_hvac_efficiency',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_cctv_uptime',
        title: 'Service Bay CCTV Uptime',
        description: 'Security audit ensuring all bay cameras are recording.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_cctv_uptime',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_fire_safety_audit',
        title: 'Service Center Fire Safety',
        description: 'Tracks foam/powder extinguisher health in the highly flammable lube area.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_fire_safety_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_oil_drainer_capacity',
        title: 'Pneumatic Oil Drainer Capacity',
        description: 'Tracks fill levels of mobile oil drainers before they need to be emptied.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_oil_drainer_capacity',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_uniform_laundry_cost',
        title: 'Mechanic Uniform Laundry Cost',
        description: 'Tracks operational expense of industrial laundering for mechanic overalls.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_uniform_laundry_cost',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'text' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },
    {
        id: 'lube_sales_per_employee',
        title: 'Revenue Per Employee',
        description: 'Divides total Lube center revenue by the number of active staff.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_sales_per_employee',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_weekend_volume_surge',
        title: 'Weekend Sales Surge',
        description: 'Compares Saturday/Sunday lube volume against weekday baselines.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_weekend_volume_surge',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_holiday_campaign_yield',
        title: 'Eid/Holiday Promo Yield',
        description: 'Measures extra revenue generated during pre-holiday oil change rushes.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_holiday_campaign_yield',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_synthetic_conversion',
        title: 'Synthetic Oil Conversion Rate',
        description: 'Tracks success in upgrading customers from mineral to fully synthetic oils.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_synthetic_conversion',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_accessory_attachment',
        title: 'Accessory Attachment Rate',
        description: 'Measures how often a car wash or air freshener is sold with an oil change.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_accessory_attachment',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_customer_wait_time',
        title: 'Lounge Wait Time Analysis',
        description: 'Tracks time elapsed while customer waits in the lounge.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_customer_wait_time',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_first_time_customers',
        title: 'New Customer Acquisition',
        description: 'Tracks volume of entirely new vehicles visiting the service center.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_first_time_customers',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_lost_sales_tracker',
        title: 'Lost Sales (Out of Stock)',
        description: 'Monetizes sales lost because a specific oil or filter was unavailable.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_lost_sales_tracker',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_mechanic_efficiency_ratio',
        title: 'Mechanic Efficiency Ratio',
        description: 'Compares billed labor hours against actual physical hours worked.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_mechanic_efficiency_ratio',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_online_booking_conversion',
        title: 'Online App Booking Conversion',
        description: 'Tracks how many customers book their lube slot via the mobile app.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_online_booking_conversion',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_shift_handover_friction',
        title: 'Shift Handover Friction',
        description: 'Time taken to reconcile tools and cash between morning/evening shifts.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_shift_handover_friction',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_cash_shortage_history',
        title: 'Cashier Shortage Matrix',
        description: 'Lifetime tracking of lube cashiers who frequently close short.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_cash_shortage_history',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_night_shift_profitability',
        title: 'Night Shift Profitability',
        description: 'Analyzes if running the lube center 24/7 is financially viable.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_night_shift_profitability',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_bay_cleaning_audit',
        title: 'Bay Cleaning & Hygiene Audit',
        description: 'Tracks compliance with end-of-shift floor degreasing protocols.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_bay_cleaning_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_customer_complaint_log',
        title: 'Customer Complaint Ledger',
        description: 'Logs all formal grievances regarding lube service quality.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_customer_complaint_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_damage_claim_log',
        title: 'Vehicle Damage Claims',
        description: 'Tracks instances where the station had to pay for a scratched or damaged vehicle.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_damage_claim_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_staff_attendance_lube',
        title: 'Staff Absenteeism (Lube)',
        description: 'HR metric tracking lube center staff punctuality.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_staff_attendance_lube',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_overtime_expense',
        title: 'Mechanic Overtime Expense',
        description: 'Tracks extra wages paid during extreme rush hours.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_overtime_expense',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_training_compliance',
        title: 'Technical Training Compliance',
        description: 'Tracks mechanics completing certification modules (e.g. Havoline Pro).',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_training_compliance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
    {
        id: 'lube_electricity_outage_impact',
        title: 'Power Outage Sales Impact',
        description: 'Estimates lube sales lost during generator transition delays.',
        module: 'LUBE',
        category: 'LUBE_OPERATIONS',
        dataSource: 'lube_electricity_outage_impact',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'text' },
            { key: 'user', label: 'Assigned User', type: 'text' }
        ]
    },
];
