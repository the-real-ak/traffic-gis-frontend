import * as turf from '@turf/turf';
import { saveAs } from 'file-saver';
import { CameraLocation, VehicleCount } from './api';

/**
 * Convert camera locations to GeoJSON FeatureCollection
 */
export function camerasToGeoJSON(cameras: CameraLocation[]) {
    const features = cameras.map(camera => ({
        type: 'Feature' as const,
        geometry: {
            type: 'Point' as const,
            coordinates: [camera.longitude, camera.latitude],
        },
        properties: {
            cameraId: camera.cameraId,
            trafficDensity: camera.trafficDensity || 0,
        },
    }));

    return {
        type: 'FeatureCollection' as const,
        features,
    };
}

/**
 * Convert heatmap data to GeoJSON FeatureCollection
 */
export function heatmapToGeoJSON(heatmapData: Array<[number, number, number]>) {
    const features = heatmapData.map((point, index) => ({
        type: 'Feature' as const,
        geometry: {
            type: 'Point' as const,
            coordinates: [point[1], point[0]], // [lng, lat]
        },
        properties: {
            intensity: point[2],
            pointId: index,
        },
    }));

    return {
        type: 'FeatureCollection' as const,
        features,
    };
}

/**
 * Export GeoJSON to file
 */
export function exportGeoJSON(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, filename);
}

/**
 * Convert GeoJSON to KML
 */
export function geoJSONToKML(geojson: any, name: string = 'Traffic Data'): string {
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${name}</name>
    <description>Traffic camera locations and data</description>
    
    <!-- Styles -->
    <Style id="lowDensity">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <Style id="mediumDensity">
      <IconStyle>
        <color>ff00a5ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/orange-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    <Style id="highDensity">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.4</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    ${geojson.features.map((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;
        const density = feature.properties.trafficDensity || 0;
        const styleUrl = density > 0.7 ? '#highDensity' : density > 0.4 ? '#mediumDensity' : '#lowDensity';

        return `
    <Placemark>
      <name>${feature.properties.cameraId || 'Camera'}</name>
      <description>Traffic Density: ${(density * 100).toFixed(1)}%</description>
      <styleUrl>${styleUrl}</styleUrl>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>`;
    }).join('\n')}
    
  </Document>
</kml>`;

    return kml;
}

/**
 * Export KML to file
 */
export function exportKML(geojson: any, filename: string) {
    const kml = geoJSONToKML(geojson);
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    saveAs(blob, filename);
}

/**
 * Create heatmap grid for visualization
 */
export function createHeatmapGrid(
    cameras: CameraLocation[],
    gridSizeKm: number = 1
): Array<[number, number, number]> {
    if (cameras.length === 0) return [];

    // Get bounding box
    const lats = cameras.map(c => c.latitude);
    const lngs = cameras.map(c => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Create grid
    const cellSize = gridSizeKm;
    const squareGrid = turf.squareGrid(
        [minLng, minLat, maxLng, maxLat],
        cellSize,
        { units: 'kilometers' }
    );

    // Count cameras in each cell
    const heatmapData: Array<[number, number, number]> = [];

    squareGrid.features.forEach(cell => {
        let count = 0;
        let totalDensity = 0;

        cameras.forEach(camera => {
            const point = turf.point([camera.longitude, camera.latitude]);
            if (turf.booleanPointInPolygon(point, cell)) {
                count++;
                totalDensity += camera.trafficDensity || 0.5;
            }
        });

        if (count > 0) {
            const center = turf.centroid(cell);
            const [lng, lat] = center.geometry.coordinates;
            const intensity = totalDensity / count; // Average density
            heatmapData.push([lat, lng, intensity]);
        }
    });

    return heatmapData;
}

/**
 * Calculate spatial statistics
 */
export interface SpatialStats {
    totalCameras: number;
    boundingBox: {
        minLat: number;
        maxLat: number;
        minLng: number;
        maxLng: number;
    };
    centroid: [number, number];
    averageDistance: number; // km between cameras
    clustered: boolean;
}

export function calculateSpatialStats(cameras: CameraLocation[]): SpatialStats | null {
    if (cameras.length === 0) return null;

    const lats = cameras.map(c => c.latitude);
    const lngs = cameras.map(c => c.longitude);

    const points = cameras.map(c => turf.point([c.longitude, c.latitude]));
    const featureCollection = turf.featureCollection(points);
    const center = turf.center(featureCollection);

    // Calculate average distance
    let totalDistance = 0;
    let pairs = 0;

    for (let i = 0; i < cameras.length; i++) {
        for (let j = i + 1; j < cameras.length; j++) {
            const from = turf.point([cameras[i].longitude, cameras[i].latitude]);
            const to = turf.point([cameras[j].longitude, cameras[j].latitude]);
            totalDistance += turf.distance(from, to, { units: 'kilometers' });
            pairs++;
        }
    }

    const avgDistance = pairs > 0 ? totalDistance / pairs : 0;

    return {
        totalCameras: cameras.length,
        boundingBox: {
            minLat: Math.min(...lats),
            maxLat: Math.max(...lats),
            minLng: Math.min(...lngs),
            maxLng: Math.max(...lngs),
        },
        centroid: [center.geometry.coordinates[1], center.geometry.coordinates[0]],
        averageDistance: avgDistance,
        clustered: avgDistance < 5, // Arbitrary threshold
    };
}

/**
 * Export CSV with vehicle counts
 */
export function exportVehicleCSV(
    cameraId: string,
    timeSeries: Array<{ timestamp: string; counts: VehicleCount }>
) {
    const headers = ['Timestamp', 'Motorcycle', 'Car', 'Bus', 'Truck', 'Total'];
    const rows = timeSeries.map(entry => {
        const total = Object.values(entry.counts).reduce((sum, count) => sum + count, 0);
        return [
            entry.timestamp,
            entry.counts.motorcycle,
            entry.counts.car,
            entry.counts.bus,
            entry.counts.truck,
            total,
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${cameraId}_traffic_data.csv`);
}
