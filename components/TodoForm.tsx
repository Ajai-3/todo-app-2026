import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Plus, X, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { PRIORITIES, WEEK_DAYS, WEEK_DAY_SHORT } from '@/components/constants';
import { Todo, Priority, Status } from '@/types/todo';

interface TodoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Todo | null;
  categories: string[];
  onSave: (todo: Todo) => void;
}

export function TodoForm({ open, onOpenChange, initial, categories, onSave }: TodoFormProps) {
  const [form, setForm] = useState<Todo | null>(null);

  useEffect(() => {
    if (open) {
      setForm(initial || {
        id: uuidv4(), title: '', description: '', priority: 'medium', status: 'pending',
        dueDate: new Date().toISOString().slice(0,10), estimatedTime: 30, actualTime: 0,
        category: categories[0] || 'Personal', tags: [], subtasks: [],
        isRecurring: false, recurrencePattern: { type:'weekly', days: [], endDate: null },
        timerActive: false, timerStartedAt: null, timerElapsed: 0,
        createdAt: new Date().toISOString(), completedAt: null, isArchived: false,
      });
    }
  }, [open, initial, categories]);

  if (!form) return null;

  const toggleDay = (day: string) => {
    const days = form.recurrencePattern?.days || [];
    const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
    setForm({ ...form, recurrencePattern: { ...form.recurrencePattern!, days: newDays } });
  };

  const save = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (form.isRecurring && !(form.recurrencePattern?.days?.length)) { toast.error('Select at least one day for recurrence'); return; }
    const payload = { ...form, dueDate: new Date(form.dueDate).toISOString(), updatedAt: new Date().toISOString() };
    onSave(payload);
    toast.success(initial ? 'Todo updated' : 'Todo created');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#1a3a3a] border-emerald-900 max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-emerald-400">{initial ? 'Edit Todo' : 'Create New Todo'}</DialogTitle>
          <DialogDescription>Fill in task details. Recurring tasks auto-appear on scheduled days.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-[#0f172a] border-emerald-900" /></div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="bg-[#0f172a] border-emerald-900" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v: Priority) => setForm({...form, priority: v})}>
                <SelectTrigger className="bg-[#0f172a] border-emerald-900"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="bg-[#0f172a] border-emerald-900"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Due Date</Label><Input type="date" value={form.dueDate.slice(0,10)} onChange={e => setForm({...form, dueDate: e.target.value})} className="bg-[#0f172a] border-emerald-900" /></div>
            <div><Label>Estimated (min)</Label><Input type="number" min="0" value={form.estimatedTime} onChange={e => setForm({...form, estimatedTime: parseInt(e.target.value)||0})} className="bg-[#0f172a] border-emerald-900" /></div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-[#0f172a] border border-emerald-900">
            <div className="flex items-center gap-2"><Repeat className="w-4 h-4 text-emerald-400" /><Label className="cursor-pointer">Weekly Recurring Task</Label></div>
            <Switch checked={form.isRecurring} onCheckedChange={c => setForm({...form, isRecurring: c})} />
          </div>

          {form.isRecurring && (
            <div className="p-3 rounded-md bg-[#0f172a] border border-emerald-900 space-y-2">
              <Label className="text-xs text-slate-400">Repeat on days:</Label>
              <div className="flex flex-wrap gap-1">
                {WEEK_DAYS.map(d => (
                  <button key={d} type="button" onClick={() => toggleDay(d)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition ${form.recurrencePattern?.days?.includes(d) ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-transparent border-emerald-900 text-slate-400 hover:border-emerald-500'}`}>
                    {WEEK_DAY_SHORT[d]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          <div className="p-3 rounded-md bg-[#0f172a] border border-emerald-900 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-400">Subtasks ({(form.subtasks || []).length})</Label>
              <Button type="button" size="sm" variant="ghost" className="h-6 text-xs text-emerald-400 hover:text-emerald-300" onClick={() => setForm({ ...form, subtasks: [...(form.subtasks || []), { id: uuidv4(), title: '', completed: false }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add subtask
              </Button>
            </div>
            {(form.subtasks || []).map((st, idx) => (
              <div key={st.id} className="flex items-center gap-2">
                <Checkbox checked={st.completed} onCheckedChange={(c) => {
                  const subs = [...(form.subtasks || [])]; subs[idx] = { ...st, completed: !!c }; setForm({ ...form, subtasks: subs });
                }} />
                <Input value={st.title} placeholder="Subtask title" onChange={e => {
                  const subs = [...(form.subtasks || [])]; subs[idx] = { ...st, title: e.target.value }; setForm({ ...form, subtasks: subs });
                }} className="bg-[#1a3a3a] border-emerald-900 h-8 text-sm" />
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => setForm({ ...form, subtasks: (form.subtasks || []).filter(s => s.id !== st.id) })}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} className="bg-emerald-500 hover:bg-emerald-600 text-slate-900">{initial ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
