import React, { useState } from 'react';
import { User, Mail, X } from 'lucide-react';
import { Task } from '../types';
import { useTask } from '../contexts/TaskContext';
import { useToast } from '../contexts/ToastContext';

interface ShareTaskFormProps {
  task: Task;
  onClose: () => void;
}

const ShareTaskForm: React.FC<ShareTaskFormProps> = ({ task, onClose }) => {
  const { shareTask } = useTask();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      addToast({
        type: 'error',
        message: 'Please enter an email address'
      });
      return;
    }

    if (!email.includes('@')) {
      addToast({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return;
    }

    if (task.sharedWith.includes(email)) {
      addToast({
        type: 'warning',
        message: 'This task is already shared with this user'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      shareTask(task.id, email);
      setEmail('');
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to share task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSharedUser = (emailToRemove: string) => {
    // In a real app, this would call an API to remove the user
    addToast({
      type: 'info',
      message: `Removed ${emailToRemove} from task sharing`
    });
  };

  return (
    <div className="space-y-6">
      {/* Task Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
        <p className="text-sm text-gray-600">
          Share this task with others to collaborate
        </p>
      </div>

      {/* Share Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sharing...' : 'Share Task'}
        </button>
      </form>

      {/* Currently Shared With */}
      {task.sharedWith.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Currently shared with:
          </h4>
          <div className="space-y-2">
            {task.sharedWith.map((sharedEmail) => (
              <div
                key={sharedEmail}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{sharedEmail}</span>
                </div>
                <button
                  onClick={() => removeSharedUser(sharedEmail)}
                  className="text-gray-400 hover:text-error-600 transition-colors"
                  title="Remove access"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareTaskForm;