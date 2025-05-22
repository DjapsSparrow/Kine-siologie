import React, { useState } from 'react';
import { X, Save, Upload, FileText, Trash2, Wand2 } from 'lucide-react';
import { Protocol } from '../../types';
import { supabase } from '../../lib/supabase';

interface EditProtocolFormProps {
  protocol: Protocol;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Protocol>) => Promise<void>;
}

const EditProtocolForm: React.FC<EditProtocolFormProps> = ({
  protocol,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: protocol.name || '',
    description: protocol.description || '',
    category_id: protocol.category_id || '',
    notes: protocol.notes || '',
    is_dynamic: protocol.is_dynamic || false,
    dynamic_content: protocol.dynamic_content || '',
    file_url: protocol.file_url || null
  });
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDeleteFile = async () => {
    if (!formData.file_url) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      // Extract file path from URL
      const filePath = formData.file_url.split('/').slice(-2).join('/');
      
      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('protocols')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update form data
      setFormData(prev => ({ 
        ...prev, 
        file_url: null,
        is_dynamic: false,
        dynamic_content: ''
      }));

      // Update protocol in database
      await onSubmit(protocol.id, { 
        file_url: null,
        is_dynamic: false,
        dynamic_content: null
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Une erreur est survenue lors de la suppression du fichier');
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    
    if (!formData.file_url) {
      setError('Veuillez d\'abord ajouter un document');
      return;
    }

    setAnalyzing(true);
    try {
      // First verify the file is accessible
      const fileResponse = await fetch(formData.file_url);
      if (!fileResponse.ok) {
        throw new Error(`Le fichier n'est pas accessible (${fileResponse.status} ${fileResponse.statusText})`);
      }
      const fileContent = await fileResponse.text();

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-protocol`;
      console.log('Calling Edge Function:', functionUrl);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocolId: protocol.id,
          fileContent
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Edge Function error:', errorData);
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setFormData(prev => ({
        ...prev,
        is_dynamic: true,
        dynamic_content: result.analysis
      }));

      if (result.wasTruncated) {
        alert('Le protocole a été analysé avec succès, mais le contenu a été tronqué en raison de sa longueur. L\'analyse pourrait être incomplète.');
      } else {
        alert('Protocole analysé avec succès !');
      }
    } catch (error) {
      console.error('Error analyzing protocol:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let file_url = formData.file_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('protocols')
          .upload(`protocols/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from('protocols')
          .getPublicUrl(`protocols/${fileName}`);

        file_url = publicUrl;
      }

      await onSubmit(protocol.id, {
        ...formData,
        file_url
      });
    } catch (error) {
      console.error('Error updating protocol:', error);
      setError('Une erreur est survenue lors de la mise à jour');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Modifier le protocole</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload size={24} className="mx-auto text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                      <span>Télécharger un fichier</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, Word jusqu'à 10MB
                  </p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Fichier sélectionné: {file.name}
                </p>
              )}
              {formData.file_url && !file && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formData.file_url.split('/').pop()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 size={16} className="mr-2" />
                      {analyzing ? 'Analyse en cours...' : 'Rendre dynamique'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteFile}
                      className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formData.is_dynamic && formData.dynamic_content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu dynamique
                </label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.dynamic_content}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            >
              <Save size={16} className="mr-2" />
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProtocolForm;