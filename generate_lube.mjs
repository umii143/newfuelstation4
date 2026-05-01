import fs from 'fs';

const categories = {
    INVENTORY: [
        ['lube_dead_stock_matrix', 'Dead Stock Matrix', 'Identifies products with zero movement over the last 90 days to free up capital.'],
        ['lube_fast_moving_index', 'Fast-Moving SKUs Index', 'Tracks top 20% products generating 80% of revenue (Pareto Principle).'],
        ['lube_slow_moving_alert', 'Slow-Moving Stock Alerts', 'Flags items that fall below 1 sale per month.'],
        ['lube_stock_out_frequency', 'Stock-Out Frequency', 'Calculates how often highly demanded items hit zero inventory.'],
        ['lube_shrinkage_audit', 'Physical Shrinkage Audit', 'Matches physical bin counts with system ledger to find stolen or lost items.'],
        ['lube_expiring_stock', 'Expiring Stock Log', 'Tracks shelf-life of specialized coolants and biodegradable oils.'],
        ['lube_brand_yield', 'Brand Profitability Yield', 'Compares net margin earned from ZIC vs Havoline vs Shell.'],
        ['lube_inventory_turnover', 'Inventory Turnover Ratio', 'Calculates how many times the total stock was sold and replaced in a year.'],
        ['lube_safety_stock_breach', 'Safety Stock Breach Log', 'Alerts when crucial items drop below their defined minimum threshold.'],
        ['lube_bulk_oil_variance', 'Bulk Oil Drum Variance', 'Tracks decanting loss from 208L drums to 3L/4L retail dispensers.'],
        ['lube_filter_cross_ref', 'Oil Filter Cross-Reference Log', 'Analyzes stock of generic filters (e.g., Guard) vs OEM filters (Toyota/Honda).'],
        ['lube_packaging_damage', 'Damaged Packaging Write-off', 'Logs items written off due to leaking bottles or ruined labels.'],
        ['lube_reorder_point_accuracy', 'Reorder Point Accuracy', 'Evaluates if the automatic reorder triggers are set too high or low.'],
        ['lube_stock_value_aging', 'Stock Value Aging', 'Monetizes the exact capital trapped in inventory older than 6 months.'],
        ['lube_promo_stock_depletion', 'Promotional Stock Depletion', 'Tracks specialized stock arriving with company promotional bundles.'],
        ['lube_consignment_stock', 'Consignment Stock Audit', 'Tracks inventory placed by suppliers that is only paid upon sale.'],
        ['lube_bin_location_accuracy', 'Bin Location Accuracy', 'Audits if items are placed in their assigned warehouse racks.'],
        ['lube_return_to_vendor', 'Return To Vendor (RTV) Log', 'Tracks defective stock successfully returned to suppliers for credit.'],
        ['lube_warranty_claims', 'Battery Warranty Claims', 'Specifically tracks defective batteries returned under warranty.'],
        ['lube_seasonal_stock', 'Seasonal Anti-Freeze Index', 'Tracks winter specific coolants or summer specific high-viscosity oils.']
    ],
    PERFORMANCE: [
        ['lube_bay_utilization', 'Service Bay Utilization Rate', 'Percentage of time service bays are occupied vs idle.'],
        ['lube_mechanic_commission', 'Mechanic Commission Yield', 'Calculates exact performance commission owed to each mechanic based on labor tasks.'],
        ['lube_avg_service_time', 'Average Oil Change Turnaround', 'Tracks minutes taken per vehicle from entry to exit.'],
        ['lube_upsell_conversion', 'Filter/Additive Upsell Conversion', 'Tracks how often mechanics successfully sell engine flush or additives.'],
        ['lube_customer_retention', 'Service Customer Retention', 'Measures the percentage of vehicles returning for their next 5,000km service.'],
        ['lube_bay_revenue_per_hour', 'Revenue Per Bay Hour', 'Financial yield per service bay per hour.'],
        ['lube_mechanic_error_log', 'Mechanic Rework & Error Log', 'Tracks instances where customers returned due to leaks or faulty service.'],
        ['lube_peak_service_hours', 'Peak Service Congestion', 'Identifies the busiest hours for lube changes to optimize staff scheduling.'],
        ['lube_service_ticket_value', 'Average Service Ticket Value', 'Mean revenue generated per individual vehicle service.'],
        ['lube_labor_vs_parts', 'Labor vs Parts Revenue Ratio', 'Breaks down total revenue into pure labor charges vs physical parts sold.']
    ],
    SUPPLIER: [
        ['lube_supplier_price_variance', 'Supplier Price Variance', 'Tracks hidden wholesale price hikes from major oil companies.'],
        ['lube_supplier_lead_time', 'Purchase Order Lead Time', 'Measures days taken from PO issuance to physical delivery.'],
        ['lube_supplier_fill_rate', 'Supplier Order Fill Rate', 'Percentage of requested items actually delivered vs out-of-stock at vendor.'],
        ['lube_bulk_discount_yield', 'Volume Rebate & Discount Yield', 'Calculates extra margin earned by hitting supplier volume targets.'],
        ['lube_accounts_payable_aging', 'Supplier Payable Aging', 'Tracks overdue payments to suppliers (30, 60, 90 days).'],
        ['lube_payment_discount_loss', 'Lost Early-Payment Discounts', 'Calculates money lost by not paying suppliers within the 10-day 2% discount window.'],
        ['lube_vendor_return_rate', 'Vendor Defect Return Rate', 'Tracks percentage of inventory received defective from a specific supplier.'],
        ['lube_freight_cost_impact', 'Inbound Freight Cost Impact', 'Measures the logistics cost added to the base wholesale price.'],
        ['lube_supplier_dependency', 'Supplier Dependency Matrix', 'Analyzes risk if a single major supplier (e.g. PSO/Shell) stops delivery.'],
        ['lube_minimum_order_penalty', 'Minimum Order Quantity Penalty', 'Calculates forced inventory buildup due to vendor MOQ requirements.']
    ],
    CUSTOMER: [
        ['lube_fleet_consumption', 'Corporate Fleet Consumption', 'Detailed lube usage by commercial transport companies.'],
        ['lube_overdue_receivables', 'Fleet Receivables Aging', 'Identifies corporate accounts with overdue payments (30, 60, 90 days).'],
        ['lube_credit_limit_breach', 'Customer Credit Limit Breach', 'Alerts when a fleet exceeds its authorized credit cap.'],
        ['lube_customer_lifetime_value', 'Customer Lifetime Value (CLV)', 'Calculates total historical profit generated by a single customer.'],
        ['lube_churn_prediction', 'Fleet Churn Prediction', 'Identifies customers whose purchasing frequency has dropped by 50%.'],
        ['lube_top_tier_customers', 'Top 10% Customer Index', 'Identifies the most valuable clients requiring VIP retention efforts.'],
        ['lube_discount_utilization', 'Customer Discount Utilization', 'Measures margin lost to special corporate pricing structures.'],
        ['lube_dispute_resolution', 'Invoice Dispute Log', 'Tracks commercial invoices contested by the customer.'],
        ['lube_b2b_contract_expiry', 'B2B Contract Expiry Alerts', 'Tracks when fixed-rate commercial lube supply contracts expire.'],
        ['lube_statement_delivery', 'Statement of Account Delivery', 'Logs exact timestamp when monthly statements were emailed to fleets.']
    ],
    FINANCIAL: [
        ['lube_daily_pnl', 'Daily Profit & Loss (Lube)', 'Comprehensive daily closure showing gross sales, COGS, opex, and net profit.'],
        ['lube_gross_margin_category', 'Gross Margin by Category', 'Compares margins between Engine Oils, Filters, Batteries, and Accessories.'],
        ['lube_cash_reconciliation', 'Daily Cash & POS Reconciliation', 'Matches POS receipts with physical drawer cash.'],
        ['lube_credit_card_fees', 'Digital Payment Fee Impact', 'Calculates margin lost to Visa/Mastercard processing fees.'],
        ['lube_discount_expense', 'Total Discount Expense Ledger', 'Aggregates all ad-hoc retail discounts given by managers.'],
        ['lube_petty_cash_burn', 'Service Center Petty Cash Burn', 'Tracks small daily expenses (cleaning supplies, rags, tea).'],
        ['lube_tax_liability', 'Sales Tax (GST) Liability', 'Calculates exact output tax owed to the government.'],
        ['lube_utility_allocation', 'Utility Cost Allocation', 'Portion of the main station electricity bill assigned to the Lube center.'],
        ['lube_asset_depreciation', 'Service Asset Depreciation', 'Tracks value loss on hydraulic lifts, pneumatic tools, and diagnostic scanners.'],
        ['lube_net_cash_flow', 'Weekly Net Cash Flow', 'Actual cash in hand vs cash trapped in inventory or receivables.']
    ],
    AUDIT: [
        ['lube_void_transaction_log', 'Voided POS Transactions', 'Forensic log of bills cancelled after being punched.'],
        ['lube_price_override_log', 'Retail Price Overrides', 'Tracks instances where a cashier manually altered a selling price.'],
        ['lube_inventory_adjustment', 'Manual Inventory Adjustments', 'Audits who artificially added/removed stock without a Purchase Order.'],
        ['lube_after_hours_sales', 'After-Hours Sales Activity', 'Flags transactions occurring outside normal operational hours.'],
        ['lube_system_login_failures', 'POS Login Failure Matrix', 'Security log tracking unauthorized access attempts to the Lube POS.'],
        ['lube_cash_drawer_opens', 'No-Sale Drawer Opens', 'Tracks how many times the cash drawer was opened without a transaction.'],
        ['lube_backdated_invoices', 'Backdated Invoice Audit', 'Flags any sales invoice punched with a past date.'],
        ['lube_deleted_pos_items', 'Line-Item Deletion Trace', 'Tracks items scanned and then deleted from the cart before payment.'],
        ['lube_discount_abuse', 'Employee Discount Abuse', 'Monitors if staff are excessively using their employee discount code.'],
        ['lube_database_backup_status', 'Local POS Backup Status', 'Ensures the offline POS database is successfully syncing to the cloud.']
    ],
    MAINTENANCE: [
        ['lube_hydraulic_lift_health', 'Hydraulic Lift Maintenance Log', 'Tracks statutory safety inspections and oil checks for 2-post lifts.'],
        ['lube_air_compressor_audit', 'Pneumatic Air Compressor Health', 'Logs run hours and moisture draining for the pneumatic tool compressor.'],
        ['lube_waste_oil_disposal', 'Waste Oil Disposal Ledger', 'Environmental compliance log tracking sold/disposed used engine oil.'],
        ['lube_tool_inventory', 'Specialized Tool Inventory', 'Tracks expensive mechanic tools (torque wrenches, OBD2 scanners) to prevent theft.'],
        ['lube_spill_kit_deployment', 'Hazardous Spill Kit Deployments', 'Logs instances of major oil spills and sand/chemical usage.'],
        ['lube_hvac_efficiency', 'Customer Lounge HVAC Efficiency', 'Tracks maintenance of AC units in the lube waiting area.'],
        ['lube_cctv_uptime', 'Service Bay CCTV Uptime', 'Security audit ensuring all bay cameras are recording.'],
        ['lube_fire_safety_audit', 'Service Center Fire Safety', 'Tracks foam/powder extinguisher health in the highly flammable lube area.'],
        ['lube_oil_drainer_capacity', 'Pneumatic Oil Drainer Capacity', 'Tracks fill levels of mobile oil drainers before they need to be emptied.'],
        ['lube_uniform_laundry_cost', 'Mechanic Uniform Laundry Cost', 'Tracks operational expense of industrial laundering for mechanic overalls.']
    ]
};

