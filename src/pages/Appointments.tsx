import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar as CalendarIcon, List } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import EditAppointmentForm from '../components/appointments/EditAppointmentForm';
import { Appointment } from '../types';

const Appointments = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(location.state?.showForm || false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData: {
    client_id: string;
    date: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          client:clients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Une erreur est survenue lors de la création du rendez-vous');
    }
  };

  const handleUpdateAppointment = async (id: string, appointmentData: {
    client_id: string;
    date: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select(`
          *,
          client:clients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => prev.map(appointment => 
        appointment.id === id ? data : appointment
      ));
      setShowEditForm(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Une erreur est survenue lors de la modification du rendez-vous');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      setSelectedAppointment(null);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Une erreur est survenue lors de la suppression du rendez-vous');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select(`
          *,
          client:clients (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .single();

      if (error) throw error;

      setAppointments(prev => prev.map(appointment => 
        appointment.id === id ? data : appointment
      ));
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Une erreur est survenue lors de l\'annulation du rendez-vous');
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setShowForm(true);
  };

  const handleSelectEvent = (event: Appointment) => {
    setSelectedAppointment(event);
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-[600px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Rendez-vous</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-lg ${
                view === 'calendar'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${
                view === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List size={20} />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus size={16} className="mr-2" />
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          initialDate={selectedDate || undefined}
          onClose={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
          onSubmit={handleCreateAppointment}
        />
      )}

      {showEditForm && selectedAppointment && (
        <EditAppointmentForm
          appointment={selectedAppointment}
          onClose={() => {
            setShowEditForm(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleUpdateAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}

      <div className="bg-white rounded-lg shadow">
        {view === 'calendar' ? (
          <AppointmentCalendar
            appointments={appointments}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.client?.first_name} {appointment.client?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.start_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'completed'
                          ? 'Terminé'
                          : appointment.status === 'cancelled'
                          ? 'Annulé'
                          : 'Planifié'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowEditForm(true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;