import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PointsTrendChart = ({ historyData }) => {
  if (!historyData || historyData.length === 0) return null;

  const data = historyData.map(gw => ({
    name: `GW${gw.event}`,
    points: gw.points,
    avg: gw.average || 50, // mock average if missing
    rank: gw.overall_rank
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px' }}
          itemStyle={{ color: '#e0e0e0' }}
        />
        <Line type="monotone" dataKey="points" name="My Points" stroke="#d4af37" strokeWidth={2} dot={{ r: 3, fill: '#d4af37' }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="avg" name="Average" stroke="#888" strokeDasharray="5 5" strokeWidth={1} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PointsTrendChart;
