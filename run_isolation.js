"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var authStore_1 = require("./src/stores/authStore");
var cngStore_1 = require("./src/stores/cngStore");
var dataStores_1 = require("./src/stores/dataStores");
var fuelStore_1 = require("./src/stores/fuelStore");
var productStore_1 = require("./src/stores/productStore");
var logFile = './isolation_eval.txt';
fs.writeFileSync(logFile, '--- STARTING ISOLATION TEST ---\n');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}
// Mock localStorage
var localStorageMock = (function () {
    var store = {};
    return {
        getItem: function (key) {
            return store[key] || null;
        },
        setItem: function (key, value) {
            store[key] = value.toString();
        },
        removeItem: function (key) {
            delete store[key];
        },
        clear: function () {
            store = {};
        },
    };
})();
global.window = { localStorage: localStorageMock };
function assert(condition, message) {
    if (!condition) {
        log('ASSERTION FAILED: ' + message);
        throw new Error('ASSERTION FAILED: ' + message);
    }
    log('OK: ' + message);
}
try {
    // Clear stores
    authStore_1.useSettingsStore.setState({
        settings: { businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
    });
    fuelStore_1.useFuelStore.setState({ shifts: [], tanks: [], mappedNozzles: [] });
    cngStore_1.useCNGStore.setState({ shifts: [], compressors: [], cascades: [], nozzles: [] });
    productStore_1.useProductStore.setState({ products: [], categories: [] });
    dataStores_1.useStaffStore.setState({ users: [], attendance: [] });
    // 1. Setup in FUEL context
    authStore_1.useSettingsStore.setState({
        settings: { businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
    });
    dataStores_1.useStaffStore
        .getState()
        .addStaff({ name: 'Fuel Attendant', role: 'ATTENDANT', phone: '123' });
    fuelStore_1.useFuelStore
        .getState()
        .addTank({
        name: 'Tank 1',
        type: 'PETROL',
        capacity: 50000,
        currentLevel: 25000,
        status: 'ACTIVE',
    });
    fuelStore_1.useFuelStore.setState(function (state) { return ({
        shifts: __spreadArray(__spreadArray([], state.shifts, true), [
            { shiftId: 'SHF-FUEL-1', status: 'CLOSED', businessUnit: 'FUEL' },
        ], false),
    }); });
    assert(dataStores_1.useStaffStore.getState().users.length === 1, 'Fuel staff added globally');
    assert(dataStores_1.useStaffStore.getState().getActiveStaff().length === 1, 'Fuel staff active in FUEL bu');
    assert(fuelStore_1.useFuelStore.getState().tanks.length === 1, 'Fuel tank added');
    assert(fuelStore_1.useFuelStore.getState().shifts.length === 1, 'Fuel shift added');
    // 2. Switch to CNG context
    authStore_1.useSettingsStore.setState({
        settings: { businessUnit: 'CNG', theme: 'system', currency: 'PKR' },
    });
    assert(cngStore_1.useCNGStore.getState().compressors.length === 0, 'CNG store is isolated from Fuel tanks');
    assert(cngStore_1.useCNGStore.getState().shifts.length === 0, 'CNG store is isolated from Fuel shifts');
    assert(dataStores_1.useStaffStore.getState().getActiveStaff().length === 0, 'CNG context sees zero Fuel staff');
    dataStores_1.useStaffStore
        .getState()
        .addStaff({ name: 'CNG Attendant', role: 'ATTENDANT', phone: '456' });
    assert(dataStores_1.useStaffStore.getState().getActiveStaff().length === 1, 'CNG context sees its own staff');
    assert(dataStores_1.useStaffStore.getState().getActiveStaff()[0].name === 'CNG Attendant', 'CNG staff is CNG Attendant');
    // 3. Switch to LUBE context
    authStore_1.useSettingsStore.setState({
        settings: { businessUnit: 'LUBE', theme: 'system', currency: 'PKR' },
    });
    productStore_1.useProductStore
        .getState()
        .addProduct({
        name: 'Engine Oil',
        category: 'ENGINE_OIL',
        currentStock: 50,
        reorderPoint: 10,
    });
    var lubeProducts = productStore_1.useProductStore.getState().getFilteredProducts();
    assert(lubeProducts.length === 1, 'Lube context sees its products');
    assert(lubeProducts[0].name === 'Engine Oil', 'Lube product correct');
    // 4. Verification back to FUEL
    authStore_1.useSettingsStore.setState({
        settings: { businessUnit: 'FUEL', theme: 'system', currency: 'PKR' },
    });
    assert(productStore_1.useProductStore.getState().getFilteredProducts().length === 0, 'Fuel context does not see Lube products');
    assert(dataStores_1.useStaffStore.getState().getActiveStaff().length === 1, 'Fuel context sees its own staff');
    log('--- ALL ISOLATION TESTS PASSED ---');
}
catch (e) {
    log('CRITICAL ERROR: ' + e.message);
}
