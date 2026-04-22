import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Timer as TimerIcon, Play, Pause, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Todo } from '@/types/todo';
import { useSound } from '@/context/SoundContext';

function formatTimer(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msPart = Math.floor((ms % 1000) / 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${msPart.toString().padStart(2, '0')}`;
}

interface TodoTimerProps {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
}

export function TodoTimer({ todo, onUpdate }: TodoTimerProps) {
  const [now, setNow] = useState(Date.now());
  const { playBeep, playComplete, playWarning } = useSound();
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    if (!todo.timerActive) return;
    const i = setInterval(() => setNow(Date.now()), 10); // Faster update for MS
    return () => clearInterval(i);
  }, [todo.timerActive]);

  const baseMs = (todo.timerElapsed || 0);
  const runningMs = todo.timerActive && todo.timerStartedAt ? (now - new Date(todo.timerStartedAt).getTime()) : 0;
  const totalMs = baseMs + runningMs;

  // Warning logic
  useEffect(() => {
    if (todo.timerActive && todo.estimatedTime > 0 && !hasWarned) {
      if (totalMs > todo.estimatedTime * 60000) {
        setHasWarned(true);
        // Play warning beep 5 times (once per second)
        let count = 0;
        const warnInterval = setInterval(() => {
          playWarning();
          count++;
          if (count >= 5) clearInterval(warnInterval);
        }, 1000);
      }
    }
  }, [totalMs, todo.timerActive, todo.estimatedTime, hasWarned, playWarning]);

  const start = () => {
    playBeep();
    onUpdate({
      ...todo,
      timerActive: true,
      timerStartedAt: new Date().toISOString(),
      status: todo.status === 'pending' ? 'in-progress' : todo.status
    });
  };

  const pause = () => onUpdate({
    ...todo,
    timerActive: false,
    timerStartedAt: null,
    timerElapsed: baseMs + runningMs
  });

  const stop = () => {
    playComplete();
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
    <div className={`flex items-center gap-2 rounded-md px-2 py-1 bg-[#0f172a] border border-green-900 ${todo.timerActive ? 'timer-pulse' : ''}`}>
      <TimerIcon className="w-3.5 h-3.5 text-green-400" />
      <span className="font-mono text-sm text-green-300 tabular-nums">{formatTimer(totalMs)}</span>
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
