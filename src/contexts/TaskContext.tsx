import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskFilter } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filters: TaskFilter;
  isLoading: boolean;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  shareTask: (taskId: string, email: string) => void;
  setFilters: (filters: TaskFilter) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilter>({
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load tasks on mount
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  // Simulate real-time updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Simulate receiving updates
      const randomUpdate = Math.random() > 0.95; // 5% chance every 5 seconds
      if (randomUpdate && tasks.length > 0) {
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        addToast({
          type: 'info',
          message: `Task "${randomTask.title}" was updated by a collaborator`
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, tasks, addToast]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Complete project proposal',
          description: 'Finish the Q4 project proposal and send it to stakeholders',
          priority: 'high',
          status: 'in-progress',
          dueDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: [user!.id],
          sharedWith: ['jane@example.com'],
          createdBy: user!.id
        },
        {
          id: '2',
          title: 'Review team performance',
          description: 'Conduct quarterly performance reviews for team members',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 172800000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: [user!.id],
          sharedWith: [],
          createdBy: user!.id
        },
        {
          id: '3',
          title: 'Update documentation',
          description: 'Update API documentation with latest changes',
          priority: 'low',
          status: 'completed',
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: [user!.id],
          sharedWith: ['dev@example.com'],
          createdBy: user!.id
        }
      ];
      
      setTasks(mockTasks);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to load tasks'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user!.id
    };
    
    setTasks(prev => [newTask, ...prev]);
    addToast({
      type: 'success',
      message: 'Task created successfully'
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
    addToast({
      type: 'success',
      message: 'Task updated successfully'
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    addToast({
      type: 'success',
      message: 'Task deleted successfully'
    });
  };

  const shareTask = (taskId: string, email: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            sharedWith: [...task.sharedWith, email],
            updatedAt: new Date().toISOString()
          }
        : task
    ));
    addToast({
      type: 'success',
      message: `Task shared with ${email}`
    });
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Due date filter
    if (filters.dueDate !== 'all' && task.dueDate) {
      const now = new Date();
      const taskDue = new Date(task.dueDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDueDate = new Date(taskDue.getFullYear(), taskDue.getMonth(), taskDue.getDate());
      
      switch (filters.dueDate) {
        case 'today':
          if (taskDueDate.getTime() !== today.getTime()) return false;
          break;
        case 'overdue':
          if (taskDueDate.getTime() >= today.getTime()) return false;
          break;
        case 'this-week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (taskDueDate.getTime() > weekFromNow.getTime()) return false;
          break;
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return task.title.toLowerCase().includes(searchLower) ||
             task.description?.toLowerCase().includes(searchLower);
    }

    return true;
  });

  const value = {
    tasks,
    filteredTasks,
    filters,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    shareTask,
    setFilters
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};