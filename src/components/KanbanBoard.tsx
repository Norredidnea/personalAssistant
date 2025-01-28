import React from 'react';
import { DndContext, DragEndEvent, closestCenter, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { Task } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => Promise<void>;
  onTaskSelect: (task: Task) => void;
}

export function KanbanBoard({ 
  tasks, 
  onTaskMove, 
  onTaskEdit, 
  onTaskDelete,
  onPriorityChange,
  onTaskSelect
}: KanbanBoardProps) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const columns = {
    TODO: tasks.filter(task => task.status === 'TODO'),
    IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
    DONE: tasks.filter(task => task.status === 'DONE'),
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const container = over.id as string;
    
    if (container && ['TODO', 'IN_PROGRESS', 'DONE'].includes(container)) {
      onTaskMove(taskId, container);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <KanbanColumn
            title="À FAIRE"
            status="TODO"
            tasks={columns.TODO}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onPriorityChange={onPriorityChange}
            onTaskSelect={onTaskSelect}
          />
          <KanbanColumn
            title="EN COURS"
            status="IN_PROGRESS"
            tasks={columns.IN_PROGRESS}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onPriorityChange={onPriorityChange}
            onTaskSelect={onTaskSelect}
          />
          <KanbanColumn
            title="TERMINÉ"
            status="DONE"
            tasks={columns.DONE}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onPriorityChange={onPriorityChange}
            onTaskSelect={onTaskSelect}
          />
        </SortableContext>
      </div>
    </DndContext>
  );
}