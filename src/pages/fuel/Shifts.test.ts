import { useFuelStore } from '@/stores/fuelStore';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Shifts Page - Fuel Store', () => {
    beforeEach(() => {
        // Reset state before each test
        useFuelStore.getState().resetClosingState();
    });

    describe('Shift Closing Wizard', () => {
        it('should initialize with step 1', () => {
            const state = useFuelStore.getState();
            expect(state.closingState.step).toBe(1);
        });

        it('should load demo data with nozzles', async () => {
            useFuelStore.setState({ shifts: [], nozzles: [], tanks: [] });
            
            await useFuelStore.getState().fetchNozzles();
            await useFuelStore.getState().fetchTanks();

            const state = useFuelStore.getState();
            expect(state.nozzles.length).toBeGreaterThan(0);
            expect(state.tanks.length).toBeGreaterThan(0);
        });

        it('should open closing wizard with initialized nozzle sales', () => {
            const { openClosingWizard } = useFuelStore.getState();
            
            openClosingWizard();

            const state = useFuelStore.getState();
            expect(state.isClosingWizardOpen).toBe(true);
            expect(state.closingState.nozzleSales.length).toBeGreaterThan(0);
        });

        it('should navigate between wizard steps', () => {
            const { setClosingStep } = useFuelStore.getState();

            setClosingStep(1);
            expect(useFuelStore.getState().closingState.step).toBe(1);

            setClosingStep(2);
            expect(useFuelStore.getState().closingState.step).toBe(2);

            setClosingStep(3);
            expect(useFuelStore.getState().closingState.step).toBe(3);
        });
    });

    describe('Nozzle Sales Calculations', () => {
        beforeEach(() => {
            useFuelStore.getState().resetClosingState();
            useFuelStore.getState().openClosingWizard();
        });

        it('should group nozzles by fuel type (petrol vs diesel)', () => {
            const state = useFuelStore.getState();
            const petrolNozzles = state.closingState.nozzleSales.filter(
                s => s.fuelType === 'PETROL_92' || s.fuelType === 'PETROL_95'
            );
            const dieselNozzles = state.closingState.nozzleSales.filter(
                s => s.fuelType === 'DIESEL' || s.fuelType === 'PREMIUM_DIESEL'
            );

            expect(petrolNozzles.length).toBeGreaterThan(0);
            expect(dieselNozzles.length).toBeGreaterThan(0);
        });

        it('should update nozzle sale closing reading and calculate revenue', () => {
            const state = useFuelStore.getState();
            const firstNozzle = state.closingState.readings[0];
            const newClosingReading = firstNozzle.opening + 100;

            useFuelStore.getState().updateNozzleReading(firstNozzle.nozzleId, {
                closing: newClosingReading,
            });

            const updatedState = useFuelStore.getState();
            const updatedNozzle = updatedState.closingState.readings.find(
                s => s.nozzleId === firstNozzle.nozzleId
            );

            expect(updatedNozzle?.closing).toBe(newClosingReading);
            expect(updatedNozzle?.netLiters).toBe(100 - firstNozzle.test);
            expect(updatedNozzle?.revenue).toBeGreaterThan(0);
        });

        it('should update test volume and recalculate net sales', () => {
            const state = useFuelStore.getState();
            const firstNozzle = state.closingState.readings[0];

            // First set a closing reading
            const closingReading = firstNozzle.opening + 100;
            useFuelStore.getState().updateNozzleReading(firstNozzle.nozzleId, {
                closing: closingReading,
            });

            // Now change test volume
            const newTestVolume = 20;
            const expectedNetSales = closingReading - firstNozzle.opening - newTestVolume;

            useFuelStore.getState().updateNozzleReading(firstNozzle.nozzleId, {
                test: newTestVolume,
            });

            const updatedState = useFuelStore.getState();
            const updatedNozzle = updatedState.closingState.readings.find(
                s => s.nozzleId === firstNozzle.nozzleId
            );

            expect(updatedNozzle?.test).toBe(20);
            expect(updatedNozzle?.netLiters).toBe(expectedNetSales);
        });

        it('should calculate total revenue correctly', () => {
            const state = useFuelStore.getState();

            // Update all nozzles with some sales
            state.closingState.readings.forEach(nozzle => {
                useFuelStore.getState().updateNozzleReading(nozzle.nozzleId, {
                    closing: nozzle.opening + 50,
                });
            });

            const calculatedRevenue = useFuelStore.getState().getCalculatedRevenue();
            expect(calculatedRevenue).toBeGreaterThan(0);
        });
    });

    describe('Expected Cash Calculation', () => {
        beforeEach(() => {
            useFuelStore.getState().resetClosingState();
            useFuelStore.getState().openClosingWizard();
        });

        it('should calculate expected cash with all deductions', () => {
            // Set up some sales
            const state = useFuelStore.getState();
            state.closingState.readings.forEach(nozzle => {
                useFuelStore.getState().updateNozzleReading(nozzle.nozzleId, {
                    closing: nozzle.opening + 50,
                });
            });

            // Add some recoveries and expenses
            useFuelStore.getState().addTransaction({
                id: 'tx-1', type: 'RECOVERY', amount: 5000, timestamp: ''
            } as any);
            useFuelStore.getState().addTransaction({
                id: 'tx-2', type: 'EXPENSE', amount: 1000, timestamp: ''
            } as any);
            useFuelStore.getState().addTransaction({
                id: 'tx-3', type: 'CREDIT_SALE', amount: 2000, timestamp: ''
            } as any);

            const expectedCash = useFuelStore.getState().getExpectedCash();
            const revenue = useFuelStore.getState().getCalculatedRevenue();

            // Expected = Revenue + Recoveries - Credits - Expenses - ...
            expect(expectedCash).toBe(revenue + 5000 - 2000 - 1000);
        });

        it('should calculate cash variance correctly', () => {
            // Set up some sales
            const state = useFuelStore.getState();
            state.closingState.readings.forEach(nozzle => {
                useFuelStore.getState().updateNozzleReading(nozzle.nozzleId, {
                    closing: nozzle.opening + 50,
                });
            });

            const expectedCash = useFuelStore.getState().getExpectedCash();
            useFuelStore.getState().updateClosingState({ actualCash: expectedCash + 100 });

            const variance = useFuelStore.getState().getCashVariance();
            expect(variance).toBe(100);
        });
    });
});
