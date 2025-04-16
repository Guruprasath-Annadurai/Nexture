import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextArea } from '@/components/TextArea';
import { colors } from '@/constants/colors';
import { fetchAPI } from '@/services/api';
import { Interview } from '@/types/jobs';
import { ArrowLeft, Calendar, Clock, Video, MessageSquare, Check, X, Edit, RefreshCw, Trash2, Send } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { sendInterviewResponseNotification } from '@/services/notification-service';

export default function InterviewDetailsScreen() {
  const { interviewId } = useLocalSearchParams<{ interviewId: string }>();
  
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  
  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetails();
    }
  }, [interviewId]);
  
  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(`/interview/${interviewId}`);
      setInterview(response.interview);
      setNotes(response.interview.notes || '');
      setFeedback(response.interview.feedback || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interview details:', error);
      Alert.alert('Error', 'Failed to fetch interview details');
      setLoading(false);
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewDate(selectedDate);
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNewTime(selectedTime);
    }
  };
  
  const handleSaveNotes = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      
      await fetchAPI(`/interview/${interview.id}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
      
      Alert.alert('Success', 'Notes saved successfully');
      setSubmitting(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Error', 'Failed to save notes');
      setSubmitting(false);
    }
  };
  
  const handleSaveFeedback = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      
      await fetchAPI(`/interview/${interview.id}/feedback`, {
        method: 'PUT',
        body: JSON.stringify({ feedback }),
      });
      
      Alert.alert('Success', 'Feedback saved successfully');
      setSubmitting(false);
    } catch (error) {
      console.error('Error saving feedback:', error);
      Alert.alert('Error', 'Failed to save feedback');
      setSubmitting(false);
    }
  };
  
  const handleReschedule = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      
      // Combine date and time
      const combinedDateTime = new Date(newDate);
      combinedDateTime.setHours(
        newTime.getHours(),
        newTime.getMinutes(),
        0,
        0
      );
      
      const response = await fetchAPI(`/interview/${interview.id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ newTime: combinedDateTime.toISOString() }),
      });
      
      Alert.alert(
        'Success',
        'Interview rescheduled successfully. The candidate has been notified.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsRescheduling(false);
              fetchInterviewDetails(); // Refresh the interview details
            },
          },
        ]
      );
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      Alert.alert('Error', 'Failed to reschedule interview');
      setSubmitting(false);
    }
  };
  
  const handleCancelInterview = async () => {
    if (!interview) return;
    
    Alert.alert(
      'Cancel Interview',
      'Are you sure you want to cancel this interview? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              await fetchAPI(`/interview/${interview.id}/cancel`, {
                method: 'POST',
              });
              
              Alert.alert(
                'Success',
                'Interview cancelled successfully. The candidate has been notified.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
              
              setSubmitting(false);
            } catch (error) {
              console.error('Error cancelling interview:', error);
              Alert.alert('Error', 'Failed to cancel interview');
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };
  
  const handleSendReminder = async () => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      
      await fetchAPI(`/interview/${interview.id}/remind`, {
        method: 'POST',
      });
      
      Alert.alert('Success', 'Reminder sent to the candidate');
      setSubmitting(false);
    } catch (error) {
      console.error('Error sending reminder:', error);
      Alert.alert('Error', 'Failed to send reminder');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading interview details...</Text>
        </View>
      </AdminProtectedRoute>
    );
  }
  
  if (!interview) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Interview not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </AdminProtectedRoute>
    );
  }
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
        return colors.success;
      case 'declined':
        return colors.error;
      case 'pending':
      default:
        return colors.warning;
    }
  };
  
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      case 'pending':
      default:
        return 'Pending';
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy h:mm a');
  };
  
  return (
    <AdminProtectedRoute allowRecruiter={true}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Details</Text>
        </View>
        
        <Card style={styles.interviewCard}>
          <View style={styles.interviewHeader}>
            <View>
              <Text style={styles.interviewTitle}>{interview.method} Interview</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(interview.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(interview.status) }]}>
                  {getStatusText(interview.status)}
                </Text>
              </View>
            </View>
            
            {interview.rescheduled && (
              <View style={styles.rescheduledBadge}>
                <RefreshCw size={14} color={colors.primary} />
                <Text style={styles.rescheduledText}>Rescheduled</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Calendar size={20} color={colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {formatDateTime(interview.time)}
            </Text>
          </View>
          
          {interview.duration && (
            <View style={styles.detailRow}>
              <Clock size={20} color={colors.primary} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                Duration: {interview.duration} minutes
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Video size={20} color={colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>{interview.method}</Text>
          </View>
          
          {interview.message && (
            <View style={styles.messageContainer}>
              <View style={styles.detailRow}>
                <MessageSquare size={20} color={colors.primary} style={styles.detailIcon} />
                <Text style={styles.messageLabel}>Message to Candidate:</Text>
              </View>
              <Text style={styles.messageText}>{interview.message}</Text>
            </View>
          )}
          
          {interview.rescheduled && interview.originalTime && (
            <View style={styles.originalTimeContainer}>
              <Text style={styles.originalTimeLabel}>Original Time:</Text>
              <Text style={styles.originalTimeText}>{formatDateTime(interview.originalTime)}</Text>
            </View>
          )}
        </Card>
        
        {!isRescheduling ? (
          <View style={styles.actionButtonsContainer}>
            <Button
              title="Reschedule"
              onPress={() => setIsRescheduling(true)}
              icon={<RefreshCw size={20} color={colors.white} />}
              style={styles.actionButton}
            />
            <Button
              title="Send Reminder"
              onPress={handleSendReminder}
              loading={submitting}
              icon={<Send size={20} color={colors.white} />}
              style={styles.actionButton}
              variant="secondary"
            />
            <Button
              title="Cancel Interview"
              onPress={handleCancelInterview}
              loading={submitting}
              icon={<Trash2 size={20} color={colors.white} />}
              style={styles.actionButton}
              variant="danger"
            />
          </View>
        ) : (
          <Card style={styles.rescheduleCard}>
            <Text style={styles.rescheduleTitle}>Reschedule Interview</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={colors.primary} style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {format(newDate, 'EEEE, MMMM d, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Time</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={colors.primary} style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {format(newTime, 'h:mm a')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.rescheduleButtons}>
              <Button
                title="Confirm Reschedule"
                onPress={handleReschedule}
                loading={submitting}
                style={styles.rescheduleButton}
              />
              <Button
                title="Cancel"
                onPress={() => setIsRescheduling(false)}
                variant="outline"
                style={styles.cancelRescheduleButton}
              />
            </View>
          </Card>
        )}
        
        <Card style={styles.notesCard}>
          <Text style={styles.notesTitle}>Recruiter Notes</Text>
          <TextArea
            value={notes}
            onChangeText={setNotes}
            placeholder="Add private notes about this interview..."
            style={styles.notesInput}
          />
          <Button
            title="Save Notes"
            onPress={handleSaveNotes}
            loading={submitting}
            icon={<Edit size={20} color={colors.white} />}
            style={styles.saveButton}
          />
        </Card>
        
        <Card style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Candidate Feedback</Text>
          <TextArea
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Add feedback about the candidate after the interview..."
            style={styles.feedbackInput}
          />
          <Button
            title="Save Feedback"
            onPress={handleSaveFeedback}
            loading={submitting}
            icon={<Edit size={20} color={colors.white} />}
            style={styles.saveButton}
          />
        </Card>
        
        {showDatePicker && (
          <DateTimePicker
            value={newDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        
        {showTimePicker && (
          <DateTimePicker
            value={newTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </AdminProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  interviewCard: {
    margin: 16,
    padding: 16,
  },
  interviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  interviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rescheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rescheduledText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  messageContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 8,
    marginLeft: 32,
    lineHeight: 22,
  },
  originalTimeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  originalTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  originalTimeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    marginBottom: 12,
  },
  rescheduleCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  rescheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.card,
  },
  inputIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.text,
  },
  rescheduleButtons: {
    marginTop: 8,
  },
  rescheduleButton: {
    marginBottom: 12,
  },
  cancelRescheduleButton: {
    marginBottom: 12,
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  notesInput: {
    height: 120,
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 8,
  },
  feedbackCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  feedbackInput: {
    height: 120,
    marginBottom: 16,
  },
});