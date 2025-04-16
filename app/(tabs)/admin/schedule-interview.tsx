import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { TextArea } from '@/components/TextArea';
import { colors } from '@/constants/colors';
import { fetchAPI } from '@/services/api';
import { Candidate, Interview } from '@/types/jobs';
import { ArrowLeft, Calendar, Clock, Users, Video, MessageSquare, Check, X, Brain } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { suggestInterviewDuration } from '@/services/ai-service';
import { useAIStore } from '@/stores/ai-store';

export default function ScheduleInterviewScreen() {
  const { candidateId } = useLocalSearchParams<{ candidateId: string }>();
  const { selectedModel } = useAIStore();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Interview form state
  const [interviewDate, setInterviewDate] = useState(new Date());
  const [interviewTime, setInterviewTime] = useState(new Date());
  const [method, setMethod] = useState('Zoom');
  const [message, setMessage] = useState('');
  const [sendCalendarInvite, setSendCalendarInvite] = useState(true);
  const [isGroup, setIsGroup] = useState(false);
  const [candidateIds, setCandidateIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(30); // Default 30 minutes
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Duration suggestion state
  const [isDurationLoading, setIsDurationLoading] = useState(false);
  const [durationExplanation, setDurationExplanation] = useState<string | null>(null);
  
  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetails();
    }
  }, [candidateId]);
  
  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI(`/recruiter/candidate/${candidateId}`);
      setCandidate(response.candidate);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      Alert.alert('Error', 'Failed to fetch candidate details');
      setLoading(false);
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setInterviewDate(selectedDate);
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setInterviewTime(selectedTime);
    }
  };
  
  const handleScheduleInterview = async () => {
    if (!candidate) return;
    
    try {
      setSubmitting(true);
      
      // Combine date and time
      const combinedDateTime = new Date(interviewDate);
      combinedDateTime.setHours(
        interviewTime.getHours(),
        interviewTime.getMinutes(),
        0,
        0
      );
      
      const interviewData = {
        candidateId: candidate.id,
        candidateIds: isGroup ? candidateIds : undefined,
        time: combinedDateTime.toISOString(),
        method,
        message,
        sendCalendarInvite,
        isGroup,
        duration
      };
      
      const response = await fetchAPI('/interview/schedule', {
        method: 'POST',
        body: JSON.stringify(interviewData),
      });
      
      Alert.alert(
        'Success',
        `Interview scheduled successfully${sendCalendarInvite ? ' and calendar invite sent' : ''}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      Alert.alert('Error', 'Failed to schedule interview');
      setSubmitting(false);
    }
  };
  
  const handleSuggestDuration = async () => {
    if (!candidate || !candidate.resumeText) {
      Alert.alert('Error', 'Candidate resume text is required for duration suggestion');
      return;
    }
    
    try {
      setIsDurationLoading(true);
      
      // Extract job title from candidate applications if available
      const jobTitle = candidate.applications > 0 
        ? 'Software Developer' // Placeholder, in a real app we'd use actual job title
        : 'Unknown Position';
      
      const suggestedDuration = await suggestInterviewDuration(
        jobTitle,
        candidate.resumeText,
        selectedModel
      );
      
      setDuration(suggestedDuration);
      
      // Generate explanation based on duration
      let explanation = '';
      if (suggestedDuration <= 15) {
        explanation = `A ${suggestedDuration}-minute interview is suitable for initial screening of candidates for this role.`;
      } else if (suggestedDuration <= 30) {
        explanation = `A ${suggestedDuration}-minute interview provides enough time for standard questions while respecting everyone's schedule.`;
      } else if (suggestedDuration <= 45) {
        explanation = `A ${suggestedDuration}-minute interview allows time for in-depth technical questions and discussion of past experience.`;
      } else if (suggestedDuration <= 60) {
        explanation = `A ${suggestedDuration}-minute interview provides ample time for comprehensive evaluation including technical assessment and behavioral questions.`;
      } else {
        explanation = `A ${suggestedDuration}-minute interview is recommended for this senior role, allowing for thorough technical evaluation and detailed discussion.`;
      }
      
      setDurationExplanation(explanation);
      setIsDurationLoading(false);
    } catch (error) {
      console.error('Error suggesting interview duration:', error);
      Alert.alert('Error', 'Failed to suggest interview duration');
      setIsDurationLoading(false);
    }
  };
  
  if (loading) {
    return (
      <AdminProtectedRoute>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading candidate details...</Text>
        </View>
      </AdminProtectedRoute>
    );
  }
  
  if (!candidate) {
    return (
      <AdminProtectedRoute>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Candidate not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </AdminProtectedRoute>
    );
  }
  
  return (
    <AdminProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Interview</Text>
        </View>
        
        <Card style={styles.candidateCard}>
          <Text style={styles.candidateName}>{candidate.name}</Text>
          <Text style={styles.candidateEmail}>{candidate.email}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Match Score:</Text>
            <Text style={styles.scoreValue}>{candidate.avgScore}%</Text>
          </View>
          {candidate.timezone && (
            <View style={styles.timezoneContainer}>
              <Text style={styles.timezoneLabel}>Timezone:</Text>
              <Text style={styles.timezoneValue}>{candidate.timezone}</Text>
            </View>
          )}
        </Card>
        
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Interview Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {format(interviewDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {format(interviewTime, 'h:mm a')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationContainer}>
              <View style={styles.durationButtonsContainer}>
                {[15, 30, 45, 60, 90].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.durationButton,
                      duration === mins && styles.durationButtonActive,
                    ]}
                    onPress={() => setDuration(mins)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        duration === mins && styles.durationButtonTextActive,
                      ]}
                    >
                      {mins} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Button
                title="Suggest Duration"
                onPress={handleSuggestDuration}
                loading={isDurationLoading}
                variant="outline"
                icon={<Brain size={18} color={colors.primary} />}
                style={styles.suggestButton}
              />
              
              {durationExplanation && (
                <View style={styles.explanationContainer}>
                  <Text style={styles.explanationText}>{durationExplanation}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Method</Text>
            <TextInput
              value={method}
              onChangeText={setMethod}
              placeholder="e.g. Zoom, Google Meet, In-person"
              leftIcon={<Video size={20} color={colors.textSecondary} />}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Message (Optional)</Text>
            <TextArea
              value={message}
              onChangeText={setMessage}
              placeholder="Add a message for the candidate..."
              style={styles.messageInput}
            />
          </View>
          
          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setSendCalendarInvite(!sendCalendarInvite)}
              >
                <View
                  style={[
                    styles.checkbox,
                    sendCalendarInvite && styles.checkboxChecked,
                  ]}
                >
                  {sendCalendarInvite && <Check size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Send calendar invite</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsGroup(!isGroup)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isGroup && styles.checkboxChecked,
                  ]}
                >
                  {isGroup && <Check size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Group interview</Text>
              </TouchableOpacity>
            </View>
            
            {isGroup && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Additional Candidates</Text>
                <TextInput
                  placeholder="Enter candidate IDs separated by commas"
                  onChangeText={(text) => setCandidateIds(text.split(',').map(id => id.trim()))}
                  leftIcon={<Users size={20} color={colors.textSecondary} />}
                />
              </View>
            )}
          </View>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Schedule Interview"
            onPress={handleScheduleInterview}
            loading={submitting}
            style={styles.submitButton}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={interviewDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        
        {showTimePicker && (
          <DateTimePicker
            value={interviewTime}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  candidateCard: {
    margin: 16,
    padding: 16,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  candidateEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  timezoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timezoneLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  timezoneValue: {
    fontSize: 14,
    color: colors.text,
  },
  formCard: {
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
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
  durationContainer: {
    marginBottom: 8,
  },
  durationButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  durationButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  suggestButton: {
    marginBottom: 12,
  },
  explanationContainer: {
    backgroundColor: colors.primaryLight + '30',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  messageInput: {
    height: 100,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 8,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 24,
  },
});