'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Hourglass, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSound } from '@/context/SoundContext';

export function NavTimer() {
    const { playBeep } = useSound();
    const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0); // in milliseconds
    const [targetTime, setTargetTime] = useState(300000); // 5 minutes default
    const [customMinutes, setCustomMinutes] = useState('5');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const updateTarget = (mins: string) => {
        setCustomMinutes(mins);
        const m = parseInt(mins);
        if (!isNaN(m) && m > 0) {
            setTargetTime(m * 60000);
            setTime(0);
            playBeep(); // Audio feedback for editing
        }
    };

    const toggleRunning = () => {
        if (!isRunning) playBeep(); // Audio feedback for starting
        setIsRunning(!isRunning);
    };

    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now() - time;
            timerRef.current = setInterval(() => {
                const nextTime = Date.now() - startTime;

                if (mode === 'timer') {
                    const remaining = targetTime - nextTime;
                    if (remaining <= 0) {
                        setTime(targetTime);
                        setIsRunning(false);

                        // Play alert beep for 5 seconds
                        let count = 0;
                        const alertInterval = setInterval(() => {
                            playBeep();
                            count++;
                            if (count >= 5) clearInterval(alertInterval);
                        }, 1000);

                        if (timerRef.current) clearInterval(timerRef.current);
                        return;
                    }
                    setTime(nextTime);
                } else {
                    setTime(nextTime);
                }
            }, 10);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, mode, targetTime]);

    const formatTime = (ms: number) => {
        const displayMs = mode === 'timer' ? Math.max(0, targetTime - ms) : ms;
        const minutes = Math.floor(displayMs / 60000);
        const seconds = Math.floor((displayMs % 60000) / 1000);
        const hundredths = Math.floor((displayMs % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 border-r border-zinc-800 pr-3 mr-1">
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { setIsRunning(false); setTime(0); setMode(mode === 'stopwatch' ? 'timer' : 'stopwatch'); playBeep(); }}
                    className="h-7 w-7 text-zinc-400 hover:text-green-400"
                >
                    {mode === 'stopwatch' ? <Hourglass className="w-3.5 h-3.5" /> : <TimerIcon className="w-3.5 h-3.5" />}
                </Button>
                <div className="text-lg font-mono tracking-tighter text-green-400 min-w-[90px] text-center">
                    {formatTime(time)}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {mode === 'timer' && !isRunning && (
                    <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-zinc-800/50">
                        <input
                            type="text"
                            value={customMinutes}
                            onChange={(e) => updateTarget(e.target.value)}
                            className="w-8 bg-transparent text-[11px] text-center text-zinc-300 focus:outline-none"
                        />
                        <span className="text-[9px] text-zinc-600 uppercase font-bold">min</span>
                    </div>
                )}

                <Button
                    size="icon"
                    onClick={toggleRunning}
                    className={`h-8 w-8 ${isRunning ? 'bg-zinc-800 text-zinc-300' : 'bg-green-500 text-black hover:bg-green-600'}`}
                >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { setIsRunning(false); setTime(0); playBeep(); }}
                    className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
