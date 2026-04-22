import { useState, useEffect } from 'react';
import { AppState } from '@/types/todo';
import { LS_KEY, DEFAULT_CATEGORIES } from '@/components/constants';

export function useAppState(): [AppState, React.Dispatch<React.SetStateAction<AppState>>] {
  const [state, setState] = useState<AppState>({ 
    todos: [], 
    categories: DEFAULT_CATEGORIES, 
    settings: { timerEnabled: true }, 
    loaded: false 
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...parsed, loaded: true });
      } else {
        setState(s => ({ ...s, loaded: true }));
      }
    } catch { 
      setState(s => ({ ...s, loaded: true }));
    }
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    const { loaded, ...toSave } = state;
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  }, [state]);

  return [state, setState];
}
