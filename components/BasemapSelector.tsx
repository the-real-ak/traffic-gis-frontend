'use client';

import { useState } from 'react';

export type BasemapType = 'osm' | 'satellite' | 'terrain' | 'dark';

interface BasemapSelectorProps {
    currentBasemap: BasemapType;
    onBasemapChange: (basemap: BasemapType) => void;
}

export const basemapConfigs = {
    osm: {
        name: 'Street Map',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        icon: '🗺️',
    },
    satellite: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        icon: '🛰️',
    },
    terrain: {
        name: 'Terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
        icon: '🏔️',
    },
    dark: {
        name: 'Dark Mode',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        icon: '🌙',
    },
};

export default function BasemapSelector({ currentBasemap, onBasemapChange }: BasemapSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute top-4 left-4 z-[1000]">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{basemapConfigs[currentBasemap].icon}</span>
                        <span className="font-semibold text-slate-800 text-sm">
                            {basemapConfigs[currentBasemap].name}
                        </span>
                    </div>
                    <svg
                        className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="border-t border-slate-200">
                        {(Object.entries(basemapConfigs) as [BasemapType, typeof basemapConfigs.osm][]).map(([key, config]) => (
                            key !== currentBasemap && (
                                <button
                                    key={key}
                                    onClick={() => {
                                        onBasemapChange(key);
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-xl">{config.icon}</span>
                                    <span className="font-medium text-slate-700 text-sm">{config.name}</span>
                                </button>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
