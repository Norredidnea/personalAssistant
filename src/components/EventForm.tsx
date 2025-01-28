import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, X, MapPin, AlertCircle } from 'lucide-react';

interface EventFormProps {
  event?: {
    id: string;
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    all_day: boolean;
    location?: string;
  };
  onSubmit: (event: {
    id?: string;
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    all_day: boolean;
    location?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function EventForm({ event, onSubmit, onClose }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startDate, setStartDate] = useState(event?.start_at.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(event?.start_at.split('T')[1]?.slice(0, 5) || '09:00');
  const [location, setLocation] = useState(event?.location || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    const start_at = `${startDate}T${startTime}:00`;
    // On définit automatiquement la fin 1h après le début
    const end_at = new Date(new Date(`${startDate}T${startTime}`).getTime() + 60 * 60 * 1000).toISOString();

    try {
      await onSubmit({
        ...(event?.id ? { id: event.id } : {}),
        title: title.trim(),
        description: description.trim(),
        start_at,
        end_at,
        all_day: false,
        location: location.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            {event ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Rendez-vous avec Me Dupont"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date et heure
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                  required
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <div className="relative">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                placeholder="Ex: Cabinet d'avocat"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              placeholder="Détails du rendez-vous..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {event ? 'Modifier' : 'Créer'} le rendez-vous
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}