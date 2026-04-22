import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Timer as TimerIcon, Play, Pause, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Todo } from '@/types/todo';

function formatTimer(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

interface TodoTimerProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
}

export function TodoTimer({ todo, onUpdate }: TodoTimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!todo.timerActive) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [todo.timerActive]);

  const baseMs = (todo.timerElapsed || 0);
  const runningMs = todo.timerActive && todo.timerStartedAt ? (now - new Date(todo.timerStartedAt).getTime()) : 0;
  const totalMs = baseMs + runningMs;

  const start = () => onUpdate({ 
    ...todo, 
    timerActive: true, 
    timerStartedAt: new Date().toISOString(), 
    status: todo.status === 'pending' ? 'in-progress' : todo.status 
  });
  
  const pause = () => onUpdate({ 
    ...todo, 
    timerActive: false, 
    timerStartedAt: null, 
    timerElapsed: baseMs + runningMs 
  });
  
  const stop = () => {
    const finalMs = baseMs + runningMs;
    const minutes = Math.round(finalMs / 60000);
    onUpdate({ 
      ...todo, 
      timerActive: false, 
      timerStartedAt: null, 
      timerElapsed: 0, 
      actualTime: (todo.actualTime || 0) + minutes 
    });
    toast.success(`Logged ${minutes} minute(s)`);
  };

  return (
    <div className={`flex items-center gap-2 rounded-md px-2 py-1 bg-[#0f172a] border border-emerald-900 ${todo.timerActive ? 'timer-pulse' : ''}`}>
      <TimerIcon className="w-3.5 h-3.5 text-emerald-400" />
      <span className="font-mono text-sm text-emerald-300 tabular-nums">{formatTimer(totalMs)}</span>
      {!todo.timerActive ? (
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={start}><Play className="w-3 h-3" /></Button>
      ) : (
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={pause}><Pause className="w-3 h-3" /></Button>
      )}
      {(todo.timerActive || baseMs > 0) && (
        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={stop}><Square className="w-3 h-3" /></Button>
      )}
    </div>
  );
}
