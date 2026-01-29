interface VehicleStatsProps {
    counts: {
        motorcycle: number;
        car: number;
        bus: number;
        truck: number;
    };
}

export default function VehicleStats({ counts }: VehicleStatsProps) {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const vehicles = [
        {
            name: 'Motorcycles',
            count: counts.motorcycle,
            icon: '🏍️',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            name: 'Cars',
            count: counts.car,
            icon: '🚗',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            name: 'Buses',
            count: counts.bus,
            icon: '🚌',
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-700'
        },
        {
            name: 'Trucks',
            count: counts.truck,
            icon: '🚚',
            color: 'from-red-500 to-red-600',
            bgColor: 'bg-red-50',
            textColor: 'text-red-700'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Total Count Card */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                <div className="relative z-10">
                    <h3 className="text-lg font-semibold mb-2 opacity-90">Total Vehicles Detected</h3>
                    <p className="text-6xl font-extrabold mb-2">
                        {total.toLocaleString()}
                    </p>
                    <p className="text-sm opacity-75">Across all categories</p>
                </div>
            </div>

            {/* Vehicle Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {vehicles.map((vehicle, index) => {
                    const percentage = total > 0 ? Math.round((vehicle.count / total) * 100) : 0;

                    return (
                        <div
                            key={vehicle.name}
                            className="bg-white rounded-2xl shadow-xl hover:shadow-2xl p-6 transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">{vehicle.icon}</span>
                                <div className={`px-3 py-1 ${vehicle.bgColor} ${vehicle.textColor} rounded-full text-sm font-bold`}>
                                    {percentage}%
                                </div>
                            </div>

                            <h4 className="text-gray-600 text-sm font-semibold mb-2">{vehicle.name}</h4>
                            <p className="text-4xl font-extrabold text-gray-900 mb-3">
                                {vehicle.count.toLocaleString()}
                            </p>

                            {/* Progress Bar */}
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${vehicle.color} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Breakdown Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Detailed Breakdown</h3>
                <div className="space-y-3">
                    {vehicles.map((vehicle) => {
                        const percentage = total > 0 ? ((vehicle.count / total) * 100).toFixed(1) : '0.0';

                        return (
                            <div key={vehicle.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-2xl">{vehicle.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700">{vehicle.name}</span>
                                            <span className="text-sm font-bold text-gray-900">{vehicle.count.toLocaleString()}</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${vehicle.color} transition-all duration-1000`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="ml-4 text-sm font-bold text-gray-600 min-w-[50px] text-right">
                                    {percentage}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
