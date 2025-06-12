import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchAppointments, updateAppointment, createAppointment, fetchBlockedSlots } from '../services/appointmentService';
import AppointmentModal from '../components/AppointmentModal';
import BlockingModal from './BlockingModal';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [blockingModalOpen, setBlockingModalOpen] = useState(false);

  useEffect(() => {
    loadEvents();
    loadBlockedSlots();
  }, []);

  const loadEvents = async () => {
    try {
      const appointments = await fetchAppointments();
      // Map appointments to FullCalendar format
      const formattedEvents = appointments.map(appointment => ({
        id: appointment.id,
        title: appointment.patient ? `${appointment.patient.name} - ${appointment.checkupType}` : 'Appointment',
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        extendedProps: {
          patientId: appointment.patientId,
          checkupType: appointment.checkupType,
          isRemote: appointment.isRemote
        }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadBlockedSlots = async () => {
    try {
      const blocks = await fetchBlockedSlots();
      // Map blocks to FullCalendar format
      const formattedBlocks = blocks.map(block => ({
        id: `block-${block.id}`,
        title: block.reason || 'Blocked',
        start: new Date(block.startTime),
        end: new Date(block.endTime),
        backgroundColor: '#ff9999',
        borderColor: '#ff6666',
        editable: false  // Blocks are not editable
      }));
      setBlockedSlots(formattedBlocks);
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  };

  const handleDateClick = (arg) => {
    // Calculate end time (15 minutes after start)
    const endTime = new Date(arg.date.getTime() + 15 * 60000);
    
    // Create new event object with pre-filled info
    setSelectedEvent({
      start: arg.date,
      end: endTime,
      allDay: false,
      extendedProps: {
        isNewEvent: true
      }
    });
    setModalOpen(true);
  };

  const handleEventClick = (arg) => {
    setSelectedEvent(arg.event);
    setModalOpen(true);
  };

  const handleEventAdd = async (eventData) => {
    try {
      await createAppointment(eventData);
      loadEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleEventChange = async (changeInfo) => {
    try {
      const updatedEvent = {
        id: changeInfo.event.id,
        startTime: changeInfo.event.start,
        endTime: changeInfo.event.end || new Date(changeInfo.event.start.getTime() + 15 * 60000),
        patientId: changeInfo.event.extendedProps.patientId,
        checkupType: changeInfo.event.extendedProps.checkupType,
        isRemote: changeInfo.event.extendedProps.isRemote
      };
      await updateAppointment(changeInfo.event.id, updatedEvent);
    } catch (error) {
      changeInfo.revert();
      console.error('Error updating event:', error);
    }
  };

  const handleBlockSlots = () => {
    setBlockingModalOpen(true);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={[...events, ...blockedSlots]}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={true}
        eventResize={handleEventChange}
        eventDrop={handleEventChange}
        slotDuration="00:15:00"
        slotMinTime="08:00:00"
        slotMaxTime="16:00:00"
        allDaySlot={false}
        weekends={true}
        height="auto"
      />
      <button onClick={handleBlockSlots}>Block Time Slots</button>
      {modalOpen && (
        <AppointmentModal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          appointment={selectedEvent}
          onEventAdd={handleEventAdd}
          onEventUpdate={handleEventChange}
        />
      )}
      {blockingModalOpen && (
        <BlockingModal
          open={blockingModalOpen}
          onClose={() => setBlockingModalOpen(false)}
          onBlockComplete={loadBlockedSlots}
        />
      )}
    </div>
  );
};

export default Calendar;