# Traffic Counting & GIS Visualization Frontend

A Next.js application for AI-based traffic counting and GIS visualization using static camera footage.

## Features

- **Video Upload**: Upload MP4 traffic camera videos with location metadata
- **Processing Status**: Real-time monitoring of video processing
- **Results Dashboard**: Detailed vehicle counts, time-series charts, and processed video preview
- **GIS Map View**: Interactive map with camera locations and traffic density heatmaps

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: Leaflet.js with heatmap plugin
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see Backend API Endpoints section)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /page.tsx                    → Upload page (/)
  /status/page.tsx             → Processing status (/status)
  /results/[cameraId]/page.tsx → Results dashboard (/results/:cameraId)
  /map/page.tsx                → GIS map (/map)
  
/components
  UploadForm.tsx               → Video upload form with validation
  VehicleStats.tsx             → Vehicle count statistics display
  TrafficChart.tsx             → Time-series traffic chart
  MapView.tsx                  → Leaflet map with markers and heatmap
  
/lib
  api.ts                       → API client functions and TypeScript interfaces
```

## Backend API Endpoints

The frontend expects the following REST API endpoints:

### POST /upload-video
Upload video with camera metadata
- **Request**: multipart/form-data
  - `video`: File (MP4)
  - `cameraId`: string
  - `latitude`: number
  - `longitude`: number
- **Response**: `{ success: boolean, message: string, cameraId?: string }`

### GET /process-video/status
Get processing status
- **Query Params**: `cameraId` (string)
- **Response**: `{ fileName: string, status: 'Queued' | 'Processing' | 'Completed' | 'Failed', cameraId?: string }`

### GET /results/:cameraId
Get results for a specific camera
- **Response**: 
```typescript
{
  cameraId: string;
  totalCounts: {
    motorcycle: number;
    car: number;
    bus: number;
    truck: number;
  };
  timeSeries: Array<{
    timestamp: string;
    counts: VehicleCount;
  }>;
  processedVideoUrl?: string;
  csvDownloadUrl?: string;
}
```

### GET /results
Get map data with optional filters
- **Query Params**: 
  - `vehicleType?`: 'motorcycle' | 'car' | 'bus' | 'truck'
  - `timeRange?`: JSON object with start and end dates
- **Response**:
```typescript
{
  cameras: Array<{
    cameraId: string;
    latitude: number;
    longitude: number;
    trafficDensity?: number;
  }>;
  heatmapData: Array<[number, number, number]>; // [lat, lng, intensity]
}
```

### GET /results/:cameraId/csv
Download CSV data for a specific camera

## Page Workflows

### 1. Video Upload Flow
1. User fills in Camera ID, Latitude, Longitude
2. User selects MP4 video file
3. Form validates inputs (lat: -90 to 90, lng: -180 to 180, MP4 format)
4. Video uploads to backend `/upload-video`
5. Redirect to `/status?cameraId=XXX`

### 2. Processing Status Flow
1. Page polls `/process-video/status` every 3 seconds
2. Displays current status: Queued → Processing → Completed/Failed
3. Auto-redirects to `/results/:cameraId` when completed

### 3. Results Dashboard
1. Fetches data from `/results/:cameraId`
2. Displays total vehicle counts by category
3. Shows time-series chart of traffic patterns
4. Embeds processed video preview (if available)
5. Provides CSV download button

### 4. GIS Map View
1. Fetches all camera locations and traffic data from `/results`
2. Displays camera markers on Leaflet map
3. Overlays traffic density heatmap
4. Allows filtering by vehicle type and time range
5. Updates map dynamically based on filters

## Building for Production

```bash
npm run build
npm start
```

## Notes

- No authentication required
- No live streaming support
- Designed for local deployment
- Focus on traffic counting and GIS visualization only
