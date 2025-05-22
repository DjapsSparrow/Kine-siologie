import React from 'react';
import { File, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { Document } from '../../types';

interface RecentDocumentsProps {
  documents: Document[];
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ documents }) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'image':
        return <Image size={16} className="text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet size={16} className="text-green-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">Aucun document récent</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div 
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center">
            {getIconByType(doc.type)}
            <span className="ml-2 text-gray-800 text-sm">{doc.name}</span>
          </div>
          <span className="text-xs text-gray-500">{formatDate(doc.dateAdded)}</span>
        </div>
      ))}
      
      {documents.length > 0 && (
        <button className="w-full text-center text-sm text-green-600 hover:text-green-700 mt-2">
          Voir tous les documents
        </button>
      )}
    </div>
  );
};

export default RecentDocuments;