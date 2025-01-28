export interface Tag {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  due_date: string;
  time?: string;
  completed: boolean;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  tags?: Tag[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  remind_at: string;
  status: 'PENDING' | 'SENT' | 'CANCELLED';
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  location?: string;
  created_at: string;
}