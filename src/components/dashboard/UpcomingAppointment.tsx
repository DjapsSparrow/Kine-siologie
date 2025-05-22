import React from 'react';
import { Clock, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AppointmentProps {
  client?: {
    name: string;
    avatar?: string;
  };
  date?: Date;
  time?: string;
  duration?: number;
}

const UpcomingAppointment: React.FC<AppointmentProps> = ({
  client,
  date,
  time,
  duration
}) => {
  const navigate = useNavigate();

  const handleAddAppointment = () => {
    navigate('/appointments', { state: { showForm: true } });
  };

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun rendez-vous prévu</p>
        <button 
          onClick={handleAddAppointment}
          className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Ajouter un rendez-vous
        </button>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center">
        {client.avatar ? (
          <img
            src={client.avatar}
            alt={client.name}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <User size={20} />
          </div>
        )}
        <div className="ml-3">
          <p className="font-medium text-gray-800">{client.name}</p>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={14} className="mr-1" />
            <span className="capitalize">{formatDate(date!)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center text-sm space-x-4">
        <div className="flex items-center text-gray-700">
          <Clock size={14} className="mr-1" />
          <span>{time}</span>
        </div>
        {duration && (
          <div className="text-gray-700">
            <span>{duration} min</span>
          </div>
        )}
      </div>
      
      <div className="pt-2 flex space-x-2">
        <button className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
          Voir détails
        </button>
        <button className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors">
          Modifier
        </button>
      </div>
    </div>
  );
};

export default UpcomingAppointment;