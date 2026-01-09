import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { day: 'السبت', count: 5 },
  { day: 'الأحد', count: 4 },
  { day: 'الاثنين', count: 5 },
  { day: 'الثلاثاء', count: 3 },
  { day: 'الأربعاء', count: 5 },
  { day: 'الخميس', count: 2 },
  { day: 'الجمعة', count: 5 },
];

export default function StatsChart() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
      <h2 className="text-gray-700 font-bold mb-4 text-right">أداؤك هذا الأسبوع</h2>
      
      <div className="h-64 w-full" dir="ltr"> {/* LTR required for charts usually */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" stroke="#8884d8" fontSize={12} />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '10px', direction: 'rtl' }}
            />
            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count === 5 ? '#218084' : '#fbbf24'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        <span className="inline-block w-3 h-3 bg-teal-600 rounded-full ml-1"></span> كاملة
        <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full ml-1 mr-3"></span> ناقصة
      </p>
    </div>
  );
}