// Total above is 20+10+10+10+10+10+10 = 80 reports.
// Add 20 more to hit 100 exactly.
const additional = [
    // 10 more Performance
    ['lube_sales_per_employee', 'Revenue Per Employee', 'Divides total Lube center revenue by the number of active staff.', 'PERFORMANCE'],
    ['lube_weekend_volume_surge', 'Weekend Sales Surge', 'Compares Saturday/Sunday lube volume against weekday baselines.', 'PERFORMANCE'],
    ['lube_holiday_campaign_yield', 'Eid/Holiday Promo Yield', 'Measures extra revenue generated during pre-holiday oil change rushes.', 'PERFORMANCE'],
    ['lube_synthetic_conversion', 'Synthetic Oil Conversion Rate', 'Tracks success in upgrading customers from mineral to fully synthetic oils.', 'PERFORMANCE'],
    ['lube_accessory_attachment', 'Accessory Attachment Rate', 'Measures how often a car wash or air freshener is sold with an oil change.', 'PERFORMANCE'],
    ['lube_customer_wait_time', 'Lounge Wait Time Analysis', 'Tracks time elapsed while customer waits in the lounge.', 'PERFORMANCE'],
    ['lube_first_time_customers', 'New Customer Acquisition', 'Tracks volume of entirely new vehicles visiting the service center.', 'PERFORMANCE'],
    ['lube_lost_sales_tracker', 'Lost Sales (Out of Stock)', 'Monetizes sales lost because a specific oil or filter was unavailable.', 'PERFORMANCE'],
    ['lube_mechanic_efficiency_ratio', 'Mechanic Efficiency Ratio', 'Compares billed labor hours against actual physical hours worked.', 'PERFORMANCE'],
    ['lube_online_booking_conversion', 'Online App Booking Conversion', 'Tracks how many customers book their lube slot via the mobile app.', 'PERFORMANCE'],

    // 10 more Operations/Shift
    ['lube_shift_handover_friction', 'Shift Handover Friction', 'Time taken to reconcile tools and cash between morning/evening shifts.', 'SHIFT'],
    ['lube_cash_shortage_history', 'Cashier Shortage Matrix', 'Lifetime tracking of lube cashiers who frequently close short.', 'SHIFT'],
    ['lube_night_shift_profitability', 'Night Shift Profitability', 'Analyzes if running the lube center 24/7 is financially viable.', 'SHIFT'],
    ['lube_bay_cleaning_audit', 'Bay Cleaning & Hygiene Audit', 'Tracks compliance with end-of-shift floor degreasing protocols.', 'SHIFT'],
    ['lube_customer_complaint_log', 'Customer Complaint Ledger', 'Logs all formal grievances regarding lube service quality.', 'SHIFT'],
    ['lube_damage_claim_log', 'Vehicle Damage Claims', 'Tracks instances where the station had to pay for a scratched or damaged vehicle.', 'SHIFT'],
    ['lube_staff_attendance_lube', 'Staff Absenteeism (Lube)', 'HR metric tracking lube center staff punctuality.', 'SHIFT'],
    ['lube_overtime_expense', 'Mechanic Overtime Expense', 'Tracks extra wages paid during extreme rush hours.', 'SHIFT'],
    ['lube_training_compliance', 'Technical Training Compliance', 'Tracks mechanics completing certification modules (e.g. Havoline Pro).', 'SHIFT'],
    ['lube_electricity_outage_impact', 'Power Outage Sales Impact', 'Estimates lube sales lost during generator transition delays.', 'SHIFT']
];

