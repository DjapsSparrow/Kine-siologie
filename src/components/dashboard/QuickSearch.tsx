import React, { useState } from 'react';
import { Search } from 'lucide-react';

const QuickSearch: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="relative">
      <div className="flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent overflow-hidden bg-white">
        <div className="pl-4 pr-2">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Rechercher un protocole..."
          className="flex-1 py-3 px-2 focus:outline-none text-sm"
        />
      </div>
      {searchValue && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-64 overflow-y-auto">
          <div className="p-2">
            <p className="text-sm text-gray-500 mb-2">Aucun résultat pour "{searchValue}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSearch;