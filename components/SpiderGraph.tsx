import { useMemo } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { PRIORITIES } from '@/components/constants';
import { Todo } from '@/types/todo';

export function SpiderGraph({ todos }: { todos: Todo[] }) {
  const data = useMemo(() => {
    const total = todos.length || 1;
    const completed = todos.filter(t => t.status === 'completed');
    const completionRate = (completed.length / total) * 100;

    const estSum = todos.reduce((s, t) => s + (t.estimatedTime || 0), 0) || 1;
    const actSum = todos.reduce((s, t) => s + (t.actualTime || 0), 0);
    const timeMgmt = Math.min(100, estSum > 0 ? (Math.min(estSum, actSum) / estSum) * 100 : 0);

    const priCounts = PRIORITIES.map(p => todos.filter(t => t.priority === p.value).length);
    const nonZero = priCounts.filter(c => c > 0).length;
    const priorityBalance = (nonZero / PRIORITIES.length) * 100;

    const last30 = new Set();
    completed.forEach(t => { 
      if (t.completedAt) { 
        const d = differenceInDays(new Date(), parseISO(t.completedAt)); 
        if (d <= 30) last30.add(format(parseISO(t.completedAt), 'yyyy-MM-dd'));
      } 
    });
    const consistency = (last30.size / 30) * 100;

    const efficiency = Math.min(100, (completed.length / 30) * 100 * 3);

    const cats = new Set(todos.map(t => t.category).filter(Boolean));
    const categoryCoverage = Math.min(100, (cats.size / 5) * 100);

    return [
      { axis: 'Completion', value: Math.round(completionRate) },
      { axis: 'Time Mgmt', value: Math.round(timeMgmt) },
      { axis: 'Priority Bal.', value: Math.round(priorityBalance) },
      { axis: 'Consistency', value: Math.round(consistency) },
      { axis: 'Efficiency', value: Math.round(efficiency) },
      { axis: 'Categories', value: Math.round(categoryCoverage) },
    ];
  }, [todos]);

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#2d5a5a" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#6ee7b7', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} stroke="#2d5a5a" />
          <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
          <RTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #10b981', borderRadius: 6 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
