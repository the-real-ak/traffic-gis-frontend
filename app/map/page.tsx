'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getMapData, MapData, MapFilters } from '@/lib/api';
import Link from 'next/link';

// Import MapView dynamically to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Loading map...</p>
        </div>
    ),
});

export default function MapPage() {
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [vehicleType, setVehicleType] = useState<string>('all');
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });

    const fetchMapData = async (filters?: MapFilters) => {
        try {
            setLoading(true);
            const data = await getMapData(filters);
            setMapData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMapData();
    }, []);

    const handleApplyFilters = () => {
        const filters: MapFilters = {};

        if (vehicleType !== 'all') {
            filters.vehicleType = vehicleType as 'motorcycle' | 'car' | 'bus' | 'truck';
        }

        if (timeRange.start && timeRange.end) {
            filters.timeRange = timeRange;
        }

        fetchMapData(filters);
    };

    const handleResetFilters = () => {
        setVehicleType('all');
        setTimeRange({ start: '', end: '' });
        fetchMapData();
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">GIS Map View</h1>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Back to Upload
                        </Link>
                    </div>
                    <p className="text-gray-600">
                        View camera locations and traffic density heatmaps
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Filters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Type
                            </label>
                            <select
                                id="vehicleType"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Vehicles</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="car">Car</option>
                                <option value="bus">Bus</option>
                                <option value="truck">Truck</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                value={timeRange.start}
                                onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                value={timeRange.end}
                                onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Map */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading map data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                ) : mapData ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{mapData.cameras.length}</span> camera location(s)
                            </p>
                        </div>
                        <MapView
                            cameras={mapData.cameras}
                            heatmapData={mapData.heatmapData}
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">No data available</p>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Heatmap Legend</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">Low Density</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-yellow-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">Medium Density</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-500 rounded mr-2"></div>
                            <span className="text-sm text-gray-700">High Density</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
