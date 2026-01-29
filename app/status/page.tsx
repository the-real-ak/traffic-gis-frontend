'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProcessingStatus, ProcessingStatus } from '@/lib/api';

export default function StatusPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const cameraId = searchParams.get('cameraId');

    const [status, setStatus] = useState<ProcessingStatus | null>(null);
    const [error, setError] = useState('');
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        if (!cameraId) {
            setError('Camera ID not provided');
            return;
        }

        let intervalId: NodeJS.Timeout;

        const fetchStatus = async () => {
            try {
                const statusData = await getProcessingStatus(cameraId);
                setStatus(statusData);

                // Stop polling and redirect if completed
                if (statusData.status === 'Completed') {
                    setPolling(false);
                    setTimeout(() => {
                        router.push(`/results/${cameraId}`);
                    }, 2000);
                } else if (statusData.status === 'Failed') {
                    setPolling(false);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch status');
                setPolling(false);
            }
        };

        // Initial fetch
        fetchStatus();

        // Poll every 3 seconds if still processing
        if (polling && status?.status !== 'Completed' && status?.status !== 'Failed') {
            intervalId = setInterval(fetchStatus, 3000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [cameraId, polling, router, status?.status]);

    if (!cameraId) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700">Camera ID not provided in URL</p>
                </div>
            </main>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Queued':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Processing':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Failed':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Queued':
                return '⏳';
            case 'Processing':
                return '⚙️';
            case 'Completed':
                return '✅';
            case 'Failed':
                return '❌';
            default:
                return '❓';
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Processing Status
                    </h1>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-gray-500 mb-1">Camera ID</h2>
                            <p className="text-2xl font-bold text-gray-800">{cameraId}</p>
                        </div>

                        {status && (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-sm font-medium text-gray-500 mb-1">File Name</h2>
                                    <p className="text-lg text-gray-800">{status.fileName}</p>
                                </div>

                                <div className="mb-6">
                                    <h2 className="text-sm font-medium text-gray-500 mb-2">Status</h2>
                                    <div
                                        className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-semibold text-lg ${getStatusColor(status.status)}`}
                                    >
                                        <span className="mr-2 text-2xl">{getStatusIcon(status.status)}</span>
                                        {status.status}
                                    </div>
                                </div>

                                {status.status === 'Processing' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-blue-800">
                                            Processing in progress... This page will automatically refresh.
                                        </p>
                                        <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }} />
                                        </div>
                                    </div>
                                )}

                                {status.status === 'Completed' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 font-medium">
                                            Processing completed! Redirecting to results...
                                        </p>
                                    </div>
                                )}

                                {status.status === 'Failed' && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800">
                                            Processing failed. Please try uploading the video again.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Back to Upload
                            </button>
                            {status?.status === 'Completed' && (
                                <button
                                    onClick={() => router.push(`/results/${cameraId}`)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    View Results
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
