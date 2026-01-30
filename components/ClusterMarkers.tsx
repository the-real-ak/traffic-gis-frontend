'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { CameraLocation } from '@/lib/api';

interface ClusterMarkersProps {
    cameras: CameraLocation[];
    onCameraClick?: (camera: CameraLocation) => void;
}

export default function ClusterMarkers({ cameras, onCameraClick }: ClusterMarkersProps) {
    const map = useMap();

    useEffect(() => {
        if (!map || cameras.length === 0) return;

        // Create marker cluster group
        const markers = L.markerClusterGroup({
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 80,
            spiderfyOnMaxZoom: true,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let size = 'small';
                let sizeClass = 40;

                if (count > 100) {
                    size = 'large';
                    sizeClass = 60;
                } else if (count > 10) {
                    size = 'medium';
                    sizeClass = 50;
                }

                return L.divIcon({
                    html: `<div class="cluster-inner"><span>${count}</span></div>`,
                    className: `marker-cluster marker-cluster-${size}`,
                    iconSize: L.point(sizeClass, sizeClass),
                });
            },
        });

        // Add markers to cluster group
        cameras.forEach((camera) => {
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

            const marker = L.marker([camera.latitude, camera.longitude], { icon });

            marker.bindPopup(`
                <div class="camera-popup">
                    <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${camera.cameraId}</h3>
                    <p style="color: #666; font-size: 14px; margin-bottom: 4px;">
                        📍 ${camera.latitude.toFixed(4)}, ${camera.longitude.toFixed(4)}
                    </p>
                    ${camera.trafficDensity !== undefined ? `
                        <p style="color: ${color}; font-weight: 600; font-size: 14px; margin-top: 8px;">
                            Traffic Density: ${(camera.trafficDensity * 100).toFixed(1)}%
                        </p>
                    ` : ''}
                    <button 
                        onclick="window.location.href='/results/${camera.cameraId}'"
                        style="margin-top: 8px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;"
                    >
                        View Details →
                    </button>
                </div>
            `);

            if (onCameraClick) {
                marker.on('click', () => onCameraClick(camera));
            }

            markers.addLayer(marker);
        });

        map.addLayer(markers);

        // Cleanup
        return () => {
            map.removeLayer(markers);
        };
    }, [map, cameras, onCameraClick]);

    return null;
}
