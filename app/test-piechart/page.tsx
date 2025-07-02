"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const riskData = [
  { name: 'Low', value: 1 },
  { name: 'Medium', value: 2 },
  { name: 'High', value: 3 }
];
const riskColors = ['#10b981', '#f59e0b', '#ef4444'];

export default function TestPieChartPage() {
  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      <h2 style={{ color: '#0a2540', fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Test PieChart Isolato</h2>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
            {riskData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={riskColors[idx % riskColors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 