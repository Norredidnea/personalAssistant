import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Tag as TagIcon, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { TaskPriority } from './TaskPriority';

const getTagColor = (tagName: string) => {
  const colors: { [key: string]: string } = {
    'personnel': 'bg-blue-50 text-blue-700',
    'travail': 'bg-purple-50 text-purple-700',
    'urgent': 'bg-red-50 text-red-700',
    'avocat': 'bg-amber-50 text-amber-700',
    'huissier': 'bg-orange-50 text-orange-700',
    'toulouse': 'bg-emerald-50 text-emerald-700',
    'enfants': 'bg-pink-50 text-pink-700',
    'golfech': 'bg-cyan-50 text-cyan-700'
  };

  return colors[tagName.toLowerCase()] || 'bg-gray-50 text-gray-700';
};

interface KanbanTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => Promise<void>;
  onSelect: (task: Task) => void;
}

export function KanbanTask({ 
  task, 
  onEdit, 
  onDelete,
  onPriorityChange,
  onSelect
}: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow touch-manipulation w-full cursor-pointer"
      onClick={() => onSelect(task)}
    >
      <div className="flex items-start gap-2">
        <div 
          {...attributes} 
          {...listeners}
          className="touch-manipulation cursor-grab active:cursor-grabbing"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-medium text-gray-800 text-sm truncate">{task.title}</h4>
            <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {task.due_date && (
            <p className="text-xs text-gray-500 mt-1">
              Échéance : {task.due_date}
            </p>
          )}
          
          <div className="mt-2" onClick={e => e.stopPropagation()}>
            <TaskPriority 
              task={task}
              onPriorityChange={onPriorityChange}
            />
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map(tag => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getTagColor(tag.name)}`}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}