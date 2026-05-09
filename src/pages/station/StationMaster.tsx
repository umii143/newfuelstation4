import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { MapPin, Building2, Droplet, Settings, Plus, Save, Activity } from 'lucide-react';
import { useStationMasterStore } from '@/stores/stationMasterStore';
import { useFuelStore } from '@/stores/fuelStore';
import type { Station } from '@/types';

export default function StationMaster() {
    const { stations, activeStationId, setActiveStation, updateStation } = useStationMasterStore();
    const { tanks, nozzles, updateTank } = useFuelStore();

    const [editingStation, setEditingStation] = useState<Station | null>(null);

    const handleSaveStation = () => {
        if (editingStation) {
            updateStation(editingStation.stationId, editingStation);
            setEditingStation(null);
        }
    };

    const activeStation = stations.find(s => s.stationId === activeStationId) || stations[0];
    const stationTanks = tanks.filter(t => t.stationId === activeStationId || t.stationId === 'STN-CONFIGURE');
    const stationNozzles = nozzles.filter(n => stationTanks.some(t => t.tankId === n.tankId));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Station Master
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Configure stations, tanks (manual dip), and nozzles.
                    </p>
                </div>
            </div>

            {/* Station Selector */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {stations.map(station => (
                    <Card 
                        key={station.stationId} 
                        className={`min-w-[250px] cursor-pointer transition-all ${
                            activeStationId === station.stationId 
                            ? 'ring-2 ring-blue-500 border-blue-500' 
                            : 'hover:border-blue-300'
                        }`}
                        onClick={() => setActiveStation(station.stationId)}
                    >
                        <div className="p-4 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                                activeStationId === station.stationId ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{station.name}</h3>
                                <p className="text-xs text-gray-500">{station.ograLicenceNumber || 'No License'}</p>
                            </div>
                        </div>
                    </Card>
                ))}
                <Button variant="secondary" className="h-[88px] min-w-[250px] border-dashed text-gray-500">
                    <Plus className="mr-2 h-4 w-4" /> Add Station
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Station Details */}
                <Card className="lg:col-span-1 shadow-sm border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 p-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            Station Profile
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Station Name</label>
                            <Input 
                                value={editingStation?.name ?? activeStation.name} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingStation({...activeStation, name: e.target.value})}
                                disabled={!editingStation}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">OGRA Licence</label>
                            <Input 
                                value={editingStation?.ograLicenceNumber ?? activeStation.ograLicenceNumber} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingStation({...activeStation, ograLicenceNumber: e.target.value})}
                                disabled={!editingStation}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Owner</label>
                            <Input 
                                value={editingStation?.owner ?? activeStation.owner} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingStation({...activeStation, owner: e.target.value})}
                                disabled={!editingStation}
                            />
                        </div>
                        {editingStation ? (
                            <Button onClick={handleSaveStation} className="w-full">
                                <Save className="mr-2 h-4 w-4" /> Save Profile
                            </Button>
                        ) : (
                            <Button variant="secondary" onClick={() => setEditingStation(activeStation)} className="w-full">
                                <Settings className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Tanks & Nozzles */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200 dark:border-gray-800">
                    <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex flex-row justify-between items-center p-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Droplet className="h-5 w-5 text-emerald-500" />
                            Tanks & Dip-Stick Configuration
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="space-y-6">
                            {stationTanks.map(tank => (
                                <div key={tank.tankId} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-semibold text-lg">{tank.name} ({tank.fuelType})</h4>
                                            <p className="text-sm text-gray-500">Capacity: {tank.capacity.toLocaleString()} L</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Safe Fill Level</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input 
                                                    type="number" 
                                                    className="w-24 text-right h-8"
                                                    value={tank.safeFillLevel || (tank.capacity * 0.9)}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTank(tank.tankId, { safeFillLevel: Number(e.target.value) })}
                                                />
                                                <span className="text-sm text-gray-500">L</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">
                                        <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-blue-500" />
                                            Assigned Nozzles (Manual Meters)
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {stationNozzles.filter(n => n.tankId === tank.tankId).map(nozzle => (
                                                <div key={nozzle.nozzleId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                                                    <span className="text-sm font-medium">{nozzle.name}</span>
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{nozzle.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
