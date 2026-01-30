'use client';

import { useState } from 'react';
import { CameraLocation } from '@/lib/api';
import {
    camerasToGeoJSON,
    heatmapToGeoJSON,
    exportGeoJSON,
    exportKML,
    calculateSpatialStats
} from '@/lib/geoExport';

interface ExportPanelProps {
    cameras: CameraLocation[];
    heatmapData: Array<[number, number, number]>;
}

export default function ExportPanel({ cameras, heatmapData }: ExportPanelProps) {
    const [showPanel, setShowPanel] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleExportCamerasGeoJSON = () => {
        setExporting(true);
        const geojson = camerasToGeoJSON(cameras);
        exportGeoJSON(geojson, 'traffic_cameras.geojson');
        setTimeout(() => setExporting(false), 500);
    };

    const handleExportHeatmapGeoJSON = () => {
        setExporting(true);
        const geojson = heatmapToGeoJSON(heatmapData);
        exportGeoJSON(geojson, 'traffic_heatmap.geojson');
        setTimeout(() => setExporting(false), 500);
    };

    const handleExportKML = () => {
        setExporting(true);
        const geojson = camerasToGeoJSON(cameras);
        exportKML(geojson, 'traffic_cameras.kml');
        setTimeout(() => setExporting(false), 500);
    };

    const stats = calculateSpatialStats(cameras);

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="absolute bottom-8 right-4 z-[1000] px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl font-semibold text-sm transition-all"
            >
                💾 Export {showPanel ? '✕' : ''}
            </button>

            {/* Export Panel */}
            {showPanel && (
                <div className="absolute bottom-24 right-4 z-[1000] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/60 w-80 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-3">
                            📦 Export Data
                        </h3>

                        {/* Export Options */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-slate-600 mb-2">
                                    CAMERA LOCATIONS
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleExportCamerasGeoJSON}
                                        disabled={exporting || cameras.length === 0}
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                                    >
                                        <span>📄 GeoJSON</span>
                                        <span className="text-xs opacity-75">{cameras.length} pts</span>
                                    </button>
                                    <button
                                        onClick={handleExportKML}
                                        disabled={exporting || cameras.length === 0}
                                        className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                                    >
                                        <span>🌍 KML (Google Earth)</span>
                                        <span className="text-xs opacity-75">{cameras.length} pts</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-600 mb-2">
                                    HEATMAP DATA
                                </p>
                                <button
                                    onClick={handleExportHeatmapGeoJSON}
                                    disabled={exporting || heatmapData.length === 0}
                                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                                >
                                    <span>🔥 Heatmap GeoJSON</span>
                                    <span className="text-xs opacity-75">{heatmapData.length} pts</span>
                                </button>
                            </div>
                        </div>

                        {/* Spatial Statistics */}
                        {stats && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 mb-2">
                                    SPATIAL STATISTICS
                                </p>
                                <div className="space-y-1 text-xs text-slate-700">
                                    <div className="flex justify-between">
                                        <span>Total Cameras:</span>
                                        <strong>{stats.totalCameras}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Avg Distance:</span>
                                        <strong>{stats.averageDistance.toFixed(2)} km</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Centroid:</span>
                                        <strong>
                                            {stats.centroid[0].toFixed(4)}, {stats.centroid[1].toFixed(4)}
                                        </strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Distribution:</span>
                                        <strong className={stats.clustered ? 'text-orange-600' : 'text-green-600'}>
                                            {stats.clustered ? 'Clustered' : 'Dispersed'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {exporting && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-green-600 font-semibold">
                                    ✓ Exported successfully!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
