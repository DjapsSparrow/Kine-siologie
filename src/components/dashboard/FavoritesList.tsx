import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { Protocol } from '../../types';

interface FavoritesListProps {
  favorites: Protocol[];
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites }) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Aucun favori pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favorites.map((protocol) => (
        <div 
          key={protocol.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500 mr-2" />
            <span className="text-gray-800">{protocol.name}</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      ))}
      
      {favorites.length > 0 && (
        <button className="w-full text-center text-sm text-green-600 hover:text-green-700 mt-2">
          Voir tous les favoris
        </button>
      )}
    </div>
  );
};

export default FavoritesList;