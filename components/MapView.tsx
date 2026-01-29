'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { CameraLocation } from '@/lib/api';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface MapViewProps {
    cameras: CameraLocation[];
    heatmapData: Array<[number, number, number]>;
    center?: [number, number];
    zoom?: number;
}

export default function MapView({
    cameras,
    heatmapData,
    center = [0, 0],
    zoom = 2
}: MapViewProps) {
    // Calculate center from cameras if available
    const mapCenter: [number, number] = cameras.length > 0
        ? [
            cameras.reduce((sum, cam) => sum + cam.latitude, 0) / cameras.length,
            cameras.reduce((sum, cam) => sum + cam.longitude, 0) / cameras.length,
        ]
        : center;

    const mapZoom = cameras.length > 0 ? 10 : zoom;

    return (
        <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Camera markers */}
                {cameras.map((camera) => (
                    <Marker
                        key={camera.cameraId}
                        position={[camera.latitude, camera.longitude]}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{camera.cameraId}</p>
                                <p className="text-gray-600">
                                    {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
                                </p>
                                {camera.trafficDensity !== undefined && (
                                    <p className="text-blue-600 mt-1">
                                        Density: {camera.trafficDensity.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Heatmap layer */}
                {heatmapData.length > 0 && <HeatmapLayer points={heatmapData} />}
            </MapContainer>
        </div>
    );
}
