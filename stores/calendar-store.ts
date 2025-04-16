import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent, EventFormData, CalendarViewMode } from '@/types/calendar';
import { 
  getCalendarEvents, 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent 
} from '@/services/calendar-service';
import { 
  scheduleEventReminder, 
  cancelEventReminder 
} from '@/services/notification-service';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from 'date-fns';

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  selectedDate: Date;
  viewMode: CalendarViewMode;
  
  // Actions
  fetchEvents: () => Promise<void>;
  addEvent: (eventData: EventFormData) => Promise<CalendarEvent | null>;
  updateEvent: (eventId: string, eventData: Partial<EventFormData>) => Promise<CalendarEvent | null>;
  removeEvent: (eventId: string) => Promise<boolean>;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  
  // Selectors
  getEventsForSelectedDate: () => CalendarEvent[];
  getEventsForSelectedPeriod: () => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,
      selectedDate: new Date(),
      viewMode: 'month',
      
      fetchEvents: async () => {
        try {
          set({ isLoading: true, error: null });
          const events = await getCalendarEvents();
          set({ events, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch events' 
          });
        }
      },
      
      addEvent: async (eventData: EventFormData) => {
        try {
          set({ isLoading: true, error: null });
          
          // Create the event
          const newEvent = await createCalendarEvent(eventData);
          
          if (newEvent) {
            // Schedule reminder if enabled
            let updatedEvent = { ...newEvent };
            
            if (eventData.reminderEnabled && eventData.reminderMinutesBefore) {
              const notificationId = await scheduleEventReminder(
                newEvent, 
                eventData.reminderMinutesBefore
              );
              
              if (notificationId) {
                updatedEvent = {
                  ...updatedEvent,
                  reminderEnabled: true,
                  reminderMinutesBefore: eventData.reminderMinutesBefore,
                  reminderNotificationId: notificationId
                };
              }
            }
            
            set(state => ({ 
              events: [...state.events, updatedEvent],
              isLoading: false 
            }));
            
            return updatedEvent;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to add event' 
          });
          return null;
        }
      },
      
      updateEvent: async (eventId: string, eventData: Partial<EventFormData>) => {
        try {
          set({ isLoading: true, error: null });
          
          // Get the existing event
          const existingEvent = get().events.find(event => event.id === eventId);
          if (!existingEvent) {
            set({ isLoading: false });
            return null;
          }
          
          // Update the event
          const updatedEvent = await updateCalendarEvent(eventId, eventData);
          
          if (updatedEvent) {
            let finalEvent = { ...updatedEvent };
            
            // Handle reminder changes
            if (existingEvent.reminderNotificationId) {
              // Cancel existing reminder if disabled or if start time changed
              if (
                eventData.reminderEnabled === false || 
                (eventData.startTime && eventData.startTime !== existingEvent.startTime)
              ) {
                await cancelEventReminder(existingEvent.reminderNotificationId);
                finalEvent.reminderNotificationId = undefined;
                finalEvent.reminderEnabled = false;
              }
            }
            
            // Schedule new reminder if enabled
            if (eventData.reminderEnabled && eventData.reminderMinutesBefore) {
              const notificationId = await scheduleEventReminder(
                finalEvent,
                eventData.reminderMinutesBefore
              );
              
              if (notificationId) {
                finalEvent = {
                  ...finalEvent,
                  reminderEnabled: true,
                  reminderMinutesBefore: eventData.reminderMinutesBefore,
                  reminderNotificationId: notificationId
                };
              }
            }
            
            set(state => ({ 
              events: state.events.map(event => 
                event.id === eventId ? finalEvent : event
              ),
              isLoading: false 
            }));
            
            return finalEvent;
          }
          
          set({ isLoading: false });
          return null;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update event' 
          });
          return null;
        }
      },
      
      removeEvent: async (eventId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Get the event to be deleted
          const eventToDelete = get().events.find(event => event.id === eventId);
          
          // Delete the event
          const success = await deleteCalendarEvent(eventId);
          
          if (success) {
            // Cancel any associated reminder
            if (eventToDelete?.reminderNotificationId) {
              await cancelEventReminder(eventToDelete.reminderNotificationId);
            }
            
            set(state => ({ 
              events: state.events.filter(event => event.id !== eventId),
              isLoading: false 
            }));
          }
          
          return success;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete event' 
          });
          return false;
        }
      },
      
      setSelectedDate: (date: Date) => {
        set({ selectedDate: date });
      },
      
      setViewMode: (mode: CalendarViewMode) => {
        set({ viewMode: mode });
      },
      
      getEventsForSelectedDate: () => {
        const { events, selectedDate } = get();
        return events.filter(event => {
          const eventDate = new Date(event.startTime);
          return isSameDay(eventDate, selectedDate);
        });
      },
      
      getEventsForSelectedPeriod: () => {
        const { events, selectedDate, viewMode } = get();
        let periodStart: Date;
        let periodEnd: Date;
        
        switch (viewMode) {
          case 'day':
            periodStart = startOfDay(selectedDate);
            periodEnd = endOfDay(selectedDate);
            break;
          case 'week':
            periodStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
            periodEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
            break;
          case 'month':
          default:
            periodStart = startOfMonth(selectedDate);
            periodEnd = endOfMonth(selectedDate);
            break;
        }
        
        return events.filter(event => {
          const eventStart = new Date(event.startTime);
          return eventStart >= periodStart && eventStart <= periodEnd;
        });
      }
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        events: state.events,
        selectedDate: state.selectedDate.toISOString(),
        viewMode: state.viewMode
      }),
      onRehydrateStorage: () => (state) => {
        // Convert ISO string back to Date object
        if (state && typeof state.selectedDate === 'string') {
          state.selectedDate = new Date(state.selectedDate);
        }
      }
    }
  )
);