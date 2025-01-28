import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Loader2, LogOut, Mail, Tag as TagIcon, Bell, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskEditModal } from './components/TaskEditModal';
import { ReminderForm } from './components/ReminderForm';
import { EventForm } from './components/EventForm';
import { EventDetails } from './components/EventDetails';
import { Task, Tag, CalendarEvent, Reminder } from './types';
import { TaskExport } from './components/TaskExport';
import { TaskDetails } from './components/TaskDetails';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [selectedTaskForReminder, setSelectedTaskForReminder] = useState<Task | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setTasks([]);
      setCalendarEvents([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la déconnexion');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setEmail('');
      setPassword('');
      setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setIsSignUp(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte');
    }
  };

  async function fetchData() {
    try {
      setLoading(true);
      
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (tagsError) throw tagsError;
      setAvailableTags(tagsData || []);

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_tags (
            tags (
              id,
              name
            )
          )
        `)
        .order('due_date', { ascending: true });

      if (tasksError) throw tasksError;

      const formattedTasks = tasksData?.map(task => ({
        ...task,
        tags: task.task_tags?.map((tt: any) => tt.tags) || []
      })) || [];

      setTasks(formattedTasks);

      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_at', { ascending: true });

      if (eventsError) throw eventsError;
      setCalendarEvents(eventsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  const handleTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du déplacement de la tâche');
    }
  };

  const handleTaskEdit = async (updatedTask: Task) => {
    try {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: updatedTask.title,
          due_date: updatedTask.due_date,
          time: updatedTask.time,
        })
        .eq('id', updatedTask.id);

      if (taskError) throw taskError;

      const { error: deleteError } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', updatedTask.id);

      if (deleteError) throw deleteError;

      if (updatedTask.tags && updatedTask.tags.length > 0) {
        const tagAssociations = updatedTask.tags.map(tag => ({
          task_id: updatedTask.id,
          tag_id: tag.id
        }));

        const { error: insertError } = await supabase
          .from('task_tags')
          .insert(tagAssociations);

        if (insertError) throw insertError;
      }

      await fetchData();
      setEditingTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la tâche');
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: newTask.trim(),
            due_date: newTaskDate || null,
            time: newTaskTime || null,
            status: 'TODO',
            user_id: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data && selectedTags.length > 0) {
        const tagAssociations = selectedTags.map(tagId => ({
          task_id: data.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('task_tags')
          .insert(tagAssociations);

        if (tagError) throw tagError;
      }

      await fetchData();
      setNewTask('');
      setNewTaskDate('');
      setNewTaskTime('');
      setSelectedTags([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la tâche');
    }
  };

  const handleAddEvent = async (event: {
    title: string;
    description: string;
    start_at: string;
    end_at: string;
    all_day: boolean;
    location?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          ...event,
          user_id: user?.id,
        }]);

      if (error) throw error;
      
      setShowEventForm(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'événement');
    }
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: event.title,
          description: event.description,
          start_at: event.start_at,
          end_at: event.end_at,
          all_day: event.all_day,
          location: event.location,
        })
        .eq('id', event.id);

      if (error) throw error;
      
      await fetchData();
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'événement');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'événement');
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Assistant Personnel Virtuel</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 h-12 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {isSignUp ? "S'inscrire" : "Se connecter"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-purple-600 hover:text-purple-700 text-sm"
            >
              {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-12 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Assistant Personnel Virtuel</h1>
            <p className="text-sm sm:text-base text-gray-600">Gérez votre temps efficacement</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Section Rendez-vous */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Prochains rendez-vous</h2>
              <button
                onClick={() => setShowEventForm(true)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4">
              {calendarEvents
                .filter(event => new Date(event.start_at) >= new Date())
                .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                .map(event => (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(event);
                          }}
                          className="text-gray-500 hover:text-purple-600 transition-colors p-1"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                          className="text-gray-500 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {new Date(event.start_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </span>
                      {!event.all_day && (
                        <>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>
                            {new Date(event.start_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                    {event.location && (
                      <div className="mt-2 text-sm text-gray-600">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Section Kanban */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={addTask} className="flex-1">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Nouvelle tâche..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="grid grid-cols-2 sm:flex gap-2">
                    <div className="relative">
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <input
                        type="time"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                      />
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 sm:col-span-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="sm:hidden">Ajouter</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center px-3 py-1 rounded-full text-sm ${
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
              </form>
              
              <div className="sm:self-start">
                <TaskExport tasks={tasks} />
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[768px] sm:min-w-0 px-4 sm:px-0">
                <KanbanBoard
                  tasks={tasks}
                  onTaskMove={handleTaskMove}
                  onTaskEdit={setEditingTask}
                  onTaskDelete={handleTaskDelete}
                  onPriorityChange={async (taskId, priority) => {
                    try {
                      const { error } = await supabase
                        .from('tasks')
                        .update({ priority })
                        .eq('id', taskId);

                      if (error) throw error;

                      setTasks(tasks.map(task =>
                        task.id === taskId ? { ...task, priority } : task
                      ));
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la priorité');
                    }
                  }}
                  onTaskSelect={setSelectedTask}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modales */}
        {editingTask && (
          <TaskEditModal
            task={editingTask}
            availableTags={availableTags}
            onSave={handleTaskEdit}
            onClose={() => setEditingTask(null)}
          />
        )}

        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={() => {
              setEditingTask(selectedTask);
              setSelectedTask(null);
            }}
            onDelete={() => {
              handleTaskDelete(selectedTask.id);
              setSelectedTask(null);
            }}
            onPriorityChange={async (taskId, priority) => {
              try {
                const { error } = await supabase
                  .from('tasks')
                  .update({ priority })
                  .eq('id', taskId);

                if (error) throw error;

                setTasks(tasks.map(task =>
                  task.id === taskId ? { ...task, priority } : task
                ));
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la priorité');
              }
            }}
          />
        )}

        {showEventForm && (
          <EventForm
            onSubmit={handleAddEvent}
            onClose={() => setShowEventForm(false)}
          />
        )}

        {editingEvent && (
          <EventForm
            event={editingEvent}
            onSubmit={handleEditEvent}
            onClose={() => setEditingEvent(null)}
          />
        )}

        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={() => {
              setEditingEvent(selectedEvent);
              setSelectedEvent(null);
            }}
            onDelete={() => {
              handleDeleteEvent(selectedEvent.id);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;