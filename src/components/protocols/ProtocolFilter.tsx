import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { ProtocolCategory } from '../../types';

interface ProtocolFilterProps {
  onFilterChange: (filters: {
    category?: ProtocolCategory | null;
    symptoms?: string[];
    favorites?: boolean;
    search?: string;
  }) => void;
}

const ProtocolFilter: React.FC<ProtocolFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: null as ProtocolCategory | null,
    symptoms: [] as string[],
    favorites: false,
    search: ''
  });
  
  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryChange = (category: ProtocolCategory | null) => {
    const updatedFilters = { ...filters, category };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleFavoritesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFilters = { ...filters, favorites: e.target.checked };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: null,
      symptoms: [],
      favorites: false,
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const categories: {value: ProtocolCategory | null, label: string}[] = [
    { value: null, label: 'Tous' },
    { value: 'emotional', label: 'Émotionnel' },
    { value: 'digestive', label: 'Digestif' },
    { value: 'energetic', label: 'Énergétique' },
    { value: 'structural', label: 'Structurel' },
    { value: 'neurological', label: 'Neurologique' },
    { value: 'other', label: 'Autre' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div 
        className="p-4 flex justify-between cursor-pointer items-center"
        onClick={toggleFilter}
      >
        <div className="flex items-center">
          <Filter size={16} className="text-gray-600 mr-2" />
          <span className="font-medium text-gray-700">Filtres</span>
        </div>
        <span className="text-sm text-gray-500">
          {isOpen ? 'Masquer' : 'Afficher'}
        </span>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-100">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Système
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value ?? 'all'}
                  className={`py-1 px-3 text-sm rounded-md ${
                    filters.category === category.value
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryChange(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Favoris uniquement
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filters.favorites}
                onChange={handleFavoritesChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                Afficher uniquement les favoris
              </span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              className="flex items-center text-sm text-red-600 hover:text-red-700"
              onClick={handleResetFilters}
            >
              <X size={14} className="mr-1" />
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolFilter;