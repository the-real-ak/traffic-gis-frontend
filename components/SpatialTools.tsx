'use client';

import { useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { CameraLocation } from '@/lib/api';

interface SpatialToolsProps {
    cameras: CameraLocation[];
}

export default function SpatialTools({ cameras }: SpatialToolsProps) {
    const map = useMap();
    const [activeBuffers, setActiveBuffers] = useState<L.Circle[]>([]);
    const [measuring, setMeasuring] = useState(false);
    const [measurementLine, setMeasurementLine] = useState<L.Polyline | null>(null);
    const [measurementPoints, setMeasurementPoints] = useState<L.LatLng[]>([]);

    // Clear all buffers
    const clearBuffers = () => {
        activeBuffers.forEach(buffer => map.removeLayer(buffer));
        setActiveBuffers([]);
    };

    // Create buffer zones around cameras
    const createBufferZone = (radiusKm: number) => {
        clearBuffers();
        const newBuffers: L.Circle[] = [];

        cameras.forEach(camera => {
            const circle = L.circle([camera.latitude, camera.longitude], {
                radius: radiusKm * 1000, // Convert km to meters
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
            });

            circle.bindPopup(`
                <div style="text-align: center;">
                    <strong>${camera.cameraId}</strong><br/>
                    Buffer: ${radiusKm}km radius
                </div>
            `);

            circle.addTo(map);
            newBuffers.push(circle);
        });

        setActiveBuffers(newBuffers);
    };

    // Start distance measurement
    const startMeasurement = () => {
        setMeasuring(true);
        setMeasurementPoints([]);

        if (measurementLine) {
            map.removeLayer(measurementLine);
            setMeasurementLine(null);
        }

        const handleMapClick = (e: L.LeafletMouseEvent) => {
            const newPoints = [...measurementPoints, e.latlng];
            setMeasurementPoints(newPoints);

            if (newPoints.length >= 2) {
                // Calculate distance
                const from = turf.point([newPoints[0].lng, newPoints[0].lat]);
                const to = turf.point([newPoints[newPoints.length - 1].lng, newPoints[newPoints.length - 1].lat]);
                const distance = turf.distance(from, to, { units: 'kilometers' });

                // Draw line
                if (measurementLine) {
                    map.removeLayer(measurementLine);
                }

                const line = L.polyline(newPoints, {
                    color: '#ef4444',
                    weight: 3,
                    dashArray: '10, 10',
                });

                line.bindPopup(`
                    <div style="text-align: center;">
                        <strong>Distance</strong><br/>
                        ${distance.toFixed(2)} km<br/>
                        ${(distance * 0.621371).toFixed(2)} miles
                    </div>
                `).openPopup();

                line.addTo(map);
                setMeasurementLine(line);
            }
        };

        map.on('click', handleMapClick);
    };

    // Stop measurement
    const stopMeasurement = () => {
        setMeasuring(false);
        map.off('click');
    };

    // Clear measurement
    const clearMeasurement = () => {
        if (measurementLine) {
            map.removeLayer(measurementLine);
            setMeasurementLine(null);
        }
        setMeasurementPoints([]);
        stopMeasurement();
    };

    // Find cameras within radius of a point
    const findNearby = (centerLat: number, centerLng: number, radiusKm: number) => {
        const center = turf.point([centerLng, centerLat]);
        const options = { units: 'kilometers' as const };

        const nearbyCameras = cameras.filter(camera => {
            const cameraPoint = turf.point([camera.longitude, camera.latitude]);
            const distance = turf.distance(center, cameraPoint, options);
            return distance <= radiusKm;
        });

        return nearbyCameras;
    };

    return (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/60 max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                🛠️ Spatial Tools
            </h3>

            {/* Buffer Zones */}
            <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Buffer Zones</p>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => createBufferZone(0.5)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                    >
                        500m
                    </button>
                    <button
                        onClick={() => createBufferZone(1)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                    >
                        1km
                    </button>
                    <button
                        onClick={() => createBufferZone(5)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                    >
                        5km
                    </button>
                    <button
                        onClick={clearBuffers}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Distance Measurement */}
            <div className="mb-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Distance Tool</p>
                <div className="flex gap-2">
                    {!measuring ? (
                        <button
                            onClick={startMeasurement}
                            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors"
                        >
                            📏 Measure Distance
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={stopMeasurement}
                                className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Stop
                            </button>
                            <button
                                onClick={clearMeasurement}
                                className="px-3 py-2 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Clear
                            </button>
                        </>
                    )}
                </div>
                {measuring && (
                    <p className="text-xs text-slate-600 mt-2">
                        Click on the map to measure distance between points
                    </p>
                )}
            </div>

            {/* Stats */}
            <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                    📍 <strong>{cameras.length}</strong> camera locations
                </p>
                {activeBuffers.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                        ⭕ <strong>{activeBuffers.length}</strong> active buffer zones
                    </p>
                )}
            </div>
        </div>
    );
}
