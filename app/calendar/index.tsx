import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { colors } from '@/constants/colors';
import { CalendarEvent, EventFormData } from '@/types/calendar';
import { useCalendarStore } from '@/stores/calendar-store';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { EventCard } from '@/components/calendar/EventCard';
import { EventForm } from '@/components/calendar/EventForm';
import { EventDetail } from '@/components/calendar/EventDetail';
import { Plus, Calendar as CalendarIcon, Bell, ListFilter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestNotificationPermissions } from '@/services/notification-service';

export default function CalendarScreen() {
  const { 
    events, 
    isLoading, 
    selectedDate, 
    viewMode,
    fetchEvents,
    addEvent,
    updateEvent,
    removeEvent,
    setSelectedDate,
    setViewMode,
    getEventsForSelectedDate,
    getEventsForSelectedPeriod
  } = useCalendarStore();
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  
  // Request notification permissions on first load
  useEffect(() => {
    if (!permissionsRequested && Platform.OS !== 'web') {
      const requestPermissions = async () => {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert(
            "Notification Permission",
            "To receive event reminders, please enable notifications in your device settings.",
            [{ text: "OK" }]
          );
        }
        setPermissionsRequested(true);
      };
      
      requestPermissions();
    }
  }, [permissionsRequested]);
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleAddEvent = async (eventData: EventFormData) => {
    await addEvent(eventData);
    setShowEventForm(false);
  };
  
  const handleUpdateEvent = async (eventData: EventFormData) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, eventData);
      setShowEventForm(false);
      setIsEditing(false);
      setSelectedEvent(null);
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    await removeEvent(eventId);
    setShowEventDetail(false);
    setSelectedEvent(null);
  };
  
  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };
  
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setShowEventDetail(false);
    setShowEventForm(true);
  };
  
  const handleCloseForm = () => {
    setShowEventForm(false);
    setIsEditing(false);
    setSelectedEvent(null);
  };
  
  const handleCloseDetail = () => {
    setShowEventDetail(false);
    setSelectedEvent(null);
  };
  
  const eventsToDisplay = viewMode === 'day' 
    ? getEventsForSelectedDate() 
    : getEventsForSelectedPeriod();
  
  return (
    <UserProtectedRoute>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Stack.Screen 
          options={{
            title: 'Calendar',
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => {
                  setIsEditing(false);
                  setSelectedEvent(null);
                  setShowEventForm(true);
                }}
                style={styles.addButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Plus size={24} color={colors.primary} />
              </TouchableOpacity>
            ),
          }} 
        />
        
        <View style={styles.container}>
          <CalendarHeader
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateChange={setSelectedDate}
            onViewModeChange={setViewMode}
          />
          
          {viewMode === 'month' && (
            <MonthCalendar
              selectedDate={selectedDate}
              events={events}
              onSelectDate={setSelectedDate}
            />
          )}
          
          <View style={styles.eventsContainer}>
            <View style={styles.eventsTitleContainer}>
              <View style={styles.eventsTitleWrapper}>
                <CalendarIcon size={18} color={colors.primary} style={styles.eventsTitleIcon} />
                <Text style={styles.eventsTitle}>
                  {viewMode === 'day' 
                    ? 'Events for Today' 
                    : viewMode === 'week'
                      ? 'Events This Week'
                      : 'Events This Month'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => {
                  setIsEditing(false);
                  setSelectedEvent(null);
                  setShowEventForm(true);
                }}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={styles.addEventButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loaderText}>Loading events...</Text>
              </View>
            ) : eventsToDisplay.length > 0 ? (
              <ScrollView 
                style={styles.eventsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.eventsListContent}
              >
                {eventsToDisplay.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={handleEventPress}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIconContainer}>
                  <CalendarIcon size={48} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyStateTitle}>No events scheduled</Text>
                <Text style={styles.emptyStateText}>
                  Tap the button below to add your first event
                </Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={() => {
                    setIsEditing(false);
                    setSelectedEvent(null);
                    setShowEventForm(true);
                  }}
                >
                  <Plus size={18} color="white" style={styles.emptyStateButtonIcon} />
                  <Text style={styles.emptyStateButtonText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Event Form Modal */}
          <EventForm
            visible={showEventForm}
            onClose={handleCloseForm}
            onSubmit={isEditing ? handleUpdateEvent : handleAddEvent}
            initialData={selectedEvent || undefined}
            isEditing={isEditing}
          />
          
          {/* Event Detail Modal */}
          {selectedEvent && showEventDetail && (
            <EventDetail
              event={selectedEvent}
              onClose={handleCloseDetail}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          )}
        </View>
      </SafeAreaView>
    </UserProtectedRoute>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    marginRight: 8,
    padding: 4,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  eventsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventsTitleIcon: {
    marginRight: 8,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addEventButtonText: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateButtonIcon: {
    marginRight: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});