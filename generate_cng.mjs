import fs from 'fs';

const categories = {
    MACHINERY: [
        ['cng_compressor_run_hours', 'Compressor Run Hours Log', 'Tracks real-time run hours, cumulative load, and idle vs active time for all compressors.'],
        ['cng_suction_pressure_log', 'Suction Pressure Variance', 'Analyases incoming pipeline gas pressure (SSGC/SNGPL) drops and anomalies.'],
        ['cng_discharge_pressure_log', 'Discharge Pressure Matrix', 'Logs final cascade filling pressure ensuring optimal 200+ bar delivery.'],
        ['cng_lube_oil_consumption', 'Compressor Lube Oil Usage', 'Forensic tracking of compressor lubricating oil consumption per 100 hours.'],
        ['cng_dispenser_mass_flow', 'Mass Flow Meter Calibration', 'Audit of Coriolis mass flow meter drift and calibration variance.'],
        ['cng_gas_generator_yield', 'Gas Generator Output & Load', 'Maps gas generator kW output against direct gas consumed.'],
        ['cng_interstage_temps', 'Interstage Temperature Audit', 'Monitors heat exchange efficiency across compressor stages to prevent overheating.'],
        ['cng_cooling_tower_efficiency', 'Cooling Tower Delta-T', 'Measures inlet vs outlet water temperatures for thermal dissipation metrics.'],
        ['cng_blowdown_loss', 'Blow-Down Vessel Recovery', 'Tracks gas expelled during emergency stops and blow-down sequences.'],
        ['cng_filter_element_life', 'Coalescing Filter Lifecycle', 'Predictive maintenance log for inlet and high-pressure coalescing filters.'],
        ['cng_vibration_analysis', 'Compressor Vibration Index', 'Logs structural vibrations to predict main bearing or crosshead failure.'],
        ['cng_valve_efficiency', 'Suction/Discharge Valve Health', 'Monitors valve plate wear and volumetric efficiency drops.'],
        ['cng_motor_amp_draw', 'Electric Motor Ampere Draw', 'Logs peak and continuous amp draw on main electric prime movers.'],
        ['cng_soft_starter_faults', 'Soft Starter/VFD Fault Log', 'Tracks electrical faults, over-current, and phase imbalances.'],
        ['cng_priority_panel_audit', 'Priority Panel Routing', 'Analyzes gas flow logic and priority sequencing to cascade banks.'],
        ['cng_cascade_hydrotest', 'Cascade Cylinder Hydrotest Log', 'Tracks 5-year statutory hydro-testing compliance for all storage cylinders.'],
        ['cng_prv_activation_log', 'Pressure Relief Valve Strikes', 'Safety log recording instances of PRV popping due to over-pressurization.'],
        ['cng_dispenser_nozzle_wear', 'Dispenser Nozzle O-Ring Yield', 'Tracks NGV1/NZ nozzle maintenance and O-ring replacement frequency.'],
        ['cng_dryer_dewpoint', 'Gas Dryer Dewpoint Trace', 'Monitors moisture content in compressed gas to prevent freezing.'],
        ['cng_pigtail_fatigue', 'High-Pressure Pigtail Fatigue', 'Logs replacement cycles for high-pressure stainless steel pigtails.']
    ],
    DECANTING: [
        ['cng_daughter_station_intake', 'Daughter Station Decanting', 'Master log of all mobile cascades decanted into static storage.'],
        ['cng_trailer_pressure_drop', 'Trailer Pressure Differential', 'Analyzes arrival pressure vs empty return pressure of mobile cascades.'],
        ['cng_transit_shrinkage', 'Transit Shrinkage Audit', 'Calculates missing gas mass between Mother Station dispatch and Daughter Station receipt.'],
        ['cng_compressor_boost', 'Booster Compressor Efficiency', 'Tracks the electrical cost per kg to boost decanted gas to 200 bar.'],
        ['cng_decanting_post_heat', 'Decanting Gas Heat Loss', 'Monitors temperature drops during rapid expansion/decanting (Joule-Thomson effect).'],
        ['cng_trailer_turnaround', 'Trailer Turnaround Time (TAT)', 'Tracks time taken for a mobile cascade to couple, decant, and decouple.'],
        ['cng_mother_station_reconciliation', 'Mother Station Mass Balance', 'Reconciles billed kg from Mother Station against sold kg at Daughter Station.'],
        ['cng_hose_burst_log', 'Decanting Hose Integrity Log', 'Safety audit of high-pressure decanting hoses and burst incidents.'],
        ['cng_trailer_utilization', 'Mobile Cascade Fleet Utilization', 'Calculates idle vs active transit time for the logistic fleet.'],
        ['cng_decanting_mass_flow', 'Decanting Mass Flow Register', 'Direct mass flow readings during the decanting process.']
    ],
    FINANCIAL: [
        ['cng_hourly_sales_revenue', 'Hourly Sales Yield (Revenue)', 'Micro-analytical tracking of cash generation hour by hour.'],
        ['cng_wap_margin', 'Weighted Average Price Margin', 'Calculates real-time gross margin using mixed pipeline and decanted gas costs.'],
        ['cng_utility_cost_per_kg', 'Utility Cost Per KG', 'Divides total electric/generator costs by total kg sold to determine compression OPEX.'],
        ['cng_shrinkage_financial_loss', 'Financial Shrinkage Deficit', 'Monetizes the exact loss resulting from gas shrinkage and meter drift.'],
        ['cng_shift_cash_variance', 'Shift Cash Variance (Over/Short)', 'Strict audit of dispenser reading values vs physical cash deposited per shift.'],
        ['cng_discount_impact_ledger', 'Discount & Fleet Rate Impact', 'Calculates revenue sacrificed via commercial fleet discounts.'],
        ['cng_digital_payments_cng', 'Credit Card & Digital POS Receipts', 'Reconciliation of terminal settlements vs system recorded digital payments.'],
        ['cng_daily_pnl_cng', 'Daily Profit & Loss (CNG)', 'Comprehensive daily closure showing gross sales, opex, shrinkage, and net profit.'],
        ['cng_credit_recovery_cng', 'Fleet Credit Recovery (CNG)', 'Tracks aging of receivables from commercial transport fleets.'],
        ['cng_pricing_history_cng', 'OGRA Pricing Transition Log', 'Audit trail of all retail price changes mandated by regulatory bodies.']
    ],
    SHIFT: [
        ['cng_dispenser_totalizer', 'Electronic Totalizer Handover', 'Absolute audit of digital mass flow totalizers at shift change.'],
        ['cng_operator_throughput', 'Operator Dispensing Velocity', 'Ranks operators by volume dispensed per hour.'],
        ['cng_shift_duration_compliance', 'Shift Duration Compliance', 'Flags shifts that extended beyond standard 8/12 hour mandates.'],
        ['cng_peak_hour_congestion', 'Peak Hour Vehicle Throughput', 'Measures the number of vehicles serviced during defined peak windows.'],
        ['cng_void_transactions', 'Void/Cancelled Transaction Log', 'Forensic log of transactions stopped before completion (potential fraud).'],
        ['cng_dispenser_downtime', 'Dispenser Bay Downtime', 'Tracks minutes lost due to dispenser maintenance or pressure drops.'],
        ['cng_shift_handover_delay', 'Shift Handover Friction', 'Measures the time taken to reconcile and close a shift.'],
        ['cng_operator_shortage_history', 'Operator Cash Shortage Matrix', 'Lifetime tracking of operators who frequently deposit short cash.'],
        ['cng_night_shift_efficiency', 'Night Shift Profitability', 'Compares night shift OPEX (lights, security) vs revenue generated.'],
        ['cng_nozzle_abandonment', 'Nozzle Abandonment Rate', 'Tracks instances where nozzles were lifted but no gas dispensed.']
    ],
    UTILITIES: [
        ['cng_wapda_kwh_consumption', 'Grid Power (WAPDA/KE) kWh Log', 'Tracks main grid electricity units consumed per shift.'],
        ['cng_peak_demand_penalty', 'MDI Peak Demand Charges', 'Monitors maximum demand indicator to prevent utility penalty tariffs.'],
        ['cng_generator_diesel_burn', 'Generator Diesel Consumption', 'Tracks liters of diesel burned when grid power fails.'],
        ['cng_grid_outage_duration', 'Grid Power Outage Matrix', 'Logs exact start and end times of utility load shedding.'],
        ['cng_power_factor_penalty', 'Power Factor (Cos-Phi) Audit', 'Monitors capacitor bank efficiency to prevent low power factor penalties.'],
        ['cng_chiller_power_draw', 'Gas Chiller Energy Consumption', 'Calculates electrical load of chillers used to cool gas prior to dispensing.'],
        ['cng_site_illumination_cost', 'Canopy Illumination Cost', 'Estimates electrical cost of overhead LED canopy lighting.'],
        ['cng_water_consumption_cng', 'Cooling Tower Water Make-Up', 'Tracks municipal/borehole water consumed for compressor cooling.'],
        ['cng_ups_battery_health', 'UPS & Battery Bank Autonomy', 'Logs battery discharge cycles and remaining autonomy time.'],
        ['cng_generator_maintenance_cost', 'Generator Maintenance Yield', 'Tracks costs of oil changes/filters for the backup generator vs hours run.']
    ],
    COMPLIANCE: [
        ['cng_explosives_license_expiry', 'Dept. of Explosives Compliance', 'Tracks statutory license validity and renewal windows.'],
        ['cng_hdpe_pipeline_audit', 'Underground HDPE Pipeline Audit', 'Safety trace for underground gas pipeline integrity.'],
        ['cng_dispenser_calibration_cert', 'Weights & Measures Calibration', 'Logs expiration of government-mandated dispenser calibration seals.'],
        ['cng_fire_extinguisher_status', 'Fire Suppression System Audit', 'Tracks pressure levels and expiry of CO2/DCP extinguishers.'],
        ['cng_earth_pit_resistance', 'Earth Pit Resistance Log', 'Quarterly ohmic resistance check for static grounding pits.'],
        ['cng_emergency_shutdown_test', 'ESD System Activation Test', 'Logs monthly tests of the Emergency Shut Down (ESD) buttons.'],
        ['cng_gas_leak_detector', 'Combustible Gas Sensor Calibration', 'Audit of canopy and compressor room LEL sensor functionality.'],
        ['cng_pressure_vessel_cert', 'ASME Pressure Vessel Certification', 'Tracks the structural certification of buffer and blowdown vessels.'],
        ['cng_safety_valve_calibration', 'Relief Valve Bench Testing', 'Logs independent calibration of all safety relief valves.'],
        ['cng_staff_ppe_compliance', 'Operator PPE & Safety Gear Audit', 'Tracks issuance and condition of anti-static uniform and boots.']
    ],
    PERFORMANCE: [
        ['cng_station_conversion_rate', 'Traffic Conversion Ratio', 'Percentage of vehicles entering the station that actually purchase gas.'],
        ['cng_average_fill_volume', 'Average Fill Volume Per Vehicle', 'Tracks the mean kg dispensed per vehicle transaction.'],
        ['cng_pressure_loss_impact', 'Low Pressure Revenue Impact', 'Calculates sales lost due to filling vehicles at < 180 bar.'],
        ['cng_dispenser_utilization', 'Dispenser Hose Utilization Index', 'Identifies over-used vs under-used dispenser bays.'],
        ['cng_compressor_mtbf', 'Compressor Mean Time Between Failures', 'Reliability metric calculating average hours between compressor breakdowns.'],
        ['cng_compressor_mttr', 'Compressor Mean Time To Repair', 'Measures average downtime duration when a compressor fails.'],
        ['cng_operator_attendance', 'Operator Absenteeism & Punctuality', 'HR metric tracking shift attendance and late arrivals.'],
        ['cng_customer_wait_time', 'Average Customer Wait Time', 'Estimates queue duration during peak and off-peak hours.'],
        ['cng_sales_growth_yoy', 'Year-Over-Year Volume Growth', 'Compares current month volume to the same month in the previous year.'],
        ['cng_inventory_turnover', 'Gas Inventory Turnover Ratio', 'Calculates how fast underground line pack and cascades are depleted and refilled.']
    ]
};

