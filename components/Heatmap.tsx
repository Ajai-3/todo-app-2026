import { useMemo } from 'react';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { Todo } from '@/types/todo';

export function Heatmap({ todos }: { todos: Todo[] }) {
  const days = 84;
  const cells = useMemo(() => {
    const counts: Record<string, number> = {};
    todos.forEach(t => {
      if (t.completedAt) {
        const k = format(parseISO(t.completedAt), 'yyyy-MM-dd');
        counts[k] = (counts[k] || 0) + 1;
      }
    });
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(startOfDay(new Date()), i);
      const k = format(d, 'yyyy-MM-dd');
      arr.push({ date: d, key: k, count: counts[k] || 0 });
    }
    return arr;
  }, [todos]);

  const getColor = (c: number) => {
    if (c === 0) return '#0b1f1f';
    if (c <= 2) return '#34d399';
    if (c <= 4) return '#10b981';
    if (c <= 9) return '#059669';
    return '#047857';
  };

  const weeks = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(cells.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(cell => (
              <div key={cell.key}
                title={`${cell.count} tasks completed on ${format(cell.date, 'MMM d, yyyy')}`}
                className="w-4 h-4 rounded-sm hover:ring-2 hover:ring-emerald-400 cursor-pointer transition"
                style={{ backgroundColor: getColor(cell.count) }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-end">
        <span>Less</span>
        {['#1a3a3a', '#34d399', '#10b981', '#059669', '#047857'].map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />)}
        <span>More</span>
      </div>
    </div>
  );
}
