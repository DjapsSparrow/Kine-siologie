import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, Download, Trash2, Edit, Eye, 
  Phone, Mail, Calendar, FileText, Paperclip 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import ClientForm from '../components/clients/ClientForm';
import EditClientForm from '../components/clients/EditClientForm';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          appointments (
            id,
            date,
            start_time,
            status
          ),
          sessions (
            id,
            client_feedback,
            practitioner_observations
          ),
          documents (
            id,
            name,
            file_url
          )
        `)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (clientData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    global_summary?: string;
    personal_notes?: string;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            ...clientData,
            created_by: user.user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [...prev, data]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Une erreur est survenue lors de la création du client');
    }
  };

  const handleEditClient = async (id: string, clientData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    global_summary?: string;
    personal_notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ));
      setShowEditForm(false);
      setClientToEdit(null);

      // Update selected client if it's being edited
      if (selectedClient?.id === id) {
        setSelectedClient({ ...selectedClient, ...data });
      }
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Une erreur est survenue lors de la modification du client');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Une erreur est survenue lors de la suppression du client');
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower))
    );
  });

  const ClientCard = ({ client }: { client: Client }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {client.first_name} {client.last_name}
          </h3>
          {client.email && (
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Mail size={14} className="mr-1" />
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Phone size={14} className="mr-1" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedClient(client)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => {
              setClientToEdit(client);
              setShowEditForm(true);
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDeleteClient(client.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-3 mt-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar size={14} className="mr-1" />
            <span>
              {client.date_of_birth && format(new Date(client.date_of_birth), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {client.documents?.length > 0 && (
              <span className="flex items-center text-gray-600">
                <Paperclip size={14} className="mr-1" />
                {client.documents.length}
              </span>
            )}
            {client.sessions?.length > 0 && (
              <span className="flex items-center text-gray-600">
                <FileText size={14} className="mr-1" />
                {client.sessions.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ClientTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date de naissance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernier RDV
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {client.first_name} {client.last_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {client.email && (
                    <div className="flex items-center">
                      <Mail size={14} className="mr-1" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center mt-1">
                      <Phone size={14} className="mr-1" />
                      {client.phone}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {client.date_of_birth && 
                    format(new Date(client.date_of_birth), 'dd MMM yyyy', { locale: fr })}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {client.appointments && client.appointments[0] ? (
                    format(new Date(client.appointments[0].date), 'dd MMM yyyy', { locale: fr })
                  ) : (
                    <span className="text-gray-400 italic">N'a jamais pris de RDV</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setClientToEdit(client);
                      setShowEditForm(true);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ClientDetail = ({ client }: { client: Client }) => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {client.first_name} {client.last_name}
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setClientToEdit(client);
              setShowEditForm(true);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <Edit size={20} />
          </button>
          <button 
            onClick={() => setSelectedClient(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informations personnelles
            </h3>
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.date_of_birth && (
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    {format(new Date(client.date_of_birth), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {client.global_summary && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Résumé global
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {client.global_summary}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rendez-vous
            </h3>
            {client.appointments && client.appointments.length > 0 ? (
              <div className="space-y-3">
                {client.appointments.map(appointment => (
                  <div 
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {format(new Date(appointment.date), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">N'a jamais pris de RDV</p>
            )}
          </div>

          {client.documents && client.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Documents
              </h3>
              <div className="space-y-2">
                {client.documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg group"
                  >
                    <Paperclip size={16} className="text-gray-400 mr-2" />
                    <span className="text-gray-600 group-hover:text-gray-900">
                      {doc.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
        <ClientForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateClient}
        />
      )}

      {showEditForm && clientToEdit && (
        <EditClientForm
          client={clientToEdit}
          onClose={() => {
            setShowEditForm(false);
            setClientToEdit(null);
          }}
          onSubmit={handleEditClient}
        />
      )}

      {selectedClient ? (
        <ClientDetail client={selectedClient} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus size={16} className="mr-2" />
              Nouveau client
            </button>
          </div>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <Filter size={16} className="mr-2" />
                    Filtres
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <Download size={16} className="mr-2" />
                    Exporter
                  </button>
                  <div className="border-l border-gray-300 h-6"></div>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Aucun client ne correspond à votre recherche</p>
                  <button 
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus size={16} className="mr-2" />
                    Ajouter un client
                  </button>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClients.map(client => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              ) : (
                <ClientTable />
              )}
            </div>
          </div>
        </>
      )}
    
    </div>
  );
};

export default Clients;