import { ReportDefinition } from './ReportRegistry';

export const CNG_REPORTS: ReportDefinition[] = [
    {
        id: 'cng_compressor_run_hours',
        title: 'Compressor Run Hours Log',
        description: 'Tracks real-time run hours, cumulative load, and idle vs active time for all compressors.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_compressor_run_hours',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_suction_pressure_log',
        title: 'Suction Pressure Variance',
        description: 'Analyases incoming pipeline gas pressure (SSGC/SNGPL) drops and anomalies.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_suction_pressure_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_discharge_pressure_log',
        title: 'Discharge Pressure Matrix',
        description: 'Logs final cascade filling pressure ensuring optimal 200+ bar delivery.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_discharge_pressure_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_lube_oil_consumption',
        title: 'Compressor Lube Oil Usage',
        description: 'Forensic tracking of compressor lubricating oil consumption per 100 hours.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_lube_oil_consumption',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dispenser_mass_flow',
        title: 'Mass Flow Meter Calibration',
        description: 'Audit of Coriolis mass flow meter drift and calibration variance.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_dispenser_mass_flow',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_gas_generator_yield',
        title: 'Gas Generator Output & Load',
        description: 'Maps gas generator kW output against direct gas consumed.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_gas_generator_yield',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_interstage_temps',
        title: 'Interstage Temperature Audit',
        description: 'Monitors heat exchange efficiency across compressor stages to prevent overheating.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_interstage_temps',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_cooling_tower_efficiency',
        title: 'Cooling Tower Delta-T',
        description: 'Measures inlet vs outlet water temperatures for thermal dissipation metrics.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_cooling_tower_efficiency',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_blowdown_loss',
        title: 'Blow-Down Vessel Recovery',
        description: 'Tracks gas expelled during emergency stops and blow-down sequences.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_blowdown_loss',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_filter_element_life',
        title: 'Coalescing Filter Lifecycle',
        description: 'Predictive maintenance log for inlet and high-pressure coalescing filters.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_filter_element_life',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_vibration_analysis',
        title: 'Compressor Vibration Index',
        description: 'Logs structural vibrations to predict main bearing or crosshead failure.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_vibration_analysis',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_valve_efficiency',
        title: 'Suction/Discharge Valve Health',
        description: 'Monitors valve plate wear and volumetric efficiency drops.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_valve_efficiency',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_motor_amp_draw',
        title: 'Electric Motor Ampere Draw',
        description: 'Logs peak and continuous amp draw on main electric prime movers.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_motor_amp_draw',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_soft_starter_faults',
        title: 'Soft Starter/VFD Fault Log',
        description: 'Tracks electrical faults, over-current, and phase imbalances.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_soft_starter_faults',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_priority_panel_audit',
        title: 'Priority Panel Routing',
        description: 'Analyzes gas flow logic and priority sequencing to cascade banks.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_priority_panel_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_cascade_hydrotest',
        title: 'Cascade Cylinder Hydrotest Log',
        description: 'Tracks 5-year statutory hydro-testing compliance for all storage cylinders.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_cascade_hydrotest',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_prv_activation_log',
        title: 'Pressure Relief Valve Strikes',
        description: 'Safety log recording instances of PRV popping due to over-pressurization.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_prv_activation_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dispenser_nozzle_wear',
        title: 'Dispenser Nozzle O-Ring Yield',
        description: 'Tracks NGV1/NZ nozzle maintenance and O-ring replacement frequency.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_dispenser_nozzle_wear',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dryer_dewpoint',
        title: 'Gas Dryer Dewpoint Trace',
        description: 'Monitors moisture content in compressed gas to prevent freezing.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_dryer_dewpoint',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_pigtail_fatigue',
        title: 'High-Pressure Pigtail Fatigue',
        description: 'Logs replacement cycles for high-pressure stainless steel pigtails.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_pigtail_fatigue',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_daughter_station_intake',
        title: 'Daughter Station Decanting',
        description: 'Master log of all mobile cascades decanted into static storage.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_daughter_station_intake',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_trailer_pressure_drop',
        title: 'Trailer Pressure Differential',
        description: 'Analyzes arrival pressure vs empty return pressure of mobile cascades.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_trailer_pressure_drop',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_transit_shrinkage',
        title: 'Transit Shrinkage Audit',
        description: 'Calculates missing gas mass between Mother Station dispatch and Daughter Station receipt.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_transit_shrinkage',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_compressor_boost',
        title: 'Booster Compressor Efficiency',
        description: 'Tracks the electrical cost per kg to boost decanted gas to 200 bar.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_compressor_boost',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_decanting_post_heat',
        title: 'Decanting Gas Heat Loss',
        description: 'Monitors temperature drops during rapid expansion/decanting (Joule-Thomson effect).',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_decanting_post_heat',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_trailer_turnaround',
        title: 'Trailer Turnaround Time (TAT)',
        description: 'Tracks time taken for a mobile cascade to couple, decant, and decouple.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_trailer_turnaround',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_mother_station_reconciliation',
        title: 'Mother Station Mass Balance',
        description: 'Reconciles billed kg from Mother Station against sold kg at Daughter Station.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_mother_station_reconciliation',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_hose_burst_log',
        title: 'Decanting Hose Integrity Log',
        description: 'Safety audit of high-pressure decanting hoses and burst incidents.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_hose_burst_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_trailer_utilization',
        title: 'Mobile Cascade Fleet Utilization',
        description: 'Calculates idle vs active transit time for the logistic fleet.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_trailer_utilization',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_decanting_mass_flow',
        title: 'Decanting Mass Flow Register',
        description: 'Direct mass flow readings during the decanting process.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_decanting_mass_flow',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_hourly_sales_revenue',
        title: 'Hourly Sales Yield (Revenue)',
        description: 'Micro-analytical tracking of cash generation hour by hour.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_hourly_sales_revenue',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_wap_margin',
        title: 'Weighted Average Price Margin',
        description: 'Calculates real-time gross margin using mixed pipeline and decanted gas costs.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_wap_margin',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_utility_cost_per_kg',
        title: 'Utility Cost Per KG',
        description: 'Divides total electric/generator costs by total kg sold to determine compression OPEX.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_utility_cost_per_kg',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_shrinkage_financial_loss',
        title: 'Financial Shrinkage Deficit',
        description: 'Monetizes the exact loss resulting from gas shrinkage and meter drift.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_shrinkage_financial_loss',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_shift_cash_variance',
        title: 'Shift Cash Variance (Over/Short)',
        description: 'Strict audit of dispenser reading values vs physical cash deposited per shift.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_shift_cash_variance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_discount_impact_ledger',
        title: 'Discount & Fleet Rate Impact',
        description: 'Calculates revenue sacrificed via commercial fleet discounts.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_discount_impact_ledger',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_digital_payments_cng',
        title: 'Credit Card & Digital POS Receipts',
        description: 'Reconciliation of terminal settlements vs system recorded digital payments.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_digital_payments_cng',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_daily_pnl_cng',
        title: 'Daily Profit & Loss (CNG)',
        description: 'Comprehensive daily closure showing gross sales, opex, shrinkage, and net profit.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_daily_pnl_cng',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_credit_recovery_cng',
        title: 'Fleet Credit Recovery (CNG)',
        description: 'Tracks aging of receivables from commercial transport fleets.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_credit_recovery_cng',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_pricing_history_cng',
        title: 'OGRA Pricing Transition Log',
        description: 'Audit trail of all retail price changes mandated by regulatory bodies.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_pricing_history_cng',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dispenser_totalizer',
        title: 'Electronic Totalizer Handover',
        description: 'Absolute audit of digital mass flow totalizers at shift change.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_dispenser_totalizer',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_operator_throughput',
        title: 'Operator Dispensing Velocity',
        description: 'Ranks operators by volume dispensed per hour.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_operator_throughput',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_shift_duration_compliance',
        title: 'Shift Duration Compliance',
        description: 'Flags shifts that extended beyond standard 8/12 hour mandates.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_shift_duration_compliance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_peak_hour_congestion',
        title: 'Peak Hour Vehicle Throughput',
        description: 'Measures the number of vehicles serviced during defined peak windows.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_peak_hour_congestion',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_void_transactions',
        title: 'Void/Cancelled Transaction Log',
        description: 'Forensic log of transactions stopped before completion (potential fraud).',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_void_transactions',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dispenser_downtime',
        title: 'Dispenser Bay Downtime',
        description: 'Tracks minutes lost due to dispenser maintenance or pressure drops.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_dispenser_downtime',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_shift_handover_delay',
        title: 'Shift Handover Friction',
        description: 'Measures the time taken to reconcile and close a shift.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_shift_handover_delay',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_operator_shortage_history',
        title: 'Operator Cash Shortage Matrix',
        description: 'Lifetime tracking of operators who frequently deposit short cash.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_operator_shortage_history',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_night_shift_efficiency',
        title: 'Night Shift Profitability',
        description: 'Compares night shift OPEX (lights, security) vs revenue generated.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_night_shift_efficiency',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_nozzle_abandonment',
        title: 'Nozzle Abandonment Rate',
        description: 'Tracks instances where nozzles were lifted but no gas dispensed.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_nozzle_abandonment',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_wapda_kwh_consumption',
        title: 'Grid Power (WAPDA/KE) kWh Log',
        description: 'Tracks main grid electricity units consumed per shift.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_wapda_kwh_consumption',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_peak_demand_penalty',
        title: 'MDI Peak Demand Charges',
        description: 'Monitors maximum demand indicator to prevent utility penalty tariffs.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_peak_demand_penalty',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_generator_diesel_burn',
        title: 'Generator Diesel Consumption',
        description: 'Tracks liters of diesel burned when grid power fails.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_generator_diesel_burn',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_grid_outage_duration',
        title: 'Grid Power Outage Matrix',
        description: 'Logs exact start and end times of utility load shedding.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_grid_outage_duration',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_power_factor_penalty',
        title: 'Power Factor (Cos-Phi) Audit',
        description: 'Monitors capacitor bank efficiency to prevent low power factor penalties.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_power_factor_penalty',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_chiller_power_draw',
        title: 'Gas Chiller Energy Consumption',
        description: 'Calculates electrical load of chillers used to cool gas prior to dispensing.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_chiller_power_draw',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_site_illumination_cost',
        title: 'Canopy Illumination Cost',
        description: 'Estimates electrical cost of overhead LED canopy lighting.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_site_illumination_cost',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_water_consumption_cng',
        title: 'Cooling Tower Water Make-Up',
        description: 'Tracks municipal/borehole water consumed for compressor cooling.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_water_consumption_cng',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_ups_battery_health',
        title: 'UPS & Battery Bank Autonomy',
        description: 'Logs battery discharge cycles and remaining autonomy time.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_ups_battery_health',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_generator_maintenance_cost',
        title: 'Generator Maintenance Yield',
        description: 'Tracks costs of oil changes/filters for the backup generator vs hours run.',
        module: 'CNG',
        category: 'CNG_EXPENSE',
        dataSource: 'cng_generator_maintenance_cost',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_explosives_license_expiry',
        title: 'Dept. of Explosives Compliance',
        description: 'Tracks statutory license validity and renewal windows.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_explosives_license_expiry',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_hdpe_pipeline_audit',
        title: 'Underground HDPE Pipeline Audit',
        description: 'Safety trace for underground gas pipeline integrity.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_hdpe_pipeline_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dispenser_calibration_cert',
        title: 'Weights & Measures Calibration',
        description: 'Logs expiration of government-mandated dispenser calibration seals.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_dispenser_calibration_cert',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_fire_extinguisher_status',
        title: 'Fire Suppression System Audit',
        description: 'Tracks pressure levels and expiry of CO2/DCP extinguishers.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_fire_extinguisher_status',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_earth_pit_resistance',
        title: 'Earth Pit Resistance Log',
        description: 'Quarterly ohmic resistance check for static grounding pits.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_earth_pit_resistance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_emergency_shutdown_test',
        title: 'ESD System Activation Test',
        description: 'Logs monthly tests of the Emergency Shut Down (ESD) buttons.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_emergency_shutdown_test',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_gas_leak_detector',
        title: 'Combustible Gas Sensor Calibration',
        description: 'Audit of canopy and compressor room LEL sensor functionality.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_gas_leak_detector',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_pressure_vessel_cert',
        title: 'ASME Pressure Vessel Certification',
        description: 'Tracks the structural certification of buffer and blowdown vessels.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_pressure_vessel_cert',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_safety_valve_calibration',
        title: 'Relief Valve Bench Testing',
        description: 'Logs independent calibration of all safety relief valves.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_safety_valve_calibration',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_staff_ppe_compliance',
        title: 'Operator PPE & Safety Gear Audit',
        description: 'Tracks issuance and condition of anti-static uniform and boots.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_staff_ppe_compliance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_station_conversion_rate',
        title: 'Traffic Conversion Ratio',
        description: 'Percentage of vehicles entering the station that actually purchase gas.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_station_conversion_rate',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_average_fill_volume',
        title: 'Average Fill Volume Per Vehicle',
        description: 'Tracks the mean kg dispensed per vehicle transaction.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_average_fill_volume',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_pressure_loss_impact',
        title: 'Low Pressure Revenue Impact',
        description: 'Calculates sales lost due to filling vehicles at < 180 bar.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_pressure_loss_impact',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_dispenser_utilization',
        title: 'Dispenser Hose Utilization Index',
        description: 'Identifies over-used vs under-used dispenser bays.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_dispenser_utilization',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_compressor_mtbf',
        title: 'Compressor Mean Time Between Failures',
        description: 'Reliability metric calculating average hours between compressor breakdowns.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_compressor_mtbf',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_compressor_mttr',
        title: 'Compressor Mean Time To Repair',
        description: 'Measures average downtime duration when a compressor fails.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_compressor_mttr',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_operator_attendance',
        title: 'Operator Absenteeism & Punctuality',
        description: 'HR metric tracking shift attendance and late arrivals.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_operator_attendance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_customer_wait_time',
        title: 'Average Customer Wait Time',
        description: 'Estimates queue duration during peak and off-peak hours.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_customer_wait_time',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_sales_growth_yoy',
        title: 'Year-Over-Year Volume Growth',
        description: 'Compares current month volume to the same month in the previous year.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_sales_growth_yoy',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_inventory_turnover',
        title: 'Gas Inventory Turnover Ratio',
        description: 'Calculates how fast underground line pack and cascades are depleted and refilled.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_inventory_turnover',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date/Time', type: 'date' },
            { key: 'identifier', label: 'Identifier/Machine', type: 'text' },
            { key: 'metric1', label: 'Primary Metric', type: 'number' },
            { key: 'metric2', label: 'Secondary Metric', type: 'number' },
            { key: 'variance', label: 'Variance/Delta', type: 'number' },
            { key: 'status', label: 'Health/Status', type: 'badge' }
        ]
    },
    {
        id: 'cng_tax_withholding_ledger',
        title: 'Withholding Tax Ledger (CNG)',
        description: 'Tracks advance tax deducted by utility companies.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_tax_withholding_ledger',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_gst_output_ledger',
        title: 'Sales Tax (GST) Output',
        description: 'Calculates exact GST payable on retail volume.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_gst_output_ledger',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_gst_input_ledger',
        title: 'Sales Tax (GST) Input',
        description: 'Tracks GST paid on utility bills and gas purchases.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_gst_input_ledger',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_bank_deposit_reconciliation',
        title: 'Bank Deposit Reconciliation',
        description: 'Matches shift cash closures with actual bank deposit slips.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_bank_deposit_reconciliation',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_expense_variance',
        title: 'Petty Cash Expense Variance',
        description: 'Analyzes station operational expenses against budgeted limits.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_expense_variance',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_roi_compressor_overhaul',
        title: 'Compressor Overhaul ROI',
        description: 'Measures efficiency gains after a major top-end overhaul.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_roi_compressor_overhaul',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_cash_flow_forecast',
        title: '7-Day Cash Flow Forecast',
        description: 'Predicts short-term liquidity based on historical sales trends.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_cash_flow_forecast',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_price_war_impact',
        title: 'Competitor Price Match Impact',
        description: 'Calculates lost margin when matching nearby competitor discounts.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_price_war_impact',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_lubricant_cross_sell',
        title: 'Lube Cross-Sell Revenue (CNG bays)',
        description: 'Tracks engine oil sold to customers at the CNG dispenser.',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_lubricant_cross_sell',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_capital_expenditure',
        title: 'CAPEX Depreciation Log',
        description: 'Tracks depreciation of major assets (compressors, dispensers).',
        module: 'CNG',
        category: 'CNG_FINANCIAL',
        dataSource: 'cng_capital_expenditure',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_system_override_log',
        title: 'System Override Trace',
        description: 'Forensic log of managers bypassing standard POS or Shift locks.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_system_override_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_price_change_audit',
        title: 'Retail Price Alteration Audit',
        description: 'Tracks exactly who changed the retail price and when.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_price_change_audit',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_manual_receipt_log',
        title: 'Manual Receipt Issuance',
        description: 'Flags instances where operators issued handwritten receipts instead of POS.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_manual_receipt_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_database_sync_failure',
        title: 'Cloud Sync Failure Log',
        description: 'Tracks instances where local POS failed to upload to Enterprise Cloud.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_database_sync_failure',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_unauthorized_access',
        title: 'Unauthorized Access Attempts',
        description: 'Security log of failed login attempts to the manager portal.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_unauthorized_access',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_meter_tamper_alerts',
        title: 'Dispenser Tamper Switch Alerts',
        description: 'Hardware security log for dispenser door openings.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_meter_tamper_alerts',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_backdated_entry_log',
        title: 'Backdated Transaction Audit',
        description: 'Flags any ledger entry made for a previous date.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_backdated_entry_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_deleted_expense_log',
        title: 'Deleted/Modified Expense Trace',
        description: 'Forensic trace of expenses that were deleted after entry.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_deleted_expense_log',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_customer_data_export',
        title: 'Customer Data Export Audit',
        description: 'Tracks who downloaded the corporate customer list.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_customer_data_export',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_report_generation_trace',
        title: 'Enterprise Report Access Log',
        description: 'Audits which manager generated highly sensitive financial reports.',
        module: 'CNG',
        category: 'CNG_AUDIT',
        dataSource: 'cng_report_generation_trace',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_highest_grossing_shift',
        title: 'Highest Grossing Shift Matrix',
        description: 'Identifies the optimal shift combinations that yield max revenue.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_highest_grossing_shift',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_lowest_grossing_shift',
        title: 'Lowest Grossing Shift Matrix',
        description: 'Identifies underperforming shifts for strategic overhaul.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_lowest_grossing_shift',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_weather_impact_analysis',
        title: 'Weather vs Volume Correlation',
        description: 'Analyzes volume drops during rain or extreme temperatures.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_weather_impact_analysis',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_holiday_sales_index',
        title: 'Public Holiday Sales Index',
        description: 'Forecasts expected volume during national holidays.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_holiday_sales_index',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_weekend_surge_matrix',
        title: 'Weekend Volume Surge',
        description: 'Compares Saturday/Sunday volume vs Weekday baselines.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_weekend_surge_matrix',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_marketing_campaign_roi',
        title: 'Promo Campaign Yield',
        description: 'Measures volume lift during specific promotional campaigns.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_marketing_campaign_roi',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_customer_retention_rate',
        title: 'Corporate Fleet Retention',
        description: 'Tracks how many commercial fleets remain active over 6 months.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_customer_retention_rate',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_new_customer_acquisition',
        title: 'New Fleet Onboarding Index',
        description: 'Tracks volume brought in by newly registered corporate fleets.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_new_customer_acquisition',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_station_uptime_percentage',
        title: 'Total Station Uptime',
        description: 'Calculates the true percentage of time the station was able to sell gas.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_station_uptime_percentage',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
    {
        id: 'cng_employee_turnover_rate',
        title: 'Operator Turnover Rate',
        description: 'HR metric tracking the frequency of operator resignations.',
        module: 'CNG',
        category: 'CNG_OPERATIONS',
        dataSource: 'cng_employee_turnover_rate',
        requiredRole: 'STAFF',
        columns: [
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'reference', label: 'Reference No.', type: 'text' },
            { key: 'amount', label: 'Amount/Value', type: 'currency' },
            { key: 'impact', label: 'Business Impact', type: 'text' },
            { key: 'user', label: 'Authorized By', type: 'text' }
        ]
    },
];
