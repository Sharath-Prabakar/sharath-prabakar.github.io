import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { year: '2000', votes: 15000, margin: 500 },
  { year: '2004', votes: 18000, margin: 1200 },
  { year: '2008', votes: 22000, margin: 3000 },
  { year: '2012', votes: 25000, margin: 4500 },
  { year: '2016', votes: 24000, margin: 2000 },
  { year: '2020', votes: 28000, margin: 5500 },
];

const ElectionPerformanceChart = ({ chartData = data }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="year" />
          <YAxis yAxisId="left" orientation="left" stroke="#003366" />
          <YAxis yAxisId="right" orientation="right" stroke="#28a745" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="votes" barSize={20} fill="#003366" name="Votes" />
          <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#28a745" name="Margin" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElectionPerformanceChart;
