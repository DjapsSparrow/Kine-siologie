import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Edit, Trash2, FolderPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProtocolForm from '../components/protocols/ProtocolForm';
import EditProtocolForm from '../components/protocols/EditProtocolForm';
import CategoryForm from '../components/protocols/CategoryForm';
import { Protocol } from '../types';

const Protocols: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select(`
          *,
          category:protocol_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProtocols(data || []);
    } catch (error) {
      console.error('Error fetching protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProtocol = async (data: Partial<Protocol>) => {
    try {
      const { error } = await supabase
        .from('protocols')
        .insert([data])
        .select();

      if (error) throw error;
      fetchProtocols();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating protocol:', error);
      throw error;
    }
  };

  const handleUpdateProtocol = async (id: string, data: Partial<Protocol>) => {
    try {
      const { error } = await supabase
        .from('protocols')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      fetchProtocols();
      setShowEditForm(false);
      setSelectedProtocol(null);
    } catch (error) {
      console.error('Error updating protocol:', error);
      throw error;
    }
  };

  const handleDeleteProtocol = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce protocole ?')) return;

    try {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProtocols();
    } catch (error) {
      console.error('Error deleting protocol:', error);
      alert('Une erreur est survenue lors de la suppression');
    }
  };

  const filteredProtocols = protocols.filter(protocol =>
    (protocol.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (protocol.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {showForm && (
        <ProtocolForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateProtocol}
        />
      )}

      {showEditForm && selectedProtocol && (
        <EditProtocolForm
          protocol={selectedProtocol}
          onClose={() => {
            setShowEditForm(false);
            setSelectedProtocol(null);
          }}
          onSubmit={handleUpdateProtocol}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          onClose={() => setShowCategoryForm(false)}
          onSuccess={fetchProtocols}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Protocoles</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FolderPlus size={16} className="mr-2" />
            Nouvelle catégorie
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle size={16} className="mr-2" />
            Nouveau protocole
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un protocole..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProtocols.map((protocol) => (
            <li key={protocol.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {protocol.name}
                  </h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setSelectedProtocol(protocol);
                        setShowEditForm(true);
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProtocol(protocol.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {protocol.description && (
                  <p className="mt-2 text-sm text-gray-500">
                    {protocol.description}
                  </p>
                )}
                <div className="mt-2">
                  {protocol.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {protocol.category.name}
                    </span>
                  )}
                  {protocol.file_url && (
                    <a
                      href={protocol.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-green-600 hover:text-green-800"
                    >
                      Voir le document
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Protocols;