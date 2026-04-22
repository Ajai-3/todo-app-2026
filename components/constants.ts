export const LS_KEY = 'emerald_todo_app_v1';

export const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'medium', label: 'Medium', color: '#eab308' },
  { value: 'low', label: 'Low', color: '#10b981' },
];

export const STATUSES = [
  { value: 'pending', label: 'Pending', color: '#64748b' },
  { value: 'in-progress', label: 'In Progress', color: '#06b6d4' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
];

export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Errands'];

export const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WEEK_DAY_SHORT: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};
