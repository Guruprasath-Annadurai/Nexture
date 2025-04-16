import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '@/types/calendar';
import { colors } from '@/constants/colors';
import { format } from 'date-fns';
import { Bell, Clock, MapPin } from 'lucide-react-native';

interface EventCardProps {
  event: CalendarEvent;
  onPress: (event: CalendarEvent) => void;
}

export const EventCard = ({ event, onPress }: EventCardProps) => {
  const eventColor = getEventColor(event.type);
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  
  // Check if event is today
  const isToday = new Date().toDateString() === startTime.toDateString();
  
  // Check if event is upcoming (within the next hour)
  const isUpcoming = isToday && 
    startTime.getTime() > Date.now() && 
    startTime.getTime() - Date.now() < 60 * 60 * 1000;
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: eventColor }
      ]}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.timeContainer}>
          <View style={[styles.timeBox, { backgroundColor: eventColor + '15' }]}>
            <Text style={[styles.timeBoxText, { color: eventColor }]}>
              {format(startTime, 'h:mm')}
            </Text>
            <Text style={[styles.timeBoxPeriod, { color: eventColor }]}>
              {format(startTime, 'a')}
            </Text>
          </View>
          
          {!isSameTime(startTime, endTime) && (
            <View style={styles.timeConnector}>
              <View style={[styles.timeConnectorLine, { backgroundColor: eventColor + '40' }]} />
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text 
                style={[
                  styles.title, 
                  isUpcoming && styles.upcomingTitle
                ]} 
                numberOfLines={1}
              >
                {event.title}
              </Text>
              
              {isUpcoming && (
                <View style={[styles.upcomingBadge, { backgroundColor: eventColor + '20' }]}>
                  <Text style={[styles.upcomingBadgeText, { color: eventColor }]}>
                    Soon
                  </Text>
                </View>
              )}
            </View>
            
            {event.reminderEnabled && (
              <Bell size={16} color={eventColor} style={styles.reminderIcon} />
            )}
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Clock size={14} color={colors.textSecondary} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {format(startTime, 'h:mm a')}
                {!isSameTime(startTime, endTime) && ` - ${format(endTime, 'h:mm a')}`}
              </Text>
            </View>
            
            {event.location && (
              <View style={styles.detailRow}>
                <MapPin size={14} color={colors.textSecondary} style={styles.detailIcon} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>
          
          <View style={[styles.badge, { backgroundColor: eventColor + '20' }]}>
            <Text style={[styles.badgeText, { color: eventColor }]}>
              {getEventTypeLabel(event.type)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Helper function to check if two dates have the same time
const isSameTime = (date1: Date, date2: Date): boolean => {
  return date1.getHours() === date2.getHours() && 
         date1.getMinutes() === date2.getMinutes();
};

// Helper function to get event color based on type
export const getEventColor = (type: string): string => {
  switch (type) {
    case 'interview':
      return colors.primary;
    case 'deadline':
      return colors.error;
    case 'followup':
      return colors.success;
    case 'meeting':
      return colors.warning;
    case 'other':
    default:
      return colors.textSecondary;
  }
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timeBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBoxText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeBoxPeriod: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  timeConnector: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeConnectorLine: {
    width: 2,
    height: 16,
    borderRadius: 1,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
    flex: 1,
  },
  upcomingTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  upcomingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reminderIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});