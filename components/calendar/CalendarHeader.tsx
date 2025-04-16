import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { colors } from '@/constants/colors';
import { ChevronLeft, ChevronRight, Calendar, Clock, CalendarDays } from 'lucide-react-native';

interface CalendarHeaderProps {
  selectedDate: Date;
  viewMode: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
}

export const CalendarHeader = ({ 
  selectedDate, 
  viewMode, 
  onDateChange, 
  onViewModeChange 
}: CalendarHeaderProps) => {
  const handlePrevious = () => {
    if (viewMode === 'day') {
      onDateChange(subDays(selectedDate, 1));
    } else if (viewMode === 'week') {
      onDateChange(subWeeks(selectedDate, 1));
    } else {
      onDateChange(subMonths(selectedDate, 1));
    }
  };
  
  const handleNext = () => {
    if (viewMode === 'day') {
      onDateChange(addDays(selectedDate, 1));
    } else if (viewMode === 'week') {
      onDateChange(addWeeks(selectedDate, 1));
    } else {
      onDateChange(addMonths(selectedDate, 1));
    }
  };
  
  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return format(selectedDate, 'EEEE, MMMM d, yyyy');
    } else if (viewMode === 'week') {
      return `Week of ${format(selectedDate, 'MMMM d, yyyy')}`;
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handlePrevious}
          style={styles.navButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        
        <TouchableOpacity 
          onPress={handleNext}
          style={styles.navButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <ChevronRight size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'day' && styles.activeViewModeButton
          ]}
          onPress={() => onViewModeChange('day')}
        >
          <Clock 
            size={16} 
            color={viewMode === 'day' ? colors.primary : colors.textSecondary} 
            style={styles.viewModeIcon}
          />
          <Text 
            style={[
              styles.viewModeText,
              viewMode === 'day' && styles.activeViewModeText
            ]}
          >
            Day
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'week' && styles.activeViewModeButton
          ]}
          onPress={() => onViewModeChange('week')}
        >
          <Calendar 
            size={16} 
            color={viewMode === 'week' ? colors.primary : colors.textSecondary} 
            style={styles.viewModeIcon}
          />
          <Text 
            style={[
              styles.viewModeText,
              viewMode === 'week' && styles.activeViewModeText
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'month' && styles.activeViewModeButton
          ]}
          onPress={() => onViewModeChange('month')}
        >
          <CalendarDays 
            size={16} 
            color={viewMode === 'month' ? colors.primary : colors.textSecondary} 
            style={styles.viewModeIcon}
          />
          <Text 
            style={[
              styles.viewModeText,
              viewMode === 'month' && styles.activeViewModeText
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  navButton: {
    padding: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeViewModeButton: {
    backgroundColor: colors.primaryLight,
  },
  viewModeIcon: {
    marginRight: 6,
  },
  viewModeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeViewModeText: {
    color: colors.primary,
    fontWeight: '600',
  },
});