// Add 30 more to hit 100 exactly (70 above + 30 here)
const additional = [
    // 10 more Financial
    ['cng_tax_withholding_ledger', 'Withholding Tax Ledger (CNG)', 'Tracks advance tax deducted by utility companies.', 'FINANCIAL'],
    ['cng_gst_output_ledger', 'Sales Tax (GST) Output', 'Calculates exact GST payable on retail volume.', 'FINANCIAL'],
    ['cng_gst_input_ledger', 'Sales Tax (GST) Input', 'Tracks GST paid on utility bills and gas purchases.', 'FINANCIAL'],
    ['cng_bank_deposit_reconciliation', 'Bank Deposit Reconciliation', 'Matches shift cash closures with actual bank deposit slips.', 'FINANCIAL'],
    ['cng_expense_variance', 'Petty Cash Expense Variance', 'Analyzes station operational expenses against budgeted limits.', 'FINANCIAL'],
    ['cng_roi_compressor_overhaul', 'Compressor Overhaul ROI', 'Measures efficiency gains after a major top-end overhaul.', 'FINANCIAL'],
    ['cng_cash_flow_forecast', '7-Day Cash Flow Forecast', 'Predicts short-term liquidity based on historical sales trends.', 'FINANCIAL'],
    ['cng_price_war_impact', 'Competitor Price Match Impact', 'Calculates lost margin when matching nearby competitor discounts.', 'FINANCIAL'],
    ['cng_lubricant_cross_sell', 'Lube Cross-Sell Revenue (CNG bays)', 'Tracks engine oil sold to customers at the CNG dispenser.', 'FINANCIAL'],
    ['cng_capital_expenditure', 'CAPEX Depreciation Log', 'Tracks depreciation of major assets (compressors, dispensers).', 'FINANCIAL'],

    // 10 more Audit
    ['cng_system_override_log', 'System Override Trace', 'Forensic log of managers bypassing standard POS or Shift locks.', 'AUDIT'],
    ['cng_price_change_audit', 'Retail Price Alteration Audit', 'Tracks exactly who changed the retail price and when.', 'AUDIT'],
    ['cng_manual_receipt_log', 'Manual Receipt Issuance', 'Flags instances where operators issued handwritten receipts instead of POS.', 'AUDIT'],
    ['cng_database_sync_failure', 'Cloud Sync Failure Log', 'Tracks instances where local POS failed to upload to Enterprise Cloud.', 'AUDIT'],
    ['cng_unauthorized_access', 'Unauthorized Access Attempts', 'Security log of failed login attempts to the manager portal.', 'AUDIT'],
    ['cng_meter_tamper_alerts', 'Dispenser Tamper Switch Alerts', 'Hardware security log for dispenser door openings.', 'AUDIT'],
    ['cng_backdated_entry_log', 'Backdated Transaction Audit', 'Flags any ledger entry made for a previous date.', 'AUDIT'],
    ['cng_deleted_expense_log', 'Deleted/Modified Expense Trace', 'Forensic trace of expenses that were deleted after entry.', 'AUDIT'],
    ['cng_customer_data_export', 'Customer Data Export Audit', 'Tracks who downloaded the corporate customer list.', 'AUDIT'],
    ['cng_report_generation_trace', 'Enterprise Report Access Log', 'Audits which manager generated highly sensitive financial reports.', 'AUDIT'],

    // 10 more Performance
    ['cng_highest_grossing_shift', 'Highest Grossing Shift Matrix', 'Identifies the optimal shift combinations that yield max revenue.', 'PERFORMANCE'],
    ['cng_lowest_grossing_shift', 'Lowest Grossing Shift Matrix', 'Identifies underperforming shifts for strategic overhaul.', 'PERFORMANCE'],
    ['cng_weather_impact_analysis', 'Weather vs Volume Correlation', 'Analyzes volume drops during rain or extreme temperatures.', 'PERFORMANCE'],
    ['cng_holiday_sales_index', 'Public Holiday Sales Index', 'Forecasts expected volume during national holidays.', 'PERFORMANCE'],
    ['cng_weekend_surge_matrix', 'Weekend Volume Surge', 'Compares Saturday/Sunday volume vs Weekday baselines.', 'PERFORMANCE'],
    ['cng_marketing_campaign_roi', 'Promo Campaign Yield', 'Measures volume lift during specific promotional campaigns.', 'PERFORMANCE'],
    ['cng_customer_retention_rate', 'Corporate Fleet Retention', 'Tracks how many commercial fleets remain active over 6 months.', 'PERFORMANCE'],
    ['cng_new_customer_acquisition', 'New Fleet Onboarding Index', 'Tracks volume brought in by newly registered corporate fleets.', 'PERFORMANCE'],
    ['cng_station_uptime_percentage', 'Total Station Uptime', 'Calculates the true percentage of time the station was able to sell gas.', 'PERFORMANCE'],
    ['cng_employee_turnover_rate', 'Operator Turnover Rate', 'HR metric tracking the frequency of operator resignations.', 'PERFORMANCE']
];

let output = `import { ReportDefinition } from '../ReportRegistry';\n\nexport const CNG_REPORTS: ReportDefinition[] = [\n`;

Object.entries(categories).forEach(([category, reports]) => {
    reports.forEach(r => {
        output += `    {
        id: '${r[0]}',
        title: '${r[1].replace(/'/g, "\\'")}',
        description: '${r[2].replace(/'/g, "\\'")}',
        module: 'CNG',
        category: '${category}',
        dataSource: '${r[0]}',
        accessLevel: 'MANAGER',
        visualization: 'TABLE',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'string' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },\n`;
    });
});

additional.forEach(r => {
    output += `    {
        id: '${r[0]}',
        title: '${r[1].replace(/'/g, "\\'")}',
        description: '${r[2].replace(/'/g, "\\'")}',
        module: 'CNG',
        category: '${r[3]}',
        dataSource: '${r[0]}',
        accessLevel: 'MANAGER',
        visualization: 'TABLE',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'string' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'string' },
            { key: 'user', label: 'Authorized By', type: 'string' }
        ]
    },\n`;
});

output += `];\n`;

fs.writeFileSync('src/pages/reports/registries/cngRegistry.ts', output);
console.log('CNG Registry created with 100 reports!');
