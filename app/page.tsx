'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { format, subDays, startOfDay, isBefore, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, Legend
} from 'recharts';
import {
  Plus, Trash2, Edit3, CheckCircle2, Clock,
  LayoutDashboard, ListTodo, BarChart3, Settings as SettingsIcon, Flame,
  Target, Timer as TimerIcon, AlertTriangle, Download, Upload, Package
} from 'lucide-react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from '@dnd-kit/core';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Components & Hooks
import { DEFAULT_CATEGORIES, LS_KEY, PRIORITIES, STATUSES, WEEK_DAY_SHORT } from '@/components/constants';
import { useAppState } from '@/hooks/useAppState';
import { getTodayRecurringInstances } from '@/utils/recurringTodos';
import { TodoCard } from '@/components/TodoCard';
import { KanbanColumn } from '@/components/KanbanColumn';
import { TodoForm } from '@/components/TodoForm';
import { Heatmap } from '@/components/Heatmap';
import { SpiderGraph } from '@/components/SpiderGraph';
import { PriorityDonut } from '@/components/PriorityDonut';
import { StatCard } from '@/components/StatCard';
import { StreakCalendar } from '@/components/StreakCalendar';
import { Todo } from '@/types/todo';

export default function App() {
  const [state, setState] = useAppState();
  const [tab, setTab] = useState('dashboard');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const kanbanSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id?.toString().replace('col-', '') as any;
    if (!STATUSES.some(s => s.value === newStatus)) return;
    const todo = state.todos.find(t => t.id === active.id);
    if (!todo || todo.status === newStatus) return;
    updateTodo({ ...todo, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : todo.completedAt });
    toast.success(`Moved to ${newStatus}`);
  };


  useEffect(() => {
    if (!state.loaded) return;
    const newInstances = getTodayRecurringInstances(state.todos);
    if (newInstances.length > 0) {
      setState(s => ({ ...s, todos: [...s.todos, ...newInstances] }));
      toast.info(`${newInstances.length} recurring task(s) generated for today`);
    }
  }, [state.loaded]);

  const todos = state.todos || [];
  const visibleTodos = todos.filter(t => !t.isRecurring || t.parentRecurringId);

  const filtered = useMemo(() => {
    return visibleTodos.filter(t => {
      if (search && !(t.title + ' ' + (t.description || '')).toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [visibleTodos, search, filterPriority, filterCategory]);

  const stats = useMemo(() => {
    const total = visibleTodos.length;
    const completed = visibleTodos.filter(t => t.status === 'completed').length;
    const inProgress = visibleTodos.filter(t => t.status === 'in-progress').length;
    const overdue = visibleTodos.filter(t => t.status !== 'completed' && t.dueDate && isBefore(parseISO(t.dueDate), startOfDay(new Date()))).length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    const completedDates = new Set(visibleTodos.filter(t => t.completedAt).map(t => format(parseISO(t.completedAt as string), 'yyyy-MM-dd')));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const key = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (completedDates.has(key)) streak++;
      else if (i > 0) break;
      else continue;
    }
    return { total, completed, inProgress, overdue, productivity, streak };
  }, [visibleTodos]);

  const saveTodo = (todo: Todo) => {
    setState(s => {
      const exists = s.todos.some(t => t.id === todo.id);
      return { ...s, todos: exists ? s.todos.map(t => t.id === todo.id ? todo : t) : [...s.todos, todo] };
    });
    setEditing(null);
  };

  const updateTodo = (todo: Todo) => {
    setState(s => ({ ...s, todos: s.todos.map(t => t.id === todo.id ? todo : t) }));
  };

  const deleteTodo = (id: string) => {
    setState(s => ({ ...s, todos: s.todos.filter(t => t.id !== id) }));
    toast.success('Todo deleted');
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `green-todos-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.todos) throw new Error('Invalid file');
        setState({ ...parsed, loaded: true });
        toast.success('Data imported');
      } catch { toast.error('Invalid JSON file'); }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (confirmText !== 'CONFIRM') { toast.error("Type 'CONFIRM' to proceed"); return; }
    localStorage.removeItem(LS_KEY);
    setState({ todos: [], categories: DEFAULT_CATEGORIES, settings: { timerEnabled: true }, loaded: true });
    setClearDialogOpen(false);
    setConfirmText('');
    toast.success('All data cleared');
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (t: Todo) => { setEditing(t); setFormOpen(true); };

  const kanbanColumns = STATUSES.map(s => ({ ...s, items: filtered.filter(t => t.status === s.value) }));

  if (!state.loaded) {
    return <div className="min-h-screen flex items-center justify-center text-green-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur sticky top-0 z-40">
        <div className="px-4 md:px-16 mx-auto py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-bold text-lg text-green-400 leading-none">Todo</div>
              <div className="text-[10px] text-zinc-500">Local-first • Offline-ready</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openCreate} className="bg-green-500 hover:bg-green-600 text-slate-900 font-semibold">
              <Plus className="w-4 h-4 mr-1" /> New Todo
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-16 mx-auto py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-500 data-[state=active]:text-slate-900"><LayoutDashboard className="w-4 h-4 mr-1.5" />Dashboard</TabsTrigger>
            <TabsTrigger value="todos" className="data-[state=active]:bg-green-500 data-[state=active]:text-slate-900"><ListTodo className="w-4 h-4 mr-1.5" />Todos</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500 data-[state=active]:text-slate-900"><BarChart3 className="w-4 h-4 mr-1.5" />Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-500 data-[state=active]:text-slate-900"><SettingsIcon className="w-4 h-4 mr-1.5" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard icon={Target} label="Total" value={stats.total} color="#06b6d4" />
              <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} sub={`${stats.productivity}% done`} color="#10b981" />
              <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="#ef4444" />
              <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="#f97316" />
              <StatCard icon={Flame} label="Streak" value={`${stats.streak}d`} sub="keep it up!" color="#eab308" />
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-1 gap-4">
              <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 text-base flex items-center gap-2"><Flame className="w-4 h-4" />Productivity Heatmap</CardTitle>
                </CardHeader>
                <CardContent><Heatmap todos={visibleTodos} /></CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-green-400 text-base flex items-center gap-2"><Target className="w-4 h-4" />Productivity Dimensions</CardTitle></CardHeader>
                <CardContent><SpiderGraph todos={visibleTodos} /></CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-green-400 text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" />Priority Breakdown</CardTitle></CardHeader>
                <CardContent><PriorityDonut todos={visibleTodos} /></CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
              <CardHeader className="pb-2"><CardTitle className="text-green-400 text-base">Recent Todos</CardTitle></CardHeader>
              <CardContent>
                {visibleTodos.length === 0 ? (
                  <div className="text-center py-8">
                    <ListTodo className="w-12 h-12 mx-auto text-green-700 mb-2" />
                    <div className="text-slate-400 mb-3">No todos yet. Start being productive!</div>
                    <Button onClick={openCreate} className="bg-green-500 hover:bg-green-600 text-slate-900"><Plus className="w-4 h-4 mr-1" />Create First Todo</Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visibleTodos.slice(-6).reverse().map(t => <TodoCard key={t.id} todo={t} onUpdate={updateTodo} onDelete={deleteTodo} onEdit={openEdit} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="todos" className="mt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <Input placeholder="Search todos..." value={search} onChange={e => setSearch(e.target.value)} className="bg-zinc-900/80 border-zinc-800 flex-1" />
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="bg-zinc-900/80 border-zinc-800 md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-zinc-900/80 border-zinc-800 md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {state.categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <DndContext sensors={kanbanSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid md:grid-cols-3 gap-4">
                {kanbanColumns.map(col => (
                  <KanbanColumn key={col.value} col={col} updateTodo={updateTodo} deleteTodo={deleteTodo} openEdit={openEdit} />
                ))}
              </div>
            </DndContext>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <StatCard icon={Clock} label="Est. Time Total" value={`${visibleTodos.reduce((s, t) => s + (t.estimatedTime || 0), 0)}m`} color="#06b6d4" />
              <StatCard icon={TimerIcon} label="Actual Time" value={`${visibleTodos.reduce((s, t) => s + (t.actualTime || 0), 0)}m`} color="#10b981" />
              <StatCard icon={Target} label="Avg per Task" value={`${visibleTodos.length ? Math.round(visibleTodos.reduce((s, t) => s + (t.actualTime || 0), 0) / visibleTodos.length) : 0}m`} color="#f97316" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
                <CardHeader><CardTitle className="text-green-400 text-base flex items-center gap-2"><Flame className="w-4 h-4" />Streak Progress</CardTitle></CardHeader>
                <CardContent><StreakCalendar todos={visibleTodos} /></CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
                <CardHeader><CardTitle className="text-green-400 text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" />Category Performance</CardTitle></CardHeader>
                <CardContent>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={state.categories.map(c => ({ name: c, completed: visibleTodos.filter(t => t.category === c && t.status === 'completed').length, pending: visibleTodos.filter(t => t.category === c && t.status !== 'completed').length }))}>
                        <defs>
                          <linearGradient id="barGradientDone" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#064e3b" stopOpacity={0.3} />
                          </linearGradient>
                          <linearGradient id="barGradientPending" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3182f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <RTooltip
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12, color: '#fff' }}
                          itemStyle={{ padding: '2px 0' }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 20 }} />
                        <Bar dataKey="completed" name="Done" fill="url(#barGradientDone)" radius={[6, 6, 0, 0]} barSize={24} />
                        <Bar dataKey="pending" name="In Queue" fill="url(#barGradientPending)" radius={[6, 6, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-4 max-w-2xl">
            <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl">
              <CardHeader><CardTitle className="text-green-400 text-base">Recurring Templates</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {todos.filter(t => t.isRecurring).length === 0 && <div className="text-sm text-slate-500">No recurring templates.</div>}
                {todos.filter(t => t.isRecurring).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-md bg-black border border-zinc-800/80">
                    <div>
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="text-xs text-slate-400">Repeats: {(t.recurrencePattern?.days || []).map((d: string) => WEEK_DAY_SHORT[d]).join(', ')}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(t)}><Edit3 className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => deleteTodo(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-zinc-900/80 to-black border-zinc-800 shadow-2xl mt-4">
              <CardHeader><CardTitle className="text-red-400 text-base flex items-center gap-2"><Trash2 className="w-4 h-4" />Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <Button onClick={() => setClearDialogOpen(true)} variant="destructive" className="bg-red-900/40 hover:bg-red-900 border border-red-800 transition-all text-xs">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />Clear All System Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TodoForm open={formOpen} onOpenChange={setFormOpen} initial={editing} categories={state.categories} onSave={saveTodo} />

      <Dialog open={clearDialogOpen} onOpenChange={(o) => { setClearDialogOpen(o); if (!o) setConfirmText('') }}>
        <DialogContent className="bg-zinc-900/80 backdrop-blur-md border-red-900/50">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Clear All Data?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Type <span className="font-mono text-red-400">CONFIRM</span> to proceed:</Label>
            <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} className="bg-black border-red-900/50" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={confirmText !== 'CONFIRM'} onClick={clearAll} className="bg-red-600 hover:bg-red-700">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
