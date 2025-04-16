import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  getDay,
  addDays,
  isBefore,
  isAfter
} from 'date-fns';
import { colors } from '@/constants/colors';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/services/calendar-service';

interface MonthCalendarProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
}

export const MonthCalendar = ({ selectedDate, events, onSelectDate }: MonthCalendarProps) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart);
  
  // Create an array of days including padding for the start of the month
  const calendarDays = [];
  
  // Add empty days for padding at the start
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  
  // Add the actual days of the month
  calendarDays.push(...daysInMonth);
  
  // Add empty days for padding at the end to complete the grid
  const remainingDays = 7 - (calendarDays.length % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      calendarDays.push(null);
    }
  }
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  // Get events for a specific day
  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, day);
    });
  };
  
  // Check if a day is in the past
  const isPastDay = (day: Date | null) => {
    if (!day) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(day, today);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.weekdayHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <View key={dayIndex} style={styles.emptyDay} />;
              }
              
              const isCurrentMonth = isSameMonth(day, selectedDate);
              const isSelected = isSameDay(day, selectedDate);
              const isPast = isPastDay(day);
              const dayEvents = getEventsForDay(day);
              const dayHasEvents = dayEvents.length > 0;
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.day,
                    !isCurrentMonth && styles.outsideMonth,
                    isSelected && styles.selectedDay,
                    isToday(day) && styles.today,
                    isPast && styles.pastDay,
                  ]}
                  onPress={() => onSelectDate(day)}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.outsideMonthText,
                      isSelected && styles.selectedDayText,
                      isToday(day) && styles.todayText,
                      isPast && styles.pastDayText,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  
                  {dayHasEvents && (
                    <View style={styles.eventIndicators}>
                      {dayEvents.slice(0, 3).map((event, index) => {
                        const eventColor = getEventColor(event.type);
                        return (
                          <View 
                            key={index} 
                            style={[
                              styles.eventDot,
                              { backgroundColor: eventColor }
                            ]} 
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <View style={styles.moreEventsContainer}>
                          <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  weekdayHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calendarGrid: {
    paddingVertical: 8,
  },
  week: {
    flexDirection: 'row',
    height: 64,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 2,
    margin: 2,
    borderRadius: 8,
  },
  emptyDay: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  outsideMonth: {
    opacity: 0.4,
  },
  outsideMonthText: {
    color: colors.textSecondary,
  },
  selectedDay: {
    backgroundColor: colors.primary + '20',
  },
  selectedDayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  pastDay: {
    opacity: 0.7,
  },
  pastDayText: {
    color: colors.textSecondary,
  },
  eventIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moreEventsContainer: {
    marginLeft: 2,
    backgroundColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  moreEventsText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});