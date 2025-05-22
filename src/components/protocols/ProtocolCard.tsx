import React from 'react';
import { Star, FileText, Edit } from 'lucide-react';
import { Protocol } from '../../types';

interface ProtocolCardProps {
  protocol: Protocol;
  onToggleFavorite: (id: string) => void;
  onClick: (id: string) => void;
}

const ProtocolCard: React.FC<ProtocolCardProps> = ({ 
  protocol,
  onToggleFavorite,
  onClick
}) => {
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

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-lg font-medium text-gray-800 hover:text-green-700 cursor-pointer"
            onClick={() => onClick(protocol.id)}
          >
            {protocol.name}
          </h3>
          <button
            className={`p-1 rounded-full ${protocol.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(protocol.id);
            }}
            aria-label={protocol.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Star size={18} fill={protocol.isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="mb-4">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(protocol.category)}`}>
            {protocol.category}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            Ajouté le {formatDate(protocol.dateAdded)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {protocol.objective}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {protocol.symptoms.map((symptom, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex border-t border-gray-100">
        <button
          className="flex-1 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
          onClick={() => onClick(protocol.id)}
        >
          <FileText size={16} className="mr-1" />
          Ouvrir
        </button>
        
        <button
          className="flex-1 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center border-l border-gray-100"
        >
          <Edit size={16} className="mr-1" />
          Notes
        </button>
      </div>
    </div>
  );
};

export default ProtocolCard;