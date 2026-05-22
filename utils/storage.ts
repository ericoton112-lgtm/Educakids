import type { Student, SupplyCategory, FocusItem, WeeklyPlan, ActivityHistoryItem, TeacherProfile, MoodRecord } from '@/types';

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

export function getStudents(): Student[] {
  return getItem<Student[]>('educakids_students', []);
}

export function saveStudents(students: Student[]) {
  setItem('educakids_students', students);
}

export function getSupplies(): SupplyCategory[] {
  return getItem<SupplyCategory[]>('educakids_supplies', []);
}

export function saveSupplies(supplies: SupplyCategory[]) {
  setItem('educakids_supplies', supplies);
}

export function getFocusItems(): FocusItem[] {
  return getItem<FocusItem[]>('educakids_focus_items', []);
}

export function saveFocusItems(items: FocusItem[]) {
  setItem('educakids_focus_items', items);
}

export function getTeacherProfile(): TeacherProfile | null {
  return getItem<TeacherProfile | null>('educakids_user', null);
}

export function saveTeacherProfile(profile: TeacherProfile) {
  setItem('educakids_user', profile);
}

export function getWeeklyPlan(weekKey: string): WeeklyPlan | null {
  return getItem<WeeklyPlan | null>(`educakids_plan_${weekKey}`, null);
}

export function saveWeeklyPlan(weekKey: string, plan: WeeklyPlan) {
  setItem(`educakids_plan_${weekKey}`, plan);
}

export function getActivityHistory(): ActivityHistoryItem[] {
  return getItem<ActivityHistoryItem[]>('educakids_activity_history', []);
}

export function saveActivityHistory(history: ActivityHistoryItem[]) {
  setItem('educakids_activity_history', history);
}

export function getMoodHistory(): MoodRecord[] {
  return getItem<MoodRecord[]>('educakids_mood_history', []);
}

export function saveMoodRecord(record: MoodRecord) {
  const history = getMoodHistory();
  const existing = history.findIndex(h => h.date === record.date);
  if (existing >= 0) {
    history[existing] = record;
  } else {
    history.push(record);
  }
  const trimmed = history.slice(-90);
  setItem('educakids_mood_history', trimmed);
}
