'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getResults, getCSVDownloadUrl, ResultData } from '@/lib/api';
import VehicleStats from '@/components/VehicleStats';
import TrafficChart from '@/components/TrafficChart';
import Link from 'next/link';

export default function ResultsPage() {
    const params = useParams();
    const cameraId = params.cameraId as string;

    const [results, setResults] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await getResults(cameraId);
                setResults(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };

        if (cameraId) {
            fetchResults();
        }
    }, [cameraId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading results...</p>
                </div>
            </main>
        );
    }

    if (error || !results) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700 mb-6">{error || 'Results not found'}</p>
                    <Link
                        href="/"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Upload
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Results Dashboard
                        </h1>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Back to Upload
                        </Link>
                    </div>
                    <p className="text-gray-600">Camera ID: <span className="font-semibold">{cameraId}</span></p>
                </div>

                {/* Vehicle Statistics */}
                <div className="mb-8">
                    <VehicleStats counts={results.totalCounts} />
                </div>

                {/* Time Series Chart */}
                {results.timeSeries && results.timeSeries.length > 0 && (
                    <div className="mb-8">
                        <TrafficChart data={results.timeSeries} />
                    </div>
                )}

                {/* Processed Video Preview */}
                {results.processedVideoUrl && (
                    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Processed Video</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Video with bounding boxes, vehicle labels, and virtual counting line
                        </p>
                        <video
                            controls
                            className="w-full max-w-4xl mx-auto rounded-lg shadow-md"
                            src={results.processedVideoUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                {/* Download CSV */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Export Data</h3>
                    <p className="text-gray-600 mb-4">
                        Download GIS-ready CSV data for further analysis
                    </p>
                    <a
                        href={getCSVDownloadUrl(cameraId)}
                        download
                        className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                        📥 Download CSV
                    </a>
                </div>

                {/* Navigation */}
                <div className="mt-8 text-center">
                    <Link
                        href="/map"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                        View GIS Map
                    </Link>
                </div>
            </div>
        </main>
    );
}
