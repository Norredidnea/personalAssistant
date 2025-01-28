import React from 'react';
import { Calendar as CalendarIcon, Clock, X, AlignLeft, MapPin } from 'lucide-react';
import { CalendarEvent } from '../types';

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetails({ event, onClose, onEdit, onDelete }: EventDetailsProps) {
  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {event.description && (
            <div className="flex gap-3">
              <AlignLeft className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-700">
                  {formatDate(startDate)}
                </p>
                {event.all_day ? (
                  <span className="text-sm text-gray-500">Toute la journée</span>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <p className="text-gray-700">{event.location}</p>
              </div>
            )}
          </div>

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