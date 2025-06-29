import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Play, Pause, Trash2, Share2, User } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { Task } from '../types';
import { useTask } from '../contexts/TaskContext';
import Modal from './Modal';
import ShareTaskForm from './ShareTaskForm';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask } = useTask();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = () => {
    const statusOrder = ['pending', 'in-progress', 'completed'] as const;
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateTask(task.id, { status: nextStatus });
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'medium':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'low':
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'in-progress':
        return 'bg-accent-100 text-accent-800 border-accent-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Play className="w-4 h-4" />;
      case 'pending':
        return <Pause className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const getDueDateStatus = () => {
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate) && task.status !== 'completed') {
      return 'overdue';
    }
    if (isToday(dueDate)) {
      return 'today';
    }
    return 'upcoming';
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <AlertCircle className="w-3 h-3 mr-1" />
            {task.priority}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
          </span>

          {task.sharedWith.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              <User className="w-3 h-3 mr-1" />
              Shared ({task.sharedWith.length})
            </span>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center text-sm mb-4 ${
            dueDateStatus === 'overdue' 
              ? 'text-error-600' 
              : dueDateStatus === 'today'
              ? 'text-warning-600'
              : 'text-gray-600'
          }`}>
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
              {dueDateStatus === 'overdue' && ' (Overdue)'}
              {dueDateStatus === 'today' && ' (Today)'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStatusChange}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              {task.status === 'completed' ? 'Mark Pending' : 
               task.status === 'in-progress' ? 'Mark Complete' : 'Start Task'}
            </button>
            
            <button
              onClick={onEdit}
              className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Share task"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 hover:text-error-600 transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Updated timestamp */}
        <div className="flex items-center text-xs text-gray-400 mt-3">
          <Clock className="w-3 h-3 mr-1" />
          Updated {format(new Date(task.updatedAt), 'MMM d, h:mm a')}
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Task"
      >
        <ShareTaskForm
          task={task}
          onClose={() => setShowShareModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskCard;