import React, { useState } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { Task, Tag } from '../types';

interface TaskEditModalProps {
  task: Task;
  availableTags: Tag[];
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
}

export function TaskEditModal({ task, availableTags, onSave, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    task.tags?.map(tag => tag.id) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      title,
      due_date: dueDate,
      tags: availableTags.filter(tag => selectedTags.includes(tag.id))
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Modifier la tâche</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              required
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center px-3 h-8 rounded-full text-sm ${
                    selectedTags.includes(tag.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-12 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-base font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 h-12 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-base font-medium"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}