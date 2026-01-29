import UploadForm from '@/components/UploadForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Traffic Counting & GIS Visualization
          </h1>
          <p className="text-gray-600">
            Upload traffic camera footage for AI-powered vehicle counting and analysis
          </p>
        </div>

        <UploadForm />

        <div className="mt-8 text-center space-x-4">
          <Link
            href="/map"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            View GIS Map
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload an MP4 video file from a static traffic camera</li>
            <li>Provide camera location (latitude and longitude) and unique camera ID</li>
            <li>Monitor processing status as AI analyzes the footage</li>
            <li>View detailed vehicle counts, time-series analytics, and processed video</li>
            <li>Explore GIS map visualization with traffic density heatmaps</li>
            <li>Download GIS-ready CSV data for further analysis</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
