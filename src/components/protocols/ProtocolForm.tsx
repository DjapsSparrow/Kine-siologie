import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { Protocol, ProtocolCategory } from '../../types';
import { supabase } from '../../lib/supabase';

interface ProtocolFormProps {
  protocol?: Protocol;
  onClose: () => void;
  onSubmit: (data: Partial<Protocol>) => Promise<void>;
}

const ProtocolForm: React.FC<ProtocolFormProps> = ({
  protocol,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    title: protocol?.title || '',
    description: protocol?.description || '',
    category_id: protocol?.category_id || '',
    newCategory: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<ProtocolCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('protocol_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      let category_id = formData.category_id;

      // Create new category if specified
      if (formData.newCategory) {
        const { data: newCategory, error: categoryError } = await supabase
          .from('protocol_categories')
          .insert({ name: formData.newCategory })
          .select()
          .single();

        if (categoryError) throw categoryError;
        category_id = newCategory.id;
      }

      let file_url = protocol?.file_url;

      // Upload file if provided
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

      // Submit form data with created_by field
      await onSubmit({
        title: formData.title,
        description: formData.description,
        category_id,
        file_url,
        created_by: user.id
      });

      onClose();
    } catch (error) {
      console.error('Error saving protocol:', error);
      alert('Une erreur est survenue lors de l\'enregistrement du protocole');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {protocol ? 'Modifier le protocole' : 'Nouveau protocole'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
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
                Catégorie
              </label>
              <div className="space-y-2">
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="new">+ Nouvelle catégorie</option>
                </select>

                {formData.category_id === 'new' && (
                  <input
                    type="text"
                    name="newCategory"
                    value={formData.newCategory}
                    onChange={handleChange}
                    placeholder="Nom de la nouvelle catégorie"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                )}
              </div>
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
              {protocol?.file_url && !file && (
                <p className="mt-2 text-sm text-gray-600">
                  Document actuel: {protocol.file_url.split('/').pop()}
                </p>
              )}
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
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProtocolForm;