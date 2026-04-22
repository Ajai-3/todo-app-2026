import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend } from 'recharts';
import { PRIORITIES } from '@/components/constants';
import { Todo } from '@/types/todo';

export function PriorityDonut({ todos }: { todos: Todo[] }) {
  const data = PRIORITIES.map(p => ({ 
    name: p.label, 
    value: todos.filter(t => t.priority === p.value).length, 
    color: p.color 
  })).filter(d => d.value > 0);

  if (data.length === 0) return <div className="flex items-center justify-center h-[260px] text-slate-500 text-sm">No data yet</div>;
  
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <RTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #10b981', borderRadius: 6 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#d1d5db' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
