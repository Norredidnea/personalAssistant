import React from 'react';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Task } from '../types';

interface TaskExportProps {
  tasks: Task[];
}

export function TaskExport({ tasks }: TaskExportProps) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Configuration du document
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.text('Liste des tâches', margin, y);
    
    y += 15;
    doc.setFontSize(12);

    // Tri des tâches par statut
    const tasksByStatus = {
      'TODO': tasks.filter(t => t.status === 'TODO'),
      'IN_PROGRESS': tasks.filter(t => t.status === 'IN_PROGRESS'),
      'DONE': tasks.filter(t => t.status === 'DONE')
    };

    // Fonction pour ajouter une nouvelle page si nécessaire
    const checkNewPage = () => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    };

    // Parcours des tâches par statut
    Object.entries(tasksByStatus).forEach(([status, statusTasks]) => {
      checkNewPage();
      
      // Titre du statut
      const statusTitle = {
        'TODO': 'À faire',
        'IN_PROGRESS': 'En cours',
        'DONE': 'Terminé'
      }[status];
      
      doc.setFont('helvetica', 'bold');
      doc.text(statusTitle, margin, y);
      y += 10;
      
      doc.setFont('helvetica', 'normal');
      
      statusTasks.forEach(task => {
        checkNewPage();
        
        // Case à cocher
        doc.rect(margin, y - 4, 4, 4);
        if (task.status === 'DONE') {
          doc.text('✓', margin, y);
        }
        
        // Titre de la tâche
        const title = `${task.title}${task.due_date ? ` (${task.due_date})` : ''}`;
        doc.text(title, margin + 10, y);
        
        // Tags
        if (task.tags && task.tags.length > 0) {
          const tags = task.tags.map(tag => tag.name).join(', ');
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`[${tags}]`, margin + 10, y + 4);
          doc.setFontSize(12);
          doc.setTextColor(0);
          y += 8;
        }
        
        y += 8;
      });
      
      y += 5;
    });

    doc.save('taches.pdf');
  };

  return (
    <button
      onClick={exportToPDF}
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      title="Exporter en PDF"
    >
      <FileDown className="w-5 h-5" />
      <span>Exporter</span>
    </button>
  );
}