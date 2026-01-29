'use client';

import { useState } from 'react';
import { uploadVideo } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function UploadForm() {
    const router = useRouter();
    const [cameraId, setCameraId] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateInputs = () => {
        if (!cameraId.trim()) {
            setError('Camera ID is required');
            return false;
        }

        const lat = parseFloat(latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90');
            return false;
        }

        const lng = parseFloat(longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
            setError('Longitude must be between -180 and 180');
            return false;
        }

        if (!videoFile) {
            setError('Please select a video file');
            return false;
        }

        if (!videoFile.name.endsWith('.mp4')) {
            setError('Video must be in MP4 format');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateInputs()) {
            return;
        }

        setUploading(true);

        try {
            const result = await uploadVideo({
                cameraId,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                videoFile: videoFile!,
            });

            setSuccess('Video uploaded successfully! Redirecting to status page...');

            // Redirect to status page after successful upload
            setTimeout(() => {
                router.push(`/status?cameraId=${cameraId}`);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Traffic Video</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="cameraId" className="block text-sm font-medium text-gray-700 mb-1">
                        Camera ID
                    </label>
                    <input
                        type="text"
                        id="cameraId"
                        value={cameraId}
                        onChange={(e) => setCameraId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., CAM001"
                        disabled={uploading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                        </label>
                        <input
                            type="number"
                            id="latitude"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="-90 to 90"
                            disabled={uploading}
                        />
                    </div>

                    <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                        </label>
                        <input
                            type="number"
                            id="longitude"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            step="any"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="-180 to 180"
                            disabled={uploading}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                        Video File (MP4)
                    </label>
                    <input
                        type="file"
                        id="video"
                        accept=".mp4,video/mp4"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={uploading}
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>
        </div>
    );
}
