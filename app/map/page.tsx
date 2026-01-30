'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getMapData, MapData, MapFilters } from '@/lib/api';
import Link from 'next/link';
import { BasemapType } from '@/components/BasemapSelector';

// Import components dynamically to avoid SSR issues with Leaflet
const EnhancedMapContainer = dynamic(() => import('@/components/EnhancedMapContainer'), { ssr: false });
const MapContent = dynamic(() => import('@/components/MapContent'), { ssr: false });
const ClusterMarkers = dynamic(() => import('@/components/ClusterMarkers'), { ssr: false });
const SpatialTools = dynamic(() => import('@/components/SpatialTools'), { ssr: false });
const BasemapSelector = dynamic(() => import('@/components/BasemapSelector'), { ssr: false });
const MapSearch = dynamic(() => import('@/components/MapSearch'), { ssr: false });
const GeofenceManager = dynamic(() => import('@/components/GeofenceManager'), { ssr: false });
const ExportPanel = dynamic(() => import('@/components/ExportPanel'), { ssr: false });

const MapLoadingFallback = () => (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-slate-600 font-semibold">Loading GIS Map...</p>
        </div>
    </div>
);

export default function MapPage() {
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Map settings
    const [basemap, setBasemap] = useState<BasemapType>('osm');
    const [useClustering, setUseClustering] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(true);

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
        <main className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-white/30 rounded-full filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-slate-200/40 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gray-200/30 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
                                🗺️ Advanced GIS Map
                            </h1>
                            <p className="text-slate-600">
                                Interactive spatial analysis and visualization
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-white/60 backdrop-blur-md text-slate-800 rounded-xl hover:bg-white/80 transition-all font-semibold border border-white/60 shadow-lg"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* Filters Panel */}
                <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-6 border border-white/60">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-bold text-slate-800">🔍 Filters & Controls</h3>

                        {/* Map Controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUseClustering(!useClustering)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${useClustering
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                            >
                                {useClustering ? '✓ Clustering ON' : 'Clustering OFF'}
                            </button>
                            <button
                                onClick={() => setShowHeatmap(!showHeatmap)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showHeatmap
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                            >
                                {showHeatmap ? '✓ Heatmap ON' : 'Heatmap OFF'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="vehicleType" className="block text-sm font-medium text-slate-700 mb-1">
                                Vehicle Type
                            </label>
                            <select
                                id="vehicleType"
                                value={vehicleType}
                                onChange={(e) => setVehicleType(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                            >
                                <option value="all">All Vehicles</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="car">Car</option>
                                <option value="bus">Bus</option>
                                <option value="truck">Truck</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                value={timeRange.start}
                                onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                            />
                        </div>

                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                value={timeRange.end}
                                onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleApplyFilters}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Map Container */}
                {loading ? (
                    <MapLoadingFallback />
                ) : error ? (
                    <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/60">
                        <p className="text-red-600 font-medium">❌ {error}</p>
                    </div>
                ) : mapData ? (
                    <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/60">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                                Showing <span className="font-semibold text-slate-800">{mapData.cameras.length}</span> camera location(s)
                            </p>
                            <div className="flex gap-2 text-xs">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                    📊 {showHeatmap ? 'Heatmap Active' : 'Markers Only'}
                                </span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                                    🗺️ {basemap.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <EnhancedMapContainer
                                cameras={mapData.cameras}
                                heatmapData={showHeatmap ? mapData.heatmapData : []}
                                basemap={basemap}
                            >
                                {/* All components that use useMap() must be children of MapContainer */}
                                <MapContent
                                    cameras={mapData.cameras}
                                    heatmapData={showHeatmap ? mapData.heatmapData : []}
                                    showClustering={useClustering}
                                />

                                {/* Basemap Selector */}
                                <BasemapSelector
                                    currentBasemap={basemap}
                                    onBasemapChange={setBasemap}
                                />

                                {/* Search */}
                                <MapSearch />

                                {/* Clustering or Spatial Tools */}
                                {useClustering ? (
                                    <ClusterMarkers cameras={mapData.cameras} />
                                ) : (
                                    <SpatialTools cameras={mapData.cameras} />
                                )}

                                {/* Geofencing */}
                                <GeofenceManager cameras={mapData.cameras} />
                            </EnhancedMapContainer>

                            {/* Export Panel - outside map since it doesn't use map context */}
                            <ExportPanel
                                cameras={mapData.cameras}
                                heatmapData={mapData.heatmapData}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/60 text-center">
                        <p className="text-slate-600">No data available</p>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-6 bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/60">
                    <h3 className="text-lg font-bold mb-4 text-slate-800">📖 Map Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full border-3 border-white shadow-lg"></div>
                            <span className="text-sm text-slate-700 font-medium">Low Density</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full border-3 border-white shadow-lg"></div>
                            <span className="text-sm text-slate-700 font-medium">Medium Density</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg"></div>
                            <span className="text-sm text-slate-700 font-medium">High Density</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                                10+
                            </div>
                            <span className="text-sm text-slate-700 font-medium">Camera Cluster</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </main>
    );
}
