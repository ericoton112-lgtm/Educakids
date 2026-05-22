export interface Student {
  id: string;
  name: string;
  class: string;
  behavior: 'smile' | 'meh' | 'sad' | 'absent';
  notes: string;
  color: string;
  tags: string[];
  age: string;
  parentName: string;
  emergencyContact: string;
}

export interface SupplyItem {
  name: string;
  val: string;
  status: 'ok' | 'low' | 'empty' | 'completed';
}

export interface SupplyCategory {
  category: string;
  items: SupplyItem[];
}

export interface FocusItem {
  id: number;
  title: string;
  done: boolean;
}

export interface PlanDay {
  day: string;
  date?: string;
  focus: string;
  iconName: string;
  iconBg: string;
  activities: { type: string; text: string }[];
}

export interface WeeklyPlan {
  theme: string;
  goals: string[];
  days: PlanDay[];
}

export interface Activity {
  title: string;
  ageRange: string;
  duration: string;
  type: string;
  description: string;
  materials: string[];
  steps: { title: string; content: string }[];
  studentQuestions?: string[];
  illustrationPrompts?: string[];
}

export interface ActivityHistoryItem {
  id: string;
  timestamp: string;
  formData: {
    ageGroup: string;
    theme: string;
    difficulty: string;
    activityType: string[];
  };
  activity: Activity;
}

export interface MoodRecord {
  date: string;
  smileCount: number;
  mehCount: number;
  sadCount: number;
  totalPresent: number;
}

export interface TeacherProfile {
  name: string;
  email?: string;
  classes?: string;
  school?: string;
}
