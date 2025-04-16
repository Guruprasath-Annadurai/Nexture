export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  location?: string;
  type: 'interview' | 'deadline' | 'followup' | 'meeting' | 'other';
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
  reminderNotificationId?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'interview' | 'deadline' | 'followup' | 'meeting' | 'other';
  reminderEnabled?: boolean;
  reminderMinutesBefore?: number;
}

export type CalendarViewMode = 'day' | 'week' | 'month';