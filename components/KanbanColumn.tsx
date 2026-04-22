import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { TodoCard } from '@/components/TodoCard';
import { Todo } from '@/types/todo';

interface KanbanColumnProps {
  col: {
    value: string;
    label: string;
    color: string;
    items: Todo[];
  };
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  openEdit: (todo: Todo) => void;
}

export function KanbanColumn({ col, updateTodo, deleteTodo, openEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${col.value}` });
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
          <h3 className="font-semibold text-sm" style={{ color: col.color }}>{col.label}</h3>
          <Badge variant="outline" className="text-[10px]">{col.items.length}</Badge>
        </div>
      </div>
      <div ref={setNodeRef} className={`space-y-2 min-h-[200px] p-2 rounded-lg bg-[#0f172a]/50 border transition ${isOver ? 'border-emerald-400 bg-emerald-900/10' : 'border-emerald-900/30'}`}>
        {col.items.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs">Drop here</div>
        ) : col.items.map(t => <TodoCard key={t.id} todo={t} onUpdate={updateTodo} onDelete={deleteTodo} onEdit={openEdit} draggable />)}
      </div>
    </div>
  );
}
