import axios from 'axios';

// Backend API base URL - adjust as needed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface UploadVideoPayload {
    cameraId: string;
    latitude: number;
    longitude: number;
    videoFile: File;
}

export interface ProcessingStatus {
    fileName: string;
    status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
    cameraId?: string;
}

export interface VehicleCount {
    motorcycle: number;
    car: number;
    bus: number;
    truck: number;
}

export interface TimeSeriesData {
    timestamp: string;
    counts: VehicleCount;
}

export interface ResultData {
    cameraId: string;
    totalCounts: VehicleCount;
    timeSeries: TimeSeriesData[];
    processedVideoUrl?: string;
    csvDownloadUrl?: string;
}

export interface CameraLocation {
    cameraId: string;
    latitude: number;
    longitude: number;
    trafficDensity?: number;
}

export interface MapData {
    cameras: CameraLocation[];
    heatmapData: Array<[number, number, number]>; // [lat, lng, intensity]
}

export interface MapFilters {
    vehicleType?: 'motorcycle' | 'car' | 'bus' | 'truck';
    timeRange?: {
        start: string;
        end: string;
    };
}

/**
 * Upload video file with camera metadata
 */
export async function uploadVideo(payload: UploadVideoPayload): Promise<{ success: boolean; message: string; cameraId?: string }> {
    const formData = new FormData();
    formData.append('video', payload.videoFile);
    formData.append('cameraId', payload.cameraId);
    formData.append('latitude', payload.latitude.toString());
    formData.append('longitude', payload.longitude.toString());

    try {
        const response = await axios.post(`${API_BASE_URL}/upload-video`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload Progress: ${percentCompleted}%`);
                }
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to upload video');
        }
        throw error;
    }
}

/**
 * Get processing status for a video
 */
export async function getProcessingStatus(cameraId: string): Promise<ProcessingStatus> {
    try {
        const response = await axios.get(`${API_BASE_URL}/process-video/status`, {
            params: { cameraId },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to get processing status');
        }
        throw error;
    }
}

/**
 * Get results for a specific camera
 */
export async function getResults(cameraId: string): Promise<ResultData> {
    try {
        const response = await axios.get(`${API_BASE_URL}/results/${cameraId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to get results');
        }
        throw error;
    }
}

/**
 * Get map data with optional filters
 */
export async function getMapData(filters?: MapFilters): Promise<MapData> {
    try {
        const response = await axios.get(`${API_BASE_URL}/results`, {
            params: filters,
            timeout: 5000, // 5 second timeout
        });
        return response.data;
    } catch (error) {
        // Fallback to mock data if backend is unavailable
        console.warn('Backend unavailable, using mock data for demonstration');

        // Import mock data dynamically
        const { getMockMapData } = await import('./mockData');
        return getMockMapData();
    }
}

/**
 * Download CSV for a specific camera
 */
export function getCSVDownloadUrl(cameraId: string): string {
    return `${API_BASE_URL}/results/${cameraId}/csv`;
}
