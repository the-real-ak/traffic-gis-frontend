'use client';

import { ReactNode } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CameraLocation } from '@/lib/api';
import { BasemapType, basemapConfigs } from './BasemapSelector';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EnhancedMapContainerProps {
    cameras: CameraLocation[];
    heatmapData: Array<[number, number, number]>;
    center?: [number, number];
    zoom?: number;
    basemap?: BasemapType;
    children?: ReactNode;
}

export default function EnhancedMapContainer({
    cameras,
    heatmapData,
    center = [0, 0],
    zoom = 2,
    basemap = 'osm',
    children,
}: EnhancedMapContainerProps) {
    // Calculate center from cameras if available
    const mapCenter: [number, number] = cameras.length > 0
        ? [
            cameras.reduce((sum, cam) => sum + cam.latitude, 0) / cameras.length,
            cameras.reduce((sum, cam) => sum + cam.longitude, 0) / cameras.length,
        ]
        : center;

    const mapZoom = cameras.length > 0 ? 10 : zoom;
    const tileConfig = basemapConfigs[basemap];

    return (
        <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md relative">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution={tileConfig.attribution}
                    url={tileConfig.url}
                />

                {/* Render all children inside MapContainer so they have map context */}
                {children}
            </MapContainer>

            <style jsx global>{`
                .custom-camera-marker {
                    width: 32px;
                    height: 32px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
                
                .custom-camera-marker svg {
                    transform: rotate(45deg);
                }
                
                .camera-marker-wrapper {
                    background: transparent !important;
                    border: none !important;
                }
                
                .marker-cluster-small {
                    background-color: rgba(59, 130, 246, 0.6);
                }
                
                .marker-cluster-medium {
                    background-color: rgba(245, 158, 11, 0.6);
                }
                
                .marker-cluster-large {
                    background-color: rgba(239, 68, 68, 0.6);
                }
                
                .marker-cluster {
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                .cluster-inner {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
}
