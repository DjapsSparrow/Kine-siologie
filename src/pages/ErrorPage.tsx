import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Oups! Une erreur est survenue
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Nous sommes désolés, une erreur s'est produite. Veuillez réessayer ou revenir à la page d'accueil.
        </p>
        <div className="text-center">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;