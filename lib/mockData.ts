import { MapData, CameraLocation } from './api';

/**
 * Mock camera data for testing GIS features
 */
export const mockCameras: CameraLocation[] = [
    {
        cameraId: 'CAM001',
        latitude: 28.6139,
        longitude: 77.2090,
        trafficDensity: 0.35,
    },
    {
        cameraId: 'CAM002',
        latitude: 28.6289,
        longitude: 77.2196,
        trafficDensity: 0.72,
    },
    {
        cameraId: 'CAM003',
        latitude: 28.5355,
        longitude: 77.3910,
        trafficDensity: 0.45,
    },
    {
        cameraId: 'CAM004',
        latitude: 28.7041,
        longitude: 77.1025,
        trafficDensity: 0.88,
    },
    {
        cameraId: 'CAM005',
        latitude: 28.5494,
        longitude: 77.2501,
        trafficDensity: 0.25,
    },
    {
        cameraId: 'CAM006',
        latitude: 28.6289,
        longitude: 77.2065,
        trafficDensity: 0.55,
    },
    {
        cameraId: 'CAM007',
        latitude: 28.6448,
        longitude: 77.2167,
        trafficDensity: 0.68,
    },
    {
        cameraId: 'CAM008',
        latitude: 28.6139,
        longitude: 77.2300,
        trafficDensity: 0.42,
    },
];

/**
 * Generate mock heatmap data based on camera locations
 */
export function generateMockHeatmap(): Array<[number, number, number]> {
    const heatmapData: Array<[number, number, number]> = [];

    // Create heatmap points around each camera
    mockCameras.forEach(camera => {
        // Add main point
        heatmapData.push([camera.latitude, camera.longitude, camera.trafficDensity || 0.5]);

        // Add surrounding points for better visualization
        for (let i = 0; i < 5; i++) {
            const latOffset = (Math.random() - 0.5) * 0.01;
            const lngOffset = (Math.random() - 0.5) * 0.01;
            const intensity = (camera.trafficDensity || 0.5) * (0.5 + Math.random() * 0.5);

            heatmapData.push([
                camera.latitude + latOffset,
                camera.longitude + lngOffset,
                intensity,
            ]);
        }
    });

    return heatmapData;
}

/**
 * Get mock map data
 */
export function getMockMapData(): MapData {
    return {
        cameras: mockCameras,
        heatmapData: generateMockHeatmap(),
    };
}

/**
 * Filter mock cameras by vehicle type (mock implementation)
 */
export function filterMockCameras(vehicleType?: string): CameraLocation[] {
    // In a real implementation, this would filter based on actual data
    // For now, just return all cameras with slightly adjusted densities
    if (!vehicleType || vehicleType === 'all') {
        return mockCameras;
    }

    // Simulate filtering by adjusting which cameras show higher density
    return mockCameras.map(cam => ({
        ...cam,
        trafficDensity: Math.random() * 0.9,
    }));
}
