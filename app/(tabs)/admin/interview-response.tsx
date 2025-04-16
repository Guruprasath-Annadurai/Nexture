import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { fetchAPI } from '@/services/api';
import { Interview } from '@/types/jobs';
import { Check, X, ArrowLeft, Calendar, Clock, Video, MessageSquare, User } from 'lucide-react-native';
import { format } from 'date-fns';
import { sendInterviewResponseNotification } from '@/services/notification-service';

export default function InterviewResponseScreen() {
  const { interviewId, response } = useLocalSearchParams<{ interviewId: string; response: string }>();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetails();
    } else {
      setError('Interview ID is required');
      setLoading(false);
    }
  }, [interviewId]);
  
  const fetchInterviewDetails = async () => {
    try {
      // In a real app, we would fetch the interview details from the API
      // For this demo, we'll create a mock interview
      const mockInterview: Interview = {
        id: interviewId || 'interview-123',
        recruiterId: 'recruiter-123',
        candidateId: 'candidate-123',
        time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        method: 'Zoom',
        message: 'We would like to discuss your application for the Software Developer position.',
        createdAt: new Date().toISOString(),
        duration: 45,
        status: 'pending'
      };
      
      setInterview(mockInterview);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interview details:', error);
      setError('Failed to fetch interview details');
      setLoading(false);
    }
  };
  
  const handleResponse = async (responseType: 'accepted' | 'declined') => {
    if (!interview) return;
    
    try {
      setSubmitting(true);
      
      // In a real app, we would send the response to the API
      const apiResponse = await fetchAPI(`/interview/respond/${interview.id}`, {
        method: 'POST',
        body: JSON.stringify({ response: responseType }),
      });
      
      // Send notification
      if (interview) {
        await sendInterviewResponseNotification(interview, responseType);
      }
      
      setSuccess(true);
      setSubmitting(false);
    } catch (error) {
      console.error('Error responding to interview:', error);
      setError('Failed to respond to interview');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading interview details...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Go to Home"
          onPress={() => router.push('/')}
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconContainer}>
          {response === 'accept' ? (
            <Check size={64} color={colors.success} />
          ) : (
            <X size={64} color={colors.error} />
          )}
        </View>
        <Text style={styles.successTitle}>
          {response === 'accept' ? 'Interview Accepted' : 'Interview Declined'}
        </Text>
        <Text style={styles.successText}>
          {response === 'accept'
            ? 'You have successfully accepted the interview invitation.'
            : 'You have declined the interview invitation.'}
        </Text>
        <Button
          title="Go to Home"
          onPress={() => router.push('/')}
          style={styles.successButton}
        />
      </View>
    );
  }
  
  if (!interview) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Interview not found</Text>
        <Button
          title="Go to Home"
          onPress={() => router.push('/')}
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/')}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Invitation</Text>
      </View>
      
      <Card style={styles.interviewCard}>
        <Text style={styles.interviewTitle}>You've been invited to an interview</Text>
        
        <View style={styles.detailRow}>
          <Calendar size={20} color={colors.primary} style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {format(new Date(interview.time), 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={20} color={colors.primary} style={styles.detailIcon} />
          <Text style={styles.detailText}>
            {format(new Date(interview.time), 'h:mm a')}
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
          <Text style={styles.detailText}>
            Method: {interview.method}
          </Text>
        </View>
        
        <View style={styles.messageContainer}>
          <MessageSquare size={20} color={colors.primary} style={styles.detailIcon} />
          <Text style={styles.messageText}>
            {interview.message}
          </Text>
        </View>
      </Card>
      
      <View style={styles.actionsContainer}>
        <Button
          title="Accept"
          onPress={() => handleResponse('accepted')}
          style={styles.acceptButton}
          loading={submitting && response === 'accept'}
          disabled={submitting}
          icon={<Check size={20} color="#fff" />}
        />
        <Button
          title="Decline"
          onPress={() => handleResponse('declined')}
          style={styles.declineButton}
          loading={submitting && response === 'decline'}
          disabled={submitting}
          icon={<X size={20} color="#fff" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  interviewCard: {
    padding: 20,
    marginBottom: 24,
  },
  interviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
    color: '#555',
  },
  messageContainer: {
    flexDirection: 'row',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    marginLeft: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.success,
  },
  declineButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    width: 200,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  successText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  successButton: {
    width: 200,
  },
});