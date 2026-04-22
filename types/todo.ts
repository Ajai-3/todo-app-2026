export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Status = 'pending' | 'in-progress' | 'completed';

export interface RecurrencePattern {
  type: string;
  days: string[];
  endDate: string | null;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  estimatedTime: number;
  actualTime: number;
  category: string;
  tags?: string[];
  subtasks?: Subtask[];
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern | null;
  parentRecurringId?: string;
  instanceDate?: string;
  timerActive: boolean;
  timerStartedAt?: string | null;
  timerElapsed: number;
  createdAt: string;
  completedAt?: string | null;
  completedAtToasted?: boolean;
  isArchived: boolean;
}

export interface AppState {
  todos: Todo[];
  categories: string[];
  settings: {
    timerEnabled: boolean;
  };
  loaded?: boolean;
}
