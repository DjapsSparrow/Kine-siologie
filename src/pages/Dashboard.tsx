import React from 'react';
import { Search, Star, FileText, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickSearch from '../components/dashboard/QuickSearch';
import FavoritesList from '../components/dashboard/FavoritesList';
import RecentDocuments from '../components/dashboard/RecentDocuments';
import UpcomingAppointment from '../components/dashboard/UpcomingAppointment';
import { Protocol, Document } from '../types';

// Sample data
const sampleFavorites: Protocol[] = [
  {
    id: '1',
    name: 'Libération des peurs',
    objective: 'Technique pour travailler sur les blocages émotionnels liés aux peurs profondes',
    steps: ['Étape 1', 'Étape 2', 'Étape 3'],
    category: 'emotional',
    symptoms: ['peur', 'anxiété'],
    dateAdded: new Date('2024-03-10'),
    isFavorite: true
  },
  {
    id: '2',
    name: 'Rééquilibrage des méridiens',
    objective: 'Séquence pour harmoniser le flux énergétique selon la médecine chinoise',
    steps: ['Étape 1', 'Étape 2', 'Étape 3'],
    category: 'energetic',
    symptoms: ['déséquilibre', 'fatigue'],
    dateAdded: new Date('2024-03-05'),
    isFavorite: true
  }
];

const sampleDocuments: Document[] = [
  {
    id: '1',
    name: 'Grille d\'évaluation.pdf',
    type: 'pdf',
    url: '/documents/grille-evaluation.pdf',
    dateAdded: new Date('2024-03-12'),
    tags: ['évaluation', 'formulaire']
  },
  {
    id: '2',
    name: 'Tableau de suivi.xlsx',
    type: 'spreadsheet',
    url: '/documents/tableau-suivi.xlsx',
    dateAdded: new Date('2024-03-11'),
    tags: ['suivi', 'statistiques']
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const upcomingAppointment = {
    client: {
      name: 'Marie D.',
    },
    date: new Date('2024-03-14T15:30:00'),
    time: '15h30',
    duration: 60
  };

  const handleAddAppointment = () => {
    navigate('/appointments', { state: { showForm: true } });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-green-600 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Bienvenue dans votre espace de travail
        </h1>
        <p className="text-green-100 mb-4">
          Consultez vos protocoles, gérez vos rendez-vous et suivez vos clients
        </p>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-white rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
            <Plus size={16} className="mr-2" />
            Nouveau protocole
          </button>
          <button 
            onClick={handleAddAppointment}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Calendar size={16} className="mr-2" />
            Ajouter un RDV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Rechercher un protocole" 
          icon={<Search size={20} />}
          className="lg:col-span-1"
        >
          <QuickSearch />
          <p className="text-sm text-gray-500 mt-2">Accédez rapidement à vos outils</p>
        </DashboardCard>
        
        <DashboardCard 
          title="Voir mes favoris" 
          icon={<Star size={20} />}
          className="lg:col-span-1"
        >
          <FavoritesList favorites={sampleFavorites} />
          <p className="text-sm text-gray-500 mt-2">Protocoles fréquemment utilisés</p>
        </DashboardCard>
        
        <DashboardCard 
          title="Derniers fichiers" 
          icon={<FileText size={20} />}
          className="lg:col-span-1"
        >
          <RecentDocuments documents={sampleDocuments} />
          <p className="text-sm text-gray-500 mt-2">Documents récemment ajoutés</p>
        </DashboardCard>
        
        <DashboardCard 
          title="Prochain RDV" 
          icon={<Calendar size={20} />}
          className="lg:col-span-3"
        >
          <UpcomingAppointment {...upcomingAppointment} />
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;