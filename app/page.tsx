'use client';

import UploadForm from '@/components/UploadForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 relative overflow-hidden">
      {/* Subtle background elements for glassmorphic depth */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-white/30 rounded-full filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-slate-200/40 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gray-200/30 rounded-full filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header with glassmorphic text */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-slate-800">
            Traffic Counting & GIS Visualization
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            🚗 AI-powered vehicle detection and real-time analytics 📊
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
            <span className="px-3 py-1 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-medium border border-white/40 shadow-sm">✓ YOLOv8 AI</span>
            <span className="px-3 py-1 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-medium border border-white/40 shadow-sm">✓ Real-time Processing</span>
            <span className="px-3 py-1 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-medium border border-white/40 shadow-sm">✓ GIS Ready</span>
          </div>
        </div>

        {/* Upload Form with glassmorphism */}
        <div className="mb-10">
          <UploadForm />
        </div>

        {/* Action buttons with glass effect */}
        <div className="flex justify-center gap-4 mb-16">
          <Link
            href="/map"
            className="group relative px-8 py-4 bg-white/40 backdrop-blur-lg text-slate-800 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-white/60 hover:bg-white/60"
          >
            <span className="relative z-10 flex items-center gap-2">
              🗺️ View GIS Map
            </span>
          </Link>
        </div>

        {/* How it works section with glass cards */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/60">
              <div className="w-14 h-14 bg-slate-700/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Video</h3>
              <p className="text-slate-600">Upload MP4 traffic camera footage with location data</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/60">
              <div className="w-14 h-14 bg-slate-700/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">AI Processing</h3>
              <p className="text-slate-600">YOLOv8 detects and counts vehicles in real-time</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/60">
              <div className="w-14 h-14 bg-slate-700/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">View Analytics</h3>
              <p className="text-slate-600">Explore charts, maps, and export GIS data</p>
            </div>
          </div>

          {/* Features grid with glass effect */}
          <div className="mt-12 bg-white/40 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/60">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">✨ Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Accurate Detection</h4>
                  <p className="text-sm text-slate-600">YOLOv8-powered vehicle classification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Time-Series Analytics</h4>
                  <p className="text-sm text-slate-600">Track traffic patterns over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h4 className="font-semibold text-slate-800">GIS Integration</h4>
                  <p className="text-sm text-slate-600">Interactive maps with heatmaps</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-slate-800">Export Ready</h4>
                  <p className="text-sm text-slate-600">Download CSV data for analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
