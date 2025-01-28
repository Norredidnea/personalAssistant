import React from 'react';
import { AlertTriangle, AlertCircle, Flag } from 'lucide-react';
import { Task } from '../types';

interface TaskPriorityProps {
  task: Task;
  onPriorityChange: (taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => Promise<void>;
}

export function TaskPriority({ task, onPriorityChange }: TaskPriorityProps) {
  const getPriorityClass = (buttonPriority: string) => {
    const isActive = task.priority === buttonPriority;
    
    switch (buttonPriority) {
      case 'HIGH':
        return isActive 
          ? 'bg-red-600 text-white hover:bg-red-700' 
          : 'bg-red-50 text-red-700 hover:bg-red-100';
      case 'MEDIUM':
        return isActive 
          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100';
      case 'LOW':
        return isActive 
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-green-50 text-green-700 hover:bg-green-100';
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPriorityChange(task.id, 'LOW')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${getPriorityClass('LOW')}`}
          title="Priorité basse"
        >
          <Flag className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onPriorityChange(task.id, 'MEDIUM')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${getPriorityClass('MEDIUM')}`}
          title="Priorité moyenne"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onPriorityChange(task.id, 'HIGH')}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${getPriorityClass('HIGH')}`}
          title="Priorité haute"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}