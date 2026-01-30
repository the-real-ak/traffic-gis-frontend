'use client';

import { useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: string[];
}

export default function MapSearch() {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [marker, setMarker] = useState<L.Marker | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            // Use Nominatim (OpenStreetMap) geocoding service
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Remove previous marker
        if (marker) {
            map.removeLayer(marker);
        }

        // Add new marker
        const newMarker = L.marker([lat, lon], {
            icon: L.divIcon({
                html: `
                    <div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                        <span style="color: white; font-size: 18px;">📍</span>
                    </div>
                `,
                className: 'search-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            }),
        });

        newMarker.bindPopup(`
            <div>
                <strong style="font-size: 14px;">Search Result</strong><br/>
                <p style="font-size: 12px; color: #666; margin: 4px 0;">${result.display_name}</p>
                <p style="font-size: 11px; color: #999;">${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
            </div>
        `).openPopup();

        newMarker.addTo(map);
        setMarker(newMarker);

        // Pan to location
        map.setView([lat, lon], 13);
        setResults([]);
        setQuery('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="absolute top-20 left-4 z-[1000] w-80">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                {/* Search Input */}
                <div className="p-3 flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search location..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                        {loading ? '...' : '🔍'}
                    </button>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
                        {results.map((result, index) => (
                            <button
                                key={index}
                                onClick={() => handleResultClick(result)}
                                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                            >
                                <p className="text-sm font-medium text-slate-800 truncate">
                                    {result.display_name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
