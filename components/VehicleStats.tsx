'use client';

import { VehicleCount } from '@/lib/api';

interface VehicleStatsProps {
    counts: VehicleCount;
}

export default function VehicleStats({ counts }: VehicleStatsProps) {
    const categories = [
        { name: 'Motorcycle', count: counts.motorcycle, color: 'bg-blue-500', icon: '🏍️' },
        { name: 'Car', count: counts.car, color: 'bg-green-500', icon: '🚗' },
        { name: 'Bus', count: counts.bus, color: 'bg-yellow-500', icon: '🚌' },
        { name: 'Truck', count: counts.truck, color: 'bg-red-500', icon: '🚚' },
    ];

    const total = counts.motorcycle + counts.car + counts.bus + counts.truck;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Vehicle Counts</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {categories.map((category) => (
                    <div
                        key={category.name}
                        className="bg-gray-50 rounded-lg p-4 border-l-4"
                        style={{ borderLeftColor: category.color.replace('bg-', '#') }}
                    >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-sm text-gray-600 mb-1">{category.name}</div>
                        <div className="text-2xl font-bold text-gray-800">{category.count}</div>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total Vehicles</span>
                    <span className="text-3xl font-bold text-blue-600">{total}</span>
                </div>
            </div>

            {/* Visual breakdown */}
            <div className="mt-4">
                <div className="flex h-4 rounded-full overflow-hidden">
                    {categories.map((category) => {
                        const percentage = total > 0 ? (category.count / total) * 100 : 0;
                        return percentage > 0 ? (
                            <div
                                key={category.name}
                                className={category.color}
                                style={{ width: `${percentage}%` }}
                                title={`${category.name}: ${category.count} (${percentage.toFixed(1)}%)`}
                            />
                        ) : null;
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                    {categories.map((category) => {
                        const percentage = total > 0 ? (category.count / total) * 100 : 0;
                        return (
                            <span key={category.name}>
                                {percentage.toFixed(0)}%
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
