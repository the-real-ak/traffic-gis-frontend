'use client';

import { useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { useMap } from 'react-leaflet';
import { CameraLocation } from '@/lib/api';

interface HeatmapLayerProps {
    points: Array<[number, number, number]>;
}

function HeatmapLayer({ points }: HeatmapLayerProps) {
    const map = useMap();

    useEffect(() => {
        if (!map || points.length === 0) return;

        // @ts-ignore - leaflet.heat types
        const heatLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.0: 'blue',
                0.5: 'yellow',
                1.0: 'red',
            },
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
}

interface MapContentProps {
    cameras: CameraLocation[];
    heatmapData: Array<[number, number, number]>;
    showClustering?: boolean;
}

export default function MapContent({ cameras, heatmapData, showClustering }: MapContentProps) {
    return (
        <>
            {/* Camera markers - only if not using clustering */}
            {!showClustering && cameras.map((camera) => {
                const density = camera.trafficDensity || 0;
                let color = '#3b82f6'; // blue - low density

                if (density > 0.7) {
                    color = '#ef4444'; // red - high density
                } else if (density > 0.4) {
                    color = '#f59e0b'; // orange - medium density
                }

                const icon = L.divIcon({
                    html: `
                        <div class="custom-camera-marker" style="background-color: ${color};">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        </div>
                    `,
                    className: 'camera-marker-wrapper',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                return (
                    <Marker
                        key={camera.cameraId}
                        position={[camera.latitude, camera.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{camera.cameraId}</p>
                                <p className="text-gray-600">
                                    {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
                                </p>
                                {camera.trafficDensity !== undefined && (
                                    <p style={{ color }} className="mt-1 font-semibold">
                                        Density: {(camera.trafficDensity * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Heatmap layer */}
            {heatmapData.length > 0 && <HeatmapLayer points={heatmapData} />}
        </>
    );
}
