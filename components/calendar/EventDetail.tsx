import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CalendarEvent } from '@/types/calendar';
import { colors } from '@/constants/colors';
import { formatEventTime, getEventTypeLabel } from '@/services/calendar-service';
import { Button } from '@/components/Button';
import { X, Clock, MapPin, Calendar, Edit, Trash2, Bell, BellOff, CalendarClock } from 'lucide-react-native';
import { getEventColor, getEventTypeLabel as getTypeLabel } from './EventCard';

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export const EventDetail = ({ event, onClose, onEdit, onDelete }: EventDetailProps) => {
  const eventColor = getEventColor(event.type);
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            onDelete(event.id);
            onClose();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Format reminder time
  const getReminderText = () => {
    if (!event.reminderEnabled || !event.reminderMinutesBefore) {
      return null;
    }
    
    const minutes = event.reminderMinutesBefore;
    if (minutes < 60) {
      return `${minutes} minutes before`;
    } else if (minutes === 60) {
      return '1 hour before';
    } else if (minutes === 1440) {
      return '1 day before';
    } else if (minutes < 1440) {
      return `${minutes / 60} hours before`;
    } else {
      return `${minutes / 1440} days before`;
    }
  };
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate duration in minutes
  const getDurationInMinutes = () => {
    const startTime = new Date(event.startTime).getTime();
    const endTime = new Date(event.endTime).getTime();
    return Math.round((endTime - startTime) / (1000 * 60));
  };
  
  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes === 60) {
      return '1 hour';
    } else if (minutes % 60 === 0) {
      return `${minutes / 60} hours`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: eventColor + '15' }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={[styles.badge, { backgroundColor: eventColor + '30' }]}>
              <Text style={[styles.badgeText, { color: eventColor }]}>
                {getTypeLabel(event.type)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date and Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarClock size={18} color={eventColor} />
            <Text style={[styles.sectionTitle, { color: eventColor }]}>Date & Time</Text>
          </View>
          
          <View style={styles.dateTimeCard}>
            <View style={styles.dateRow}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={styles.dateText}>
                {formatDate(event.startTime)}
              </Text>
            </View>
            
            <View style={styles.timeRow}>
              <Clock size={18} color={colors.textSecondary} />
              <Text style={styles.timeText}>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </Text>
            </View>
            
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Duration:</Text>
              <Text style={styles.durationText}>
                {formatDuration(getDurationInMinutes())}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Description Section */}
        {event.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          </View>
        )}
        
        {/* Location Section */}
        {event.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={eventColor} />
              <Text style={[styles.sectionTitle, { color: eventColor }]}>Location</Text>
            </View>
            <View style={styles.locationCard}>
              <Text style={styles.locationText}>{event.location}</Text>
            </View>
          </View>
        )}
        
        {/* Reminder Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {event.reminderEnabled ? (
              <Bell size={18} color={eventColor} />
            ) : (
              <BellOff size={18} color={colors.textSecondary} />
            )}
            <Text 
              style={[
                styles.sectionTitle, 
                { color: event.reminderEnabled ? eventColor : colors.textSecondary }
              ]}
            >
              Reminder
            </Text>
          </View>
          
          <View style={[
            styles.reminderCard,
            { 
              backgroundColor: event.reminderEnabled 
                ? eventColor + '10' 
                : colors.background 
            }
          ]}>
            {event.reminderEnabled ? (
              <Text style={[styles.reminderText, { color: eventColor }]}>
                {getReminderText()}
              </Text>
            ) : (
              <Text style={styles.noReminderText}>
                No reminder set for this event
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.createdInfo}>
          <Text style={styles.createdText}>
            Created: {new Date(event.createdAt).toLocaleDateString()}
          </Text>
          {event.updatedAt !== event.createdAt && (
            <Text style={styles.createdText}>
              Updated: {new Date(event.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Edit"
          onPress={() => onEdit(event)}
          variant="outline"
          style={styles.footerButton}
          icon={<Edit size={16} color={colors.primary} />}
        />
        <Button
          title="Delete"
          onPress={handleDelete}
          variant="outline"
          style={[styles.footerButton, styles.deleteButton]}
          textStyle={styles.deleteButtonText}
          icon={<Trash2 size={16} color={colors.error} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  dateTimeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  durationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  durationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
  },
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noReminderText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  createdInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createdText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
});