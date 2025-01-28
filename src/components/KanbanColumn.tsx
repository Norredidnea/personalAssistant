import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanTask } from './KanbanTask';
import { Task } from '../types';

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => Promise<void>;
  onTaskSelect: (task: Task) => void;
}

const getColumnStyle = (status: string) => {
  switch (status) {
    case 'TODO':
      return 'bg-rose-50 border-rose-200 text-rose-800';
    case 'IN_PROGRESS':
      return 'bg-sky-50 border-sky-200 text-sky-800';
    case 'DONE':
      return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export function KanbanColumn({ 
  title, 
  status, 
  tasks, 
  onTaskEdit, 
  onTaskDelete,
  onPriorityChange,
  onTaskSelect
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const columnStyle = getColumnStyle(status);

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50/50 rounded-lg p-1 sm:p-2"
    >
      <div className={`rounded-lg px-2 py-1.5 mb-2 border ${columnStyle}`}>
        <h3 className="font-semibold text-base">{title}</h3>
        <div className="text-xs opacity-75">{tasks.length} tâches</div>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <KanbanTask
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onPriorityChange={onPriorityChange}
            onSelect={onTaskSelect}
          />
        ))}
      </div>
    </div>
  );
}