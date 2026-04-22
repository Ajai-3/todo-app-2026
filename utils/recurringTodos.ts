import { startOfDay, format, isBefore, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '@/types/todo';

export function getTodayRecurringInstances(todos: Todo[]): Todo[] {
  const today = startOfDay(new Date());
  const todayKey = format(today, 'yyyy-MM-dd');
  const todayDayName = format(today, 'EEEE').toLowerCase();
  const instances: Todo[] = [];

  todos.forEach(t => {
    if (!t.isRecurring || !t.recurrencePattern) return;
    if (!t.recurrencePattern.days?.includes(todayDayName)) return;
    if (t.recurrencePattern.endDate && isBefore(parseISO(t.recurrencePattern.endDate), today)) return;
    const already = todos.some(x => x.parentRecurringId === t.id && x.instanceDate === todayKey);
    if (!already) {
      instances.push({
        ...t,
        id: uuidv4(),
        parentRecurringId: t.id,
        instanceDate: todayKey,
        isRecurring: false,
        recurrencePattern: null,
        status: 'pending',
        completedAt: null,
        actualTime: 0,
        timerActive: false,
        timerStartedAt: null,
        timerElapsed: 0,
        dueDate: today.toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
  });
  return instances;
}
