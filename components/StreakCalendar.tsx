import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { Todo } from '@/types/todo';

interface StreakCalendarProps {
    todos: Todo[];
}

export function StreakCalendar({ todos }: StreakCalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    const completionDays = todos
        .filter(t => t.status === 'completed' && t.completedAt)
        .map(t => parseISO(t.completedAt!));

    const hasStreak = (day: Date) => {
        return completionDays.some(d => isSameDay(d, day));
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

    return (
        <div className="space-y-4 max-w-[280px] mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">{format(currentDate, 'MMM yyyy')}</h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-zinc-800 rounded-md text-slate-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={nextMonth} className="p-1 hover:bg-zinc-800 rounded-md text-slate-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[9px] uppercase font-bold text-slate-600 py-1">{d}</div>
                ))}
                {days.map((day, i) => {
                    const isStreak = hasStreak(day);
                    const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                aspect-square flex flex-col items-center justify-center relative rounded-md transition-all
                                ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                                ${isToday ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/50' : 'bg-zinc-900/60'}
                                hover:bg-zinc-800
                            `}
                        >
                            {/* Fire icon always behind the number */}
                            {isStreak && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
                                    <Flame className="w-6 h-6 text-orange-500 fill-orange-500 blur-[2px]" />
                                </div>
                            )}
                            {isStreak && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                </div>
                            )}

                            <span className={`relative z-10 text-xs font-bold ${isToday ? 'text-green-300' : isStreak ? 'text-white' : 'text-slate-300'} drop-shadow-md`}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
