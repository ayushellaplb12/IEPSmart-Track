export type Score = 1 | 2 | 3 | 4 | 5;

export interface Indicator {
  id: string;
  category: string;
  text: string;
  frequency?: string;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  nisn: string;
  nis?: string;
  gender?: string;
  birthDate?: string;
  chronologicalAge?: string;
  parentName?: string;
  address?: string;
  phone?: string;
  schoolName?: string;
  indicators: Indicator[];
  createdAt?: string;
  uploadedFile?: {
    name: string;
    size: string;
    date: string;
  };
}

export interface DailyRecord {
  id: string;
  studentId: string;
  date: string; // ISO format
  scores: Record<string, Score>;
  activityLog: string;
  summary?: string;
}

export interface CategoryAverage {
  category: string;
  average: number;
}

