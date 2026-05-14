import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station } from '@/types';

interface StationMasterState {
    stations: Station[];
    activeStationId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    addStation: (station: Station) => void;
    updateStation: (stationId: string, updates: Partial<Station>) => void;
    deleteStation: (stationId: string) => void;
    setActiveStation: (stationId: string) => void;
    getStationById: (stationId: string) => Station | undefined;
}

const defaultStations: Station[] = [
    {
        stationId: 'STN-1',
        name: 'Main Highway Station',
        location: { lat: 33.6844, lng: 73.0479 },
        ograLicenceNumber: 'OGRA-12345',
        owner: 'Motorway Oil Enterprise',
        establishmentDate: '2020-01-15',
        address: {
            street: '123 Highway Road',
            city: 'Islamabad',
            state: 'Federal Capital',
            country: 'Pakistan',
            postalCode: '44000',
        },
        settings: {
            currency: 'PKR',
            timezone: 'Asia/Karachi',
            theme: 'glassy-white',
            language: 'en',
            taxRate: 18,
        },
        createdAt: new Date().toISOString(),
    },
];

export const useStationMasterStore = create<StationMasterState>()(
    persist(
        (set, get) => ({
            stations: defaultStations,
            activeStationId: 'STN-1',
            isLoading: false,
            error: null,

            addStation: (station) => {
                set((state) => ({ stations: [...state.stations, station] }));
            },

            updateStation: (stationId, updates) => {
                set((state) => ({
                    stations: state.stations.map((s) =>
                        s.stationId === stationId ? { ...s, ...updates } : s
                    ),
                }));
            },

            deleteStation: (stationId) => {
                set((state) => ({
                    stations: state.stations.filter((s) => s.stationId !== stationId),
                }));
            },

            setActiveStation: (stationId) => {
                set({ activeStationId: stationId });
            },

            getStationById: (stationId) => {
                return get().stations.find((s) => s.stationId === stationId);
            },
        }),
        {
            name: 'motorway-station-master',
        }
    )
);
