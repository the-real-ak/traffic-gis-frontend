'use client';

import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as turf from '@turf/turf';
import { CameraLocation } from '@/lib/api';

interface Geofence {
    id: string;
    name: string;
    layer: L.Layer;
    type: 'polygon' | 'circle' | 'rectangle';
    color: string;
    camerasInside: number;
}

interface GeofenceManagerProps {
    cameras: CameraLocation[];
}

export default function GeofenceManager({ cameras }: GeofenceManagerProps) {
    const map = useMap();
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [drawControl, setDrawControl] = useState<L.Control.Draw | null>(null);
    const [featureGroup] = useState(() => L.featureGroup());
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        if (!map) return;

        // Add feature group to map
        featureGroup.addTo(map);

        // Create draw control
        const control = new L.Control.Draw({
            edit: {
                featureGroup: featureGroup,
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    shapeOptions: {
                        color: '#f59e0b',
                        weight: 3,
                        fillOpacity: 0.2,
                    },
                },
                circle: {
                    shapeOptions: {
                        color: '#3b82f6',
                        weight: 3,
                        fillOpacity: 0.2,
                    },
                },
                rectangle: {
                    shapeOptions: {
                        color: '#8b5cf6',
                        weight: 3,
                        fillOpacity: 0.2,
                    },
                },
                polyline: false,
                marker: false,
                circlemarker: false,
            },
        });

        setDrawControl(control);

        // Handle created shapes
        map.on(L.Draw.Event.CREATED, (event: any) => {
            const layer = event.layer;
            const type = event.layerType;

            featureGroup.addLayer(layer);

            // Count cameras inside
            const camerasInZone = countCamerasInGeofence(layer, type);

            // Create geofence object
            const newGeofence: Geofence = {
                id: `geofence-${Date.now()}`,
                name: `Zone ${geofences.length + 1}`,
                layer: layer,
                type: type,
                color: layer.options.color,
                camerasInside: camerasInZone,
            };

            // Add popup
            layer.bindPopup(`
                <div>
                    <strong>${newGeofence.name}</strong><br/>
                    Type: ${type}<br/>
                    Cameras inside: <strong>${camerasInZone}</strong>
                </div>
            `);

            setGeofences(prev => [...prev, newGeofence]);
        });

        // Handle deleted shapes
        map.on(L.Draw.Event.DELETED, (event: any) => {
            const layers = event.layers;
            layers.eachLayer((layer: L.Layer) => {
                setGeofences(prev => prev.filter(gf => gf.layer !== layer));
            });
        });

        return () => {
            map.removeLayer(featureGroup);
        };
    }, [map]);

    const countCamerasInGeofence = (layer: any, type: string): number => {
        let count = 0;

        cameras.forEach(camera => {
            const point = turf.point([camera.longitude, camera.latitude]);
            let isInside = false;

            if (type === 'circle') {
                const center = layer.getLatLng();
                const radius = layer.getRadius();
                const centerPoint = turf.point([center.lng, center.lat]);
                const distance = turf.distance(point, centerPoint, { units: 'meters' });
                isInside = distance <= radius;
            } else if (type === 'polygon' || type === 'rectangle') {
                const latlngs = layer.getLatLngs()[0];
                const coords = latlngs.map((ll: L.LatLng) => [ll.lng, ll.lat]);
                coords.push(coords[0]); // Close the polygon
                const polygon = turf.polygon([coords]);
                isInside = turf.booleanPointInPolygon(point, polygon);
            }

            if (isInside) count++;
        });

        return count;
    };

    const deleteGeofence = (id: string) => {
        const geofence = geofences.find(gf => gf.id === id);
        if (geofence) {
            featureGroup.removeLayer(geofence.layer);
            setGeofences(prev => prev.filter(gf => gf.id !== id));
        }
    };

    const zoomToGeofence = (geofence: Geofence) => {
        if (geofence.type === 'circle') {
            const circle = geofence.layer as L.Circle;
            map.fitBounds(circle.getBounds());
        } else {
            const layer = geofence.layer as L.Polygon;
            map.fitBounds(layer.getBounds());
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="absolute bottom-24 right-4 z-[1000] px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-2xl font-semibold text-sm transition-all"
            >
                🔷 Geofencing {showPanel ? '✕' : ''}
            </button>

            {/* Geofence Panel */}
            {showPanel && (
                <div className="absolute bottom-40 right-4 z-[1000] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/60 w-80 max-h-96 overflow-hidden">
                    <div className="p-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-3">
                            Geofence Manager
                        </h3>

                        {/* Drawing Tools */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-600 mb-2">DRAW TOOLS</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (drawControl) {
                                            map.addControl(drawControl);
                                        }
                                    }}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex-1"
                                >
                                    Enable Drawing
                                </button>
                                <button
                                    onClick={() => {
                                        if (drawControl) {
                                            map.removeControl(drawControl);
                                        }
                                    }}
                                    className="px-3 py-2 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    Disable
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Enable drawing, then use the toolbar on the map to draw zones
                            </p>
                        </div>

                        {/* Geofences List */}
                        <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2">
                                ZONES ({geofences.length})
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {geofences.length === 0 ? (
                                    <p className="text-xs text-slate-500 text-center py-4">
                                        No geofences created yet
                                    </p>
                                ) : (
                                    geofences.map(gf => (
                                        <div
                                            key={gf.id}
                                            className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-800">
                                                        {gf.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 capitalize">{gf.type}</p>
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full border-2"
                                                    style={{ borderColor: gf.color }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-600 mb-2">
                                                📍 <strong>{gf.camerasInside}</strong> cameras inside
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => zoomToGeofence(gf)}
                                                    className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200 transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => deleteGeofence(gf.id)}
                                                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
