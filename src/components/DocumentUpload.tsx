import React, { useState } from 'react';
import { FileUp, File, Trash2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Document } from '../types';

interface DocumentUploadProps {
  taskId: string;
  documents: Document[];
  onDocumentAdded: () => void;
  onDocumentDeleted: () => void;
}

export function DocumentUpload({ taskId, documents, onDocumentAdded, onDocumentDeleted }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // Upload du fichier dans le bucket Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`task-${taskId}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Création de l'enregistrement dans la base de données
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          task_id: taskId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: uploadData.path,
          version: 1
        }]);

      if (dbError) throw dbError;

      onDocumentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string, url: string) => {
    try {
      setError(null);

      // Suppression du fichier dans le Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([url]);

      if (storageError) throw storageError;

      // Suppression de l'enregistrement dans la base de données
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      onDocumentDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.url);

      if (error) throw error;

      // Création d'un lien de téléchargement
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Documents</h4>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileUp className="w-4 h-4" />
            <span>{uploading ? 'Téléchargement...' : 'Ajouter'}</span>
          </div>
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">
                {doc.name}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDownload(doc)}
                className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(doc.id, doc.url)}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}