let output = `import { ReportDefinition } from '../ReportRegistry';\n\nexport const LUBE_REPORTS: ReportDefinition[] = [\n`;

Object.entries(categories).forEach(([category, reports]) => {
    reports.forEach(r => {
        output += `    {
        id: '${r[0]}',
        title: '${r[1].replace(/'/g, "\\'")}',
        description: '${r[2].replace(/'/g, "\\'")}',
        module: 'LUBE',
        category: '${category}',
        dataSource: '${r[0]}',
        accessLevel: 'MANAGER',
        visualization: 'TABLE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'itemCode', label: 'SKU/Identifier', type: 'string' },
            { key: 'metric1', label: 'Primary Value', type: 'number' },
            { key: 'metric2', label: 'Secondary Value', type: 'number' },
            { key: 'financial', label: 'Financial Impact', type: 'currency' },
            { key: 'status', label: 'Status/Health', type: 'badge' }
        ]
    },\n`;
    });
});

additional.forEach(r => {
    output += `    {
        id: '${r[0]}',
        title: '${r[1].replace(/'/g, "\\'")}',
        description: '${r[2].replace(/'/g, "\\'")}',
        module: 'LUBE',
        category: '${r[3]}',
        dataSource: '${r[0]}',
        accessLevel: 'MANAGER',
        visualization: 'TABLE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'string' },
            { key: 'amount', label: 'Amount/Impact', type: 'currency' },
            { key: 'trend', label: 'Trend Indicator', type: 'string' },
            { key: 'user', label: 'Assigned User', type: 'string' }
        ]
    },\n`;
});

output += `];\n`;

fs.writeFileSync('src/pages/reports/registries/lubeRegistry.ts', output);
console.log('Lube Registry created with 100 reports!');
