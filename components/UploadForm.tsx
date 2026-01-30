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
        <div className="max-w-3xl mx-auto">
            <div className="bg-white/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/60">
                <h2 className="text-3xl font-bold mb-6 text-slate-800">
                    📹 Upload Traffic Video
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Camera ID */}
                    <div>
                        <label htmlFor="cameraId" className="block text-sm font-semibold text-slate-700 mb-2">
                            🎥 Camera ID
                        </label>
                        <input
                            type="text"
                            id="cameraId"
                            value={cameraId}
                            onChange={(e) => setCameraId(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white/60 backdrop-blur-sm"
                            placeholder="e.g., CAM001"
                            disabled={uploading}
                        />
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-semibold text-slate-700 mb-2">
                                📍 Latitude
                            </label>
                            <input
                                type="number"
                                id="latitude"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                step="any"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white/60 backdrop-blur-sm"
                                placeholder="-90 to 90"
                                disabled={uploading}
                            />
                        </div>

                        <div>
                            <label htmlFor="longitude" className="block text-sm font-semibold text-slate-700 mb-2">
                                🌍 Longitude
                            </label>
                            <input
                                type="number"
                                id="longitude"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                step="any"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white/60 backdrop-blur-sm"
                                placeholder="-180 to 180"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label htmlFor="video" className="block text-sm font-semibold text-slate-700 mb-2">
                            🎬 Video File (MP4)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                id="video"
                                accept=".mp4,video/mp4"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white/60 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                disabled={uploading}
                            />
                            {videoFile && (
                                <p className="mt-2 text-sm text-slate-600">
                                    ✓ Selected: {videoFile.name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                            <p className="text-red-700 font-medium">❌ {error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-fade-in">
                            <p className="text-green-700 font-medium">✅ {success}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading}
                        className="group relative w-full bg-slate-700/90 backdrop-blur-lg text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-slate-800/90 border border-slate-600/50"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {uploading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    🚀 Upload & Process Video
                                </>
                            )}
                        </span>
                    </button>
                </form>
            </div>

            <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
        </div>
    );
}
