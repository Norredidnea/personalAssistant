import React from 'react';
import { Calendar as CalendarIcon, Clock, X, Tag as TagIcon, AlertTriangle, AlertCircle, Flag } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPriorityChange: (taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => Promise<void>;
}

export function TaskDetails({ task, onClose, onEdit, onDelete, onPriorityChange }: TaskDetailsProps) {
  const getPriorityInfo = () => {
    switch (task.priority) {
      case 'HIGH':
        return {
          icon: AlertTriangle,
          text: 'Haute priorité',
          class: 'text-red-600'
        };
      case 'MEDIUM':
        return {
          icon: AlertCircle,
          text: 'Priorité moyenne',
          class: 'text-yellow-600'
        };
      case 'LOW':
        return {
          icon: Flag,
          text: 'Priorité basse',
          class: 'text-green-600'
        };
      default:
        return null;
    }
  };

  const getStatusInfo = () => {
    switch (task.status) {
      case 'TODO':
        return {
          text: 'À faire',
          class: 'bg-rose-50 text-rose-700'
        };
      case 'IN_PROGRESS':
        return {
          text: 'En cours',
          class: 'bg-sky-50 text-sky-700'
        };
      case 'DONE':
        return {
          text: 'Terminé',
          class: 'bg-emerald-50 text-emerald-700'
        };
    }
  };

  const priorityInfo = getPriorityInfo();
  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.class}`}>
              {statusInfo.text}
            </span>
            {priorityInfo && (
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${priorityInfo.class}`}>
                <priorityInfo.icon className="w-4 h-4" />
                {priorityInfo.text}
              </span>
            )}
          </div>

          {task.due_date && (
            <div className="flex gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-700">
                  {new Date(task.due_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                {task.time && (
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {task.time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map(tag => (
                <span
                  key={tag.id}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}