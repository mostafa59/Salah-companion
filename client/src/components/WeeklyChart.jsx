// client/src/components/WeeklyChart.jsx
// CREATE THIS NEW FILE

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

const WeeklyChart = ({ data }) => {
  if (!data || !data.weekData) {
    return <div className="text-center text-gray-500">Loading chart...</div>;
  }

  const COLORS = ['#14b8a6', '#fbbf24', '#ef4444'];

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
        أداء الأسبوع
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.weekData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" domain={[0, 5]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value) => [`${value} صلوات`, 'مكتملة']}
          />
          <Bar dataKey="completed" fill="#14b8a6" radius={[8, 8, 0, 0]}>
            {data.weekData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.completed === 5 ? '#10b981' : entry.completed >= 3 ? '#fbbf24' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">متوسط الأداء</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data.summary.percentage}%
          </p>
        </div>

        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">في الوقت</p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {data.summary.onTimePercentage}%
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المكتملة</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.summary.totalCompleted}/35
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;
