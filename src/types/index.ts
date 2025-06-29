export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string[];
  sharedWith: string[];
  createdBy: string;
}

export interface TaskFilter {
  status?: 'all' | 'pending' | 'in-progress' | 'completed';
  priority?: 'all' | 'low' | 'medium' | 'high';
  dueDate?: 'all' | 'today' | 'overdue' | 'this-week';
  search?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}