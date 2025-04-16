import { CalendarEvent, EventFormData } from '@/types/calendar';
import { fetchAPI } from './api';
import { format } from 'date-fns';

// Mock data for calendar events
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Interview with Acme Corp',
    description: 'Technical interview for Senior Developer position',
    startTime: '2023-06-15T10:00:00Z',
    endTime: '2023-06-15T11:30:00Z',
    location: 'Online - Zoom',
    type: 'interview',
    userId: 'user123',
    createdAt: '2023-06-10T08:00:00Z',
    updatedAt: '2023-06-10T08:00:00Z'
  },
  {
    id: '2',
    title: 'Resume Submission Deadline',
    description: 'Last day to submit resume for TechStart position',
    startTime: '2023-06-20T23:59:00Z',
    endTime: '2023-06-20T23:59:00Z',
    type: 'deadline',
    userId: 'user123',
    createdAt: '2023-06-12T14:30:00Z',
    updatedAt: '2023-06-12T14:30:00Z'
  },
  {
    id: '3',
    title: 'Follow-up with GlobalTech',
    description: 'Send thank you email after interview',
    startTime: '2023-06-18T15:00:00Z',
    endTime: '2023-06-18T15:30:00Z',
    type: 'followup',
    userId: 'user123',
    createdAt: '2023-06-16T09:15:00Z',
    updatedAt: '2023-06-16T09:15:00Z'
  },
  {
    id: '4',
    title: 'Networking Event',
    description: 'Tech industry meetup downtown',
    startTime: '2023-06-25T18:00:00Z',
    endTime: '2023-06-25T21:00:00Z',
    location: 'Convention Center, Room 302',
    type: 'meeting',
    userId: 'user123',
    createdAt: '2023-06-15T11:20:00Z',
    updatedAt: '2023-06-15T11:20:00Z'
  },
  {
    id: '5',
    title: 'Skill Assessment',
    description: 'Online coding test for InnovateTech',
    startTime: '2023-06-22T14:00:00Z',
    endTime: '2023-06-22T16:00:00Z',
    type: 'other',
    userId: 'user123',
    createdAt: '2023-06-18T10:45:00Z',
    updatedAt: '2023-06-18T10:45:00Z'
  }
];

// Get all events for the current user
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    // In a real app, this would be an API call
    // return await fetchAPI<CalendarEvent[]>('/calendar/events');
    
    // For demo, return mock data with dates adjusted to be relative to current date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    return mockEvents.map(event => {
      const startDate = new Date(event.startTime);
      const endDate = new Date(event.endTime);
      
      // Adjust the year, month to current, and keep the day relative
      const adjustedStartDate = new Date(
        currentYear,
        currentMonth,
        currentDay + (startDate.getDate() % 28) - 14, // Distribute events around current date
        startDate.getHours(),
        startDate.getMinutes()
      );
      
      const adjustedEndDate = new Date(
        currentYear,
        currentMonth,
        currentDay + (endDate.getDate() % 28) - 14,
        endDate.getHours(),
        endDate.getMinutes()
      );
      
      return {
        ...event,
        startTime: adjustedStartDate.toISOString(),
        endTime: adjustedEndDate.toISOString()
      };
    });
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return [];
  }
};

// Create a new event
export const createCalendarEvent = async (eventData: EventFormData): Promise<CalendarEvent | null> => {
  try {
    // In a real app, this would be an API call
    // return await fetchAPI<CalendarEvent>('/calendar/events', {
    //   method: 'POST',
    //   body: JSON.stringify(eventData)
    // });
    
    // For demo, create a mock event
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      userId: 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newEvent;
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return null;
  }
};

// Update an existing event
export const updateCalendarEvent = async (eventId: string, eventData: Partial<EventFormData>): Promise<CalendarEvent | null> => {
  try {
    // In a real app, this would be an API call
    // return await fetchAPI<CalendarEvent>(`/calendar/events/${eventId}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(eventData)
    // });
    
    // For demo, return a mock updated event
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return null;
    
    const updatedEvent: CalendarEvent = {
      ...event,
      ...eventData,
      updatedAt: new Date().toISOString()
    };
    
    return updatedEvent;
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    return null;
  }
};

// Delete an event
export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  try {
    // In a real app, this would be an API call
    // await fetchAPI(`/calendar/events/${eventId}`, {
    //   method: 'DELETE'
    // });
    
    // For demo, just return success
    return true;
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    return false;
  }
};

// Helper function to get event color based on type
export const getEventColor = (type: string): string => {
  switch (type) {
    case 'interview':
      return '#4F46E5'; // primary
    case 'deadline':
      return '#EF4444'; // error
    case 'followup':
      return '#10B981'; // success
    case 'meeting':
      return '#F59E0B'; // warning
    case 'other':
    default:
      return '#6B7280'; // textSecondary
  }
};

// Helper to format date for display
export const formatEventTime = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
};

// Helper to format just the time
export const formatEventTimeOnly = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'h:mm a');
};

// Helper to get event type label
export const getEventTypeLabel = (type: string): string => {
  switch (type) {
    case 'interview':
      return 'Interview';
    case 'deadline':
      return 'Deadline';
    case 'followup':
      return 'Follow-up';
    case 'meeting':
      return 'Meeting';
    case 'other':
    default:
      return 'Other';
  }
};