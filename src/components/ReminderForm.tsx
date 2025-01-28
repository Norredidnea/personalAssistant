import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Task } from '../types';

interface ReminderFormProps {
  task: Task;
  onSubmit: (taskId: string, remindAt: string) => Promise<void>;
  onClose: () => void;
}

export function ReminderForm({ task, onSubmit, onClose }: ReminderFormProps) {
  const [remindAt, setRemindAt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remindAt) return;
    
    await onSubmit(task.id, remindAt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Ajouter un rappel</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tâche
            </label>
            <div className="text-gray-900">{task.title}</div>
          </div>

          <div>
            <label htmlFor="remindAt" className="block text-sm font-medium text-gray-700 mb-1">
              Me rappeler le
            </label>
            <input
              type="datetime-local"
              id="remindAt"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="w-full px-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Définir le rappel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}