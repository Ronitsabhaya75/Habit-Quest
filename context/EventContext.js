"use client"

import { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState({});

  useEffect(() => {
    // Load events from localStorage on component mount
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch (error) {
        console.error('Error parsing stored events:', error);
      }
    }
  }, []);

  // Save events to localStorage
  const saveEvents = (updatedEvents) => {
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  // Add a new event for a specific date
  const addEvent = (dateKey, event) => {
    setEvents(prev => {
      const dateEvents = prev[dateKey] || [];
      const updatedEvents = {
        ...prev,
        [dateKey]: [...dateEvents, { ...event, id: event.id || Date.now() }]
      };
      saveEvents(updatedEvents);
      return updatedEvents;
    });
  };

  // Update an existing event
  const updateEvent = (dateKey, eventId, updatedEvent) => {
    setEvents(prev => {
      const dateEvents = prev[dateKey] || [];
      const updatedEvents = {
        ...prev,
        [dateKey]: dateEvents.map(event => 
          event.id === eventId ? { ...event, ...updatedEvent } : event
        )
      };
      saveEvents(updatedEvents);
      return updatedEvents;
    });
  };

  // Delete an event
  const deleteEvent = (dateKey, eventId) => {
    setEvents(prev => {
      const dateEvents = prev[dateKey] || [];
      const updatedEvents = {
        ...prev,
        [dateKey]: dateEvents.filter(event => event.id !== eventId)
      };
      saveEvents(updatedEvents);
      return updatedEvents;
    });
  };

  // Toggle event completion
  const toggleEventCompletion = (dateKey, eventId, completed) => {
    setEvents(prev => {
      const dateEvents = prev[dateKey] || [];
      const updatedEvents = {
        ...prev,
        [dateKey]: dateEvents.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                completed, 
                completedAt: completed ? new Date().toISOString() : null 
              } 
            : event
        )
      };
      saveEvents(updatedEvents);
      return updatedEvents;
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return events[dateKey] || [];
  };

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventCompletion,
      getEventsForDate
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => useContext(EventContext); 