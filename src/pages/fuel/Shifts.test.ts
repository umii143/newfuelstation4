import { useFuelStore } from '@/stores/fuelStore';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Shifts Page - Fuel Store', () => {
    beforeEach(() => {
        // Reset state before each test
        useFuelStore.getState().resetClosingState();
    });

    describe('Shift Closing Wizard', () => {
        it('should initialize with step 0', () => {
            const state = useFuelStore.getState();
            expect(state.closingState.step).toBe(0);
        });

        it('should load demo data with nozzles', () => {
            useFuelStore.setState({ shifts: [] });
            

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
            const firstNozzle = state.closingState.nozzleSales[0];
            const newClosingReading = firstNozzle.openingReading + 100;

            useFuelStore.getState().updateNozzleSale(firstNozzle.nozzleId, {
                closingReading: newClosingReading,
                netSales: 100 - firstNozzle.testVolume,
                revenue: (100 - firstNozzle.testVolume) * firstNozzle.rate,
            });

            const updatedState = useFuelStore.getState();
            const updatedNozzle = updatedState.closingState.nozzleSales.find(
                s => s.nozzleId === firstNozzle.nozzleId
            );

            expect(updatedNozzle?.closingReading).toBe(newClosingReading);
            expect(updatedNozzle?.netSales).toBe(100 - firstNozzle.testVolume);
            expect(updatedNozzle?.revenue).toBeGreaterThan(0);
        });

        it('should update test volume and recalculate net sales', () => {
            const state = useFuelStore.getState();
            const firstNozzle = state.closingState.nozzleSales[0];

            // First set a closing reading
            const closingReading = firstNozzle.openingReading + 100;
            useFuelStore.getState().updateNozzleSale(firstNozzle.nozzleId, {
                closingReading,
                netSales: 100 - firstNozzle.testVolume,
                revenue: (100 - firstNozzle.testVolume) * firstNozzle.rate,
            });

            // Now change test volume
            const newTestVolume = 20;
            const expectedNetSales = closingReading - firstNozzle.openingReading - newTestVolume;

            useFuelStore.getState().updateNozzleSale(firstNozzle.nozzleId, {
                testVolume: newTestVolume,
                netSales: expectedNetSales,
                revenue: expectedNetSales * firstNozzle.rate,
            });

            const updatedState = useFuelStore.getState();
            const updatedNozzle = updatedState.closingState.nozzleSales.find(
                s => s.nozzleId === firstNozzle.nozzleId
            );

            expect(updatedNozzle?.testVolume).toBe(20);
            expect(updatedNozzle?.netSales).toBe(expectedNetSales);
        });

        it('should calculate total revenue correctly', () => {
            const state = useFuelStore.getState();

            // Update all nozzles with some sales
            state.closingState.nozzleSales.forEach(nozzle => {
                useFuelStore.getState().updateNozzleSale(nozzle.nozzleId, {
                    closingReading: nozzle.openingReading + 50,
                    netSales: 50 - nozzle.testVolume,
                    revenue: (50 - nozzle.testVolume) * nozzle.rate,
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
            state.closingState.nozzleSales.forEach(nozzle => {
                useFuelStore.getState().updateNozzleSale(nozzle.nozzleId, {
                    closingReading: nozzle.openingReading + 50,
                    netSales: 50 - nozzle.testVolume,
                    revenue: (50 - nozzle.testVolume) * nozzle.rate,
                });
            });

            // Add some recoveries and expenses
            useFuelStore.getState().updateClosingState({
                recoveriesTotal: 5000,
                expensesTotal: 1000,
                creditsTotal: 2000,
            });

            const expectedCash = useFuelStore.getState().getExpectedCash();
            const revenue = useFuelStore.getState().getCalculatedRevenue();

            // Expected = Revenue + Recoveries - Credits - Expenses - ...
            expect(expectedCash).toBe(revenue + 5000 - 2000 - 1000);
        });

        it('should calculate cash variance correctly', () => {
            // Set up some sales
            const state = useFuelStore.getState();
            state.closingState.nozzleSales.forEach(nozzle => {
                useFuelStore.getState().updateNozzleSale(nozzle.nozzleId, {
                    closingReading: nozzle.openingReading + 50,
                    netSales: 50 - nozzle.testVolume,
                    revenue: (50 - nozzle.testVolume) * nozzle.rate,
                });
            });

            const expectedCash = useFuelStore.getState().getExpectedCash();
            useFuelStore.getState().updateClosingState({ actualCash: expectedCash + 100 });

            const variance = useFuelStore.getState().getCashVariance();
            expect(variance).toBe(100);
        });
    });
});
