import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Switch, Platform } from 'react-native';
import { format } from 'date-fns';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { EventFormData, CalendarEvent } from '@/types/calendar';
import { X, Calendar as CalendarIcon, Clock, MapPin, Tag, Bell } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EventFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  initialData?: Partial<CalendarEvent>;
  isEditing?: boolean;
}

export const EventForm = ({ 
  visible, 
  onClose, 
  onSubmit, 
  initialData,
  isEditing = false
}: EventFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [type, setType] = useState<EventFormData['type']>(
    (initialData?.type as EventFormData['type']) || 'other'
  );
  
  const [startTime, setStartTime] = useState(
    initialData?.startTime ? new Date(initialData.startTime) : new Date()
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime ? new Date(initialData.endTime) : new Date(Date.now() + 60 * 60 * 1000)
  );
  
  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState(
    initialData?.reminderEnabled || false
  );
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    initialData?.reminderMinutesBefore || 30
  );
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  
  // Duration calculation
  const getDurationInMinutes = () => {
    const durationMs = endTime.getTime() - startTime.getTime();
    return Math.round(durationMs / (1000 * 60));
  };
  
  // Set end time based on duration
  const setDuration = (durationMinutes: number) => {
    const newEndTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    setEndTime(newEndTime);
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title for the event');
      return;
    }
    
    if (endTime < startTime) {
      alert('End time cannot be before start time');
      return;
    }
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: location.trim(),
      type,
      reminderEnabled,
      reminderMinutesBefore,
    });
    
    // Reset form
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setLocation('');
      setType('other');
      setStartTime(new Date());
      setEndTime(new Date(Date.now() + 60 * 60 * 1000));
      setReminderEnabled(false);
      setReminderMinutesBefore(30);
    }
  };
  
  const showDateTimePicker = (isStart: boolean, mode: 'date' | 'time') => {
    setPickerMode(mode);
    if (isStart) {
      setShowStartPicker(true);
    } else {
      setShowEndPicker(true);
    }
  };
  
  const handleDateTimeChange = (isStart: boolean, event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      if (isStart) {
        // If changing date, keep the time from the original date
        if (pickerMode === 'date') {
          const newDate = new Date(selectedDate);
          newDate.setHours(startTime.getHours(), startTime.getMinutes());
          setStartTime(newDate);
          
          // Maintain the same duration when changing start date
          const duration = getDurationInMinutes();
          const newEndTime = new Date(newDate.getTime() + duration * 60 * 1000);
          setEndTime(newEndTime);
        } else {
          // If changing time, keep the date from the original date
          const newDate = new Date(startTime);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          setStartTime(newDate);
          
          // Maintain the same duration when changing start time
          const duration = getDurationInMinutes();
          const newEndTime = new Date(newDate.getTime() + duration * 60 * 1000);
          setEndTime(newEndTime);
        }
      } else {
        if (pickerMode === 'date') {
          const newDate = new Date(selectedDate);
          newDate.setHours(endTime.getHours(), endTime.getMinutes());
          setEndTime(newDate);
        } else {
          const newDate = new Date(endTime);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          setEndTime(newDate);
        }
      }
    }
  };
  
  const eventTypes: Array<{ value: EventFormData['type']; label: string; color: string }> = [
    { value: 'interview', label: 'Interview', color: colors.primary },
    { value: 'deadline', label: 'Deadline', color: colors.error },
    { value: 'followup', label: 'Follow-up', color: colors.success },
    { value: 'meeting', label: 'Meeting', color: colors.warning },
    { value: 'other', label: 'Other', color: colors.textSecondary },
  ];
  
  const reminderOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
  ];
  
  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Event' : 'New Event'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContainer}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            style={styles.input}
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Event description (optional)"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
          
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>Start</Text>
              <View style={styles.dateTimeButtons}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => showDateTimePicker(true, 'date')}
                >
                  <CalendarIcon size={16} color={colors.primary} />
                  <Text style={styles.dateTimeButtonText}>
                    {format(startTime, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => showDateTimePicker(true, 'time')}
                >
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.dateTimeButtonText}>
                    {format(startTime, 'h:mm a')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.dateTimeRow}>
              <Text style={styles.dateTimeLabel}>End</Text>
              <View style={styles.dateTimeButtons}>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => showDateTimePicker(false, 'date')}
                >
                  <CalendarIcon size={16} color={colors.primary} />
                  <Text style={styles.dateTimeButtonText}>
                    {format(endTime, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => showDateTimePicker(false, 'time')}
                >
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.dateTimeButtonText}>
                    {format(endTime, 'h:mm a')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Duration Selector */}
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              Current: {getDurationInMinutes()} minutes
            </Text>
            <View style={styles.durationButtonsContainer}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationButton,
                    getDurationInMinutes() === option.value && {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary
                    }
                  ]}
                  onPress={() => setDuration(option.value)}
                >
                  <Text style={[
                    styles.durationButtonText,
                    getDurationInMinutes() === option.value && {
                      color: colors.primary,
                      fontWeight: '600'
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Location (optional)"
            style={styles.input}
            leftIcon={<MapPin size={16} color={colors.textSecondary} />}
          />
          
          <Text style={styles.sectionTitle}>Event Type</Text>
          <View style={styles.typeContainer}>
            {eventTypes.map((eventType) => (
              <TouchableOpacity
                key={eventType.value}
                style={[
                  styles.typeButton,
                  type === eventType.value && { 
                    backgroundColor: eventType.color + '20',
                    borderColor: eventType.color 
                  }
                ]}
                onPress={() => setType(eventType.value)}
              >
                <View 
                  style={[
                    styles.typeColorDot, 
                    { backgroundColor: eventType.color }
                  ]} 
                />
                <Text 
                  style={[
                    styles.typeButtonText,
                    type === eventType.value && { 
                      color: eventType.color,
                      fontWeight: '600'
                    }
                  ]}
                >
                  {eventType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Reminder Section */}
          <Text style={styles.sectionTitle}>Reminder</Text>
          <View style={styles.reminderContainer}>
            <View style={styles.reminderToggleRow}>
              <View style={styles.reminderToggleLabel}>
                <Bell size={18} color={reminderEnabled ? colors.primary : colors.textSecondary} style={styles.reminderIcon} />
                <Text style={[
                  styles.reminderText,
                  reminderEnabled && { color: colors.primary, fontWeight: '500' }
                ]}>
                  Set reminder
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.disabled, true: colors.primaryLight }}
                thumbColor={reminderEnabled ? colors.primary : colors.textSecondary}
              />
            </View>
            
            {reminderEnabled && (
              <View style={styles.reminderOptionsContainer}>
                <Text style={styles.reminderOptionsTitle}>Notify me:</Text>
                <View style={styles.reminderButtonsContainer}>
                  {reminderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.reminderButton,
                        reminderMinutesBefore === option.value && {
                          backgroundColor: colors.primaryLight,
                          borderColor: colors.primary
                        }
                      ]}
                      onPress={() => setReminderMinutesBefore(option.value)}
                    >
                      <Text style={[
                        styles.reminderButtonText,
                        reminderMinutesBefore === option.value && {
                          color: colors.primary,
                          fontWeight: '600'
                        }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title={isEditing ? 'Update' : 'Create'}
            onPress={handleSubmit}
            style={styles.footerButton}
          />
        </View>
        
        {/* Date/Time Pickers */}
        {(showStartPicker || showEndPicker) && Platform.OS === 'ios' && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => {
                setShowStartPicker(false);
                setShowEndPicker(false);
              }}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>
                {pickerMode === 'date' ? 'Select Date' : 'Select Time'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowStartPicker(false);
                setShowEndPicker(false);
              }}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={showStartPicker ? startTime : endTime}
              mode={pickerMode}
              display="spinner"
              onChange={(event, date) => 
                handleDateTimeChange(showStartPicker, event, date)
              }
            />
          </View>
        )}
        
        {/* Android date picker - shown as a dialog */}
        {Platform.OS === 'android' && showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode={pickerMode}
            is24Hour={false}
            onChange={(event, date) => handleDateTimeChange(true, event, date)}
          />
        )}
        
        {Platform.OS === 'android' && showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode={pickerMode}
            is24Hour={false}
            onChange={(event, date) => handleDateTimeChange(false, event, date)}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeLabel: {
    width: 50,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  dateTimeButtons: {
    flex: 1,
    flexDirection: 'row',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  dateTimeButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  durationButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  typeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  reminderContainer: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderToggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    marginRight: 8,
  },
  reminderText: {
    fontSize: 16,
    color: colors.text,
  },
  reminderOptionsContainer: {
    marginTop: 8,
  },
  reminderOptionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  reminderButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reminderButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  reminderButtonText: {
    fontSize: 14,
    color: colors.text,
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
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pickerCancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  pickerDoneText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});