import React from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Appointment } from '../../types';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: Appointment) => void;
}

const messages = {
  allDay: 'Journée entière',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Rendez-vous',
  noEventsInRange: 'Aucun rendez-vous sur cette période',
  showMore: (total: number) => `+ ${total} rendez-vous supplémentaires`,
};

const formats = {
  monthHeaderFormat: (date: Date) => format(date, 'MMMM yyyy', { locale: fr }),
  weekdayFormat: (date: Date) => format(date, 'EEEE', { locale: fr }).charAt(0).toUpperCase() + format(date, 'EEEE', { locale: fr }).slice(1),
  dayHeaderFormat: (date: Date) => format(date, 'd MMMM yyyy', { locale: fr }),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'd', { locale: fr })} - ${format(end, 'd MMMM yyyy', { locale: fr })}`,
  timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: fr }),
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`,
  agendaDateFormat: (date: Date) => format(date, 'EEEE d MMMM', { locale: fr }),
  agendaTimeFormat: (date: Date) => format(date, 'HH:mm', { locale: fr }),
  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`,
  dayFormat: (date: Date) => `${format(date, 'EEEE', { locale: fr }).charAt(0).toUpperCase() + format(date, 'EEEE', { locale: fr }).slice(1)} ${format(date, 'dd', { locale: fr })}`,
};

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectSlot,
  onSelectEvent,
}) => {
  const events = appointments.map(appointment => ({
    ...appointment,
    title: `${appointment.client?.first_name} ${appointment.client?.last_name}`,
    start: new Date(`${appointment.date}T${appointment.start_time}`),
    end: new Date(new Date(`${appointment.date}T${appointment.start_time}`).getTime() + appointment.duration * 60000),
  }));

  const eventStyleGetter = (event: any) => {
    let style = {
      backgroundColor: '#10B981', // emerald-500
      borderRadius: '4px',
      opacity: 1,
      color: 'white',
      border: 'none',
      display: 'block',
      overflow: 'hidden'
    };
    
    switch (event.status) {
      case 'cancelled':
        style.backgroundColor = '#EF4444'; // red-500
        style.opacity = 0.7;
        break;
      case 'completed':
        style.backgroundColor = '#059669'; // emerald-600
        break;
      default:
        break;
    }

    return { style };
  };

  const dayPropGetter = (date: Date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return {
        className: 'rbc-today',
        style: {
          backgroundColor: '#F0FDF4', // emerald-50
        },
      };
    }
    return {};
  };

  const slotGroupPropGetter = () => {
    return {
      style: {
        minHeight: '60px',
      },
    };
  };

  return (
    <div className="h-[700px] p-4 bg-white rounded-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        slotGroupPropGetter={slotGroupPropGetter}
        messages={messages}
        formats={formats}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.WEEK}
        min={new Date(0, 0, 0, 8, 0, 0)} // Début à 8h
        max={new Date(0, 0, 0, 20, 0, 0)} // Fin à 20h
        step={30} // Intervalles de 30 minutes
        timeslots={2} // 2 créneaux par "step" (donc 15 minutes)
        toolbar={true}
        popup={true}
        className="custom-calendar"
      />
    </div>
  );
};

export default AppointmentCalendar;