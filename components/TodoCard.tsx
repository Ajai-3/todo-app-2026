import { startOfDay, isBefore, parseISO, format } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Circle, CheckCircle2, Edit3, Trash2, Tag, AlertTriangle, Repeat, Calendar, Clock, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { PRIORITIES, STATUSES } from '@/components/constants';
import { TodoTimer } from '@/components/TodoTimer';
import { Todo } from '@/types/todo';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  draggable?: boolean;
}

export function TodoCard({ todo, onUpdate, onDelete, onEdit, draggable = false }: TodoCardProps) {
  const pri = PRIORITIES.find(p => p.value === todo.priority) || PRIORITIES[3];
  const overdue = todo.status !== 'completed' && todo.dueDate && isBefore(parseISO(todo.dueDate), startOfDay(new Date()));
  const doneSubs = (todo.subtasks || []).filter(s => s.completed).length;
  const totalSubs = (todo.subtasks || []).length;

  const drag = useDraggable({ id: todo.id, disabled: !draggable });
  const dragStyle = drag.transform ? { transform: `translate3d(${drag.transform.x}px, ${drag.transform.y}px, 0)`, zIndex: 50, opacity: 0.9 } : undefined;

  const statusColorMap: Record<string, string> = {
    'pending': '#eab308',
    'in-progress': '#3b82f6',
    'completed': '#22c55e'
  };

  const statusColor = statusColorMap[todo.status] || '#64748b';

  return (
    <div
      ref={draggable ? drag.setNodeRef : undefined}
      style={dragStyle}
      className={`transition-all duration-200 ${drag.isDragging ? 'z-50 scale-105 rotate-2 transition-none' : ''}`}
    >
      <Card className={`relative overflow-hidden bg-black shadow-2xl ${todo.status === 'completed' ? 'border-green-500/40' : 'border-zinc-800'}`}>
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `linear-gradient(145deg, ${pri.color}60 0%, rgba(34, 197, 94, 0.25) 45%, ${statusColor}50 100%)`
          }}
        />
        <CardContent className="p-4 space-y-3 relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {draggable && (
                <button {...drag.listeners} {...drag.attributes} className="mt-1 shrink-0 cursor-grab active:cursor-grabbing text-slate-500 hover:text-green-400" aria-label="Drag">
                  <GripVertical className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => onUpdate({ ...todo, status: todo.status === 'completed' ? 'pending' : 'completed', completedAt: todo.status === 'completed' ? null : new Date().toISOString() })}
                className="mt-1 shrink-0">
                {todo.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Circle className="w-5 h-5 text-slate-500 hover:text-green-400" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm transition-all ${todo.status === 'completed' ? 'line-through text-zinc-500' : 'text-slate-100'}`}>{todo.title}</div>
                {todo.description && <div className={`text-xs mt-0.5 line-clamp-2 transition-all ${todo.status === 'completed' ? 'text-zinc-600' : 'text-slate-400'}`}>{todo.description}</div>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(todo)}><Edit3 className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-red-400" onClick={() => onDelete(todo.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <Badge style={{ backgroundColor: pri.color + '50', color: pri.color, border: `1px solid ${pri.color}80` }} className="text-[10px] px-1.5 py-0">{pri.label}</Badge>
            {todo.status === 'completed' && <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-400 border border-green-500/40">DONE</Badge>}
            {todo.category && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-700 text-green-300"><Tag className="w-2.5 h-2.5 mr-1" />{todo.category}</Badge>}
            {overdue && <Badge className="text-[10px] px-1.5 py-0 bg-red-900/40 text-red-300 border border-red-700"><AlertTriangle className="w-2.5 h-2.5 mr-1" />Overdue</Badge>}
            {todo.isRecurring && <Badge className="text-[10px] px-1.5 py-0 bg-cyan-900/40 text-cyan-300 border border-cyan-700"><Repeat className="w-2.5 h-2.5 mr-1" />Recurring</Badge>}
            {todo.parentRecurringId && <Badge className="text-[10px] px-1.5 py-0 bg-purple-900/40 text-purple-300 border border-purple-700"><Repeat className="w-2.5 h-2.5 mr-1" />Today</Badge>}
          </div>

          {totalSubs > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Subtasks</span><span>{doneSubs}/{totalSubs}</span>
              </div>
              <Progress value={(doneSubs / totalSubs) * 100} className="h-1" />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              {todo.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(todo.dueDate), 'MMM d')}</span>}
              {todo.estimatedTime > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{todo.estimatedTime}m est</span>}
              {todo.actualTime > 0 && <span className="flex items-center gap-1 text-green-400"><CheckCheck className="w-3 h-3" />{todo.actualTime}m</span>}
            </div>
            <TodoTimer todo={todo} onUpdate={onUpdate} />
          </div>

          <Select value={todo.status} onValueChange={(v: any) => onUpdate({ ...todo, status: v, completedAt: v === 'completed' ? new Date().toISOString() : todo.completedAt })}>
            <SelectTrigger className="h-7 text-xs bg-black/40 border-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
