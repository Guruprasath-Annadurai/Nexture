import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { User, Mail, Calendar, Star, StarOff, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { fetchAPI } from '@/services/api';
import { Candidate, JobApplication, Interview } from '@/types/jobs';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function CandidateDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchCandidateDetails(id);
    }
  }, [id]);

  const fetchCandidateDetails = async (candidateId: string) => {
    setLoading(true);
    try {
      const response = await fetchAPI<{ 
        candidate: Candidate; 
        applications: JobApplication[];
        interviews: Interview[];
      }>(`/recruiter/candidate/${candidateId}`);
      
      setCandidate(response.candidate);
      setApplications(response.applications);
      setInterviews(response.interviews);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoading(false);
    }
  };

  const shortlistCandidate = async () => {
    if (!candidate) return;
    
    try {
      await fetchAPI('/recruiter/shortlist', {
        method: 'POST',
        body: JSON.stringify({ userId: candidate.id }),
      });
      
      // Update the local state to reflect the shortlisting
      setCandidate(prev => {
        if (!prev) return prev;
        
        const shortlistedBy = [...(prev.shortlistedBy || [])];
        if (user && !shortlistedBy.includes(user.id)) {
          shortlistedBy.push(user.id);
        }
        return { ...prev, shortlistedBy };
      });
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
    }
  };

  const removeShortlist = async () => {
    if (!candidate) return;
    
    try {
      // In a real app, you would make an API call to remove the shortlist
      // For this demo, we'll just update the local state
      
      setCandidate(prev => {
        if (!prev || !user) return prev;
        
        const shortlistedBy = (prev.shortlistedBy || []).filter(id => id !== user.id);
        return { ...prev, shortlistedBy };
      });
    } catch (error) {
      console.error('Error removing shortlist:', error);
    }
  };

  const contactCandidate = (email: string) => {
    if (Platform.OS === 'web') {
      window.open(`mailto:${email}?subject=Job Opportunity from Nexture Recruiter`, '_blank');
    } else {
      // On mobile, we would use Linking.openURL
      console.log(`Would open email to: ${email}`);
    }
  };

  const scheduleInterview = () => {
    if (!candidate) return;
    router.push(`/admin/schedule-interview?candidateId=${candidate.id}`);
  };

  const isShortlisted = () => {
    return user && candidate?.shortlistedBy?.includes(user.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return colors.info;
      case 'interview':
        return colors.primary;
      case 'offered':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'accepted':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading candidate details...</Text>
        </View>
      </AdminProtectedRoute>
    );
  }

  if (!candidate) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Candidate not found.</Text>
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
    <AdminProtectedRoute allowRecruiter={true}>
      <ScrollView style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={40} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidateEmail}>{candidate.email}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Average Match Score:</Text>
                <Text style={styles.scoreValue}>{candidate.avgScore}%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              title={isShortlisted() ? "Remove Shortlist" : "Shortlist"}
              onPress={isShortlisted() ? removeShortlist : shortlistCandidate}
              icon={isShortlisted() ? <StarOff size={20} color={colors.white} /> : <Star size={20} color={colors.white} />}
              variant={isShortlisted() ? "secondary" : "primary"}
              style={styles.actionButton}
            />
            <Button
              title="Contact"
              onPress={() => contactCandidate(candidate.email)}
              icon={<Mail size={20} color={colors.white} />}
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="Schedule Interview"
              onPress={scheduleInterview}
              icon={<Calendar size={20} color={colors.white} />}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        </Card>
        
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {candidate.skillsText.split(' ').map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </Card>
        
        {candidate.resumeText && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Resume Summary</Text>
            <Text style={styles.resumeText}>{candidate.resumeText}</Text>
          </Card>
        )}
        
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Applications ({applications.length})</Text>
          {applications.length === 0 ? (
            <Text style={styles.emptyText}>No applications found for this candidate.</Text>
          ) : (
            applications.map((application) => (
              <View key={application.id} style={styles.applicationItem}>
                <View style={styles.applicationHeader}>
                  <Briefcase size={18} color={colors.primary} />
                  <Text style={styles.applicationTitle}>{application.jobTitle}</Text>
                </View>
                <View style={styles.applicationDetails}>
                  <Text style={styles.applicationCompany}>{application.company}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.applicationFooter}>
                  <View style={styles.applicationDate}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={styles.dateText}>
                      Applied: {formatDate(application.appliedDate || application.appliedAt || application.updatedAt)}
                    </Text>
                  </View>
                  <View style={styles.applicationScore}>
                    <Text style={styles.scoreText}>Match: {application.matchScore}%</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card>
        
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Scheduled Interviews ({interviews.length})</Text>
          {interviews.length === 0 ? (
            <Text style={styles.emptyText}>No interviews scheduled yet.</Text>
          ) : (
            interviews.map((interview) => (
              <View key={interview.id} style={styles.interviewItem}>
                <View style={styles.interviewHeader}>
                  <Calendar size={18} color={colors.primary} />
                  <Text style={styles.interviewTitle}>{interview.method} Interview</Text>
                </View>
                <Text style={styles.interviewTime}>
                  Scheduled for: {formatDate(interview.time)}
                </Text>
                {interview.message && (
                  <Text style={styles.interviewMessage}>{interview.message}</Text>
                )}
              </View>
            ))
          )}
          <Button
            title="Schedule New Interview"
            onPress={scheduleInterview}
            style={styles.scheduleButton}
          />
        </Card>
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
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
  },
  backButton: {
    minWidth: 150,
  },
  profileCard: {
    margin: 16,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  candidateEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  resumeText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  applicationItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  applicationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationCompany: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  applicationScore: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  interviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  interviewTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  interviewMessage: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  scheduleButton: {
    marginTop: 8,
  },
});