'use client';

import { TimeSeriesData } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrafficChartProps {
    data: TimeSeriesData[];
}

export default function TrafficChart({ data }: TrafficChartProps) {
    // Transform data for Recharts
    const chartData = data.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        Motorcycle: item.counts.motorcycle,
        Car: item.counts.car,
        Bus: item.counts.bus,
        Truck: item.counts.truck,
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Traffic Over Time</h3>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis label={{ value: 'Vehicle Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="Motorcycle"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Car"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Bus"
                        stroke="#eab308"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="Truck"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
