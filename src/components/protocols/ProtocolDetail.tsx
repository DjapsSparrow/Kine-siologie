import React, { useState } from 'react';
import { ArrowLeft, Star, FileText, Edit, Save, Upload } from 'lucide-react';
import { Protocol } from '../../types';
import EditProtocolForm from './EditProtocolForm';

interface ProtocolDetailProps {
  protocol: Protocol;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onUpdate: (id: string, data: Partial<Protocol>) => Promise<void>;
}

const ProtocolDetail: React.FC<ProtocolDetailProps> = ({
  protocol,
  onBack,
  onToggleFavorite,
  onSaveNotes,
  onUpdate
}) => {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(protocol.notes || '');
  const [showEditForm, setShowEditForm] = useState(false);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emotional': return 'text-purple-600 bg-purple-50';
      case 'digestive': return 'text-yellow-600 bg-yellow-50';
      case 'energetic': return 'text-blue-600 bg-blue-50';
      case 'structural': return 'text-red-600 bg-red-50';
      case 'neurological': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleSaveNotes = () => {
    onSaveNotes(protocol.id, notes);
    setEditingNotes(false);
  };

  return (
    <>
      {showEditForm && (
        <EditProtocolForm
          protocol={protocol}
          onClose={() => setShowEditForm(false)}
          onSubmit={onUpdate}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            className="text-gray-600 hover:text-gray-800 flex items-center"
            onClick={onBack}
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Retour</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <Edit size={18} className="mr-1" />
              <span>Modifier</span>
            </button>
            
            {protocol.pdfUrl && (
              <a 
                href={protocol.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FileText size={18} className="mr-1" />
                <span>PDF</span>
              </a>
            )}
            
            <button
              className={`p-1 rounded-full ${protocol.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
              onClick={() => onToggleFavorite(protocol.id)}
              aria-label={protocol.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star size={18} fill={protocol.isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">{protocol.name}</h1>
            
            <div className="flex items-center mb-4">
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${getCategoryColor(protocol.category)}`}>
                {protocol.category}
              </span>
              <span className="text-sm text-gray-500 ml-3">
                Ajouté le {formatDate(protocol.dateAdded)}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {protocol.symptoms.map((symptom, index) => (
                <span 
                  key={index}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Objectif thérapeutique</h2>
            <p className="text-gray-700">{protocol.objective}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Étapes du protocole</h2>
            <ol className="list-decimal pl-5 space-y-4">
              {protocol.steps.map((step, index) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>

          {protocol.is_dynamic && protocol.dynamic_content && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-3">Analyse dynamique</h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{protocol.dynamic_content}</p>
              </div>
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-gray-800">Notes personnelles</h2>
              {!editingNotes ? (
                <button
                  className="text-green-600 hover:text-green-700 flex items-center text-sm"
                  onClick={() => setEditingNotes(true)}
                >
                  <Edit size={16} className="mr-1" />
                  Modifier
                </button>
              ) : (
                <button
                  className="text-green-600 hover:text-green-700 flex items-center text-sm"
                  onClick={handleSaveNotes}
                >
                  <Save size={16} className="mr-1" />
                  Enregistrer
                </button>
              )}
            </div>
            
            {!editingNotes ? (
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {notes ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-gray-400 italic">Aucune note pour le moment. Cliquez sur modifier pour ajouter des notes.</p>
                )}
              </div>
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ajoutez vos notes personnelles ici..."
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProtocolDetail;