import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getAppointments } from '../../utils/api';
import { toast } from 'sonner';

const localizer = momentLocalizer(moment);

const StaffCalendar = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      const calendarEvents = response.data.map(apt => ({
        title: `${apt.service?.name || 'Service'} - ${apt.customer_name}`,
        start: new Date(`${apt.appointment_date}T${apt.appointment_time}`),
        end: new Date(new Date(`${apt.appointment_date}T${apt.appointment_time}`).getTime() + (apt.service?.duration || 60) * 60000),
        resource: {
          status: apt.status,
          staff: apt.staff?.name || 'Unassigned',
          customer: apt.customer_name,
        },
      }));
      setEvents(calendarEvents);
    } catch (error) {
      toast.error('Failed to load calendar data');
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#D4A5A5';
    if (event.resource.status === 'confirmed') backgroundColor = '#4A7c59';
    if (event.resource.status === 'cancelled') backgroundColor = '#D14D4D';
    if (event.resource.status === 'completed') backgroundColor = '#4A7c99';

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  return (
    <div data-testid="staff-calendar" className="bg-white p-6 rounded-xl shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-4xl font-bold">Staff Calendar</h1>
        <div className="flex space-x-2">
          <button onClick={() => setView('day')} className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-[var(--secondary)] text-white' : 'bg-gray-100'}`} data-testid="view-day">Day</button>
          <button onClick={() => setView('week')} className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-[var(--secondary)] text-white' : 'bg-gray-100'}`} data-testid="view-week">Week</button>
          <button onClick={() => setView('month')} className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-[var(--secondary)] text-white' : 'bg-gray-100'}`} data-testid="view-month">Month</button>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        onView={setView}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        tooltipAccessor={(event) => `${event.title}\nStaff: ${event.resource.staff}\nStatus: ${event.resource.status}`}
      />

      <div className="mt-6 flex space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D4A5A5' }}></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4A7c59' }}></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4A7c99' }}></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D14D4D' }}></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default StaffCalendar;
