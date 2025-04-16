import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { JobApplication, ApplicationStatus } from '@/types/jobs';
import { 
  Briefcase, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  FileText 
} from 'lucide-react-native';

export default function AppliedJobsScreen() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch applications from an API
    // For now, simulate loading
    const timer = setTimeout(() => {
      // Mock data
      const mockApplications: JobApplication[] = [
        {
          id: '1',
          jobId: '1',
          userId: 'user1',
          status: 'interview',
          appliedDate: '2023-06-01',
          lastUpdated: '2023-06-05',
          interviews: [
            {
              id: 'int1',
              date: '2023-06-10T14:00:00Z',
              type: 'video',
              completed: false,
            }
          ],
        },
        {
          id: '2',
          jobId: '2',
          userId: 'user1',
          status: 'applied',
          appliedDate: '2023-06-03',
          lastUpdated: '2023-06-03',
        },
        {
          id: '3',
          jobId: '4',
          userId: 'user1',
          status: 'screening',
          appliedDate: '2023-05-28',
          lastUpdated: '2023-06-02',
        },
        {
          id: '4',
          jobId: '6',
          userId: 'user1',
          status: 'rejected',
          appliedDate: '2023-05-15',
          lastUpdated: '2023-05-25',
          feedback: [
            {
              id: 'f1',
              date: '2023-05-25',
              content: 'Thank you for your application. We have decided to move forward with candidates who have more experience in UI/UX design.',
            }
          ],
        },
        {
          id: '5',
          jobId: '3',
          userId: 'user1',
          status: 'technical',
          appliedDate: '2023-05-20',
          lastUpdated: '2023-06-04',
          interviews: [
            {
              id: 'int2',
              date: '2023-06-01T10:00:00Z',
              type: 'phone',
              completed: true,
            },
            {
              id: 'int3',
              date: '2023-06-08T15:00:00Z',
              type: 'technical',
              completed: false,
            }
          ],
        },
      ];
      
      setApplications(mockApplications);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'applied':
        return colors.info;
      case 'screening':
        return colors.warning;
      case 'interview':
      case 'technical':
        return colors.primary;
      case 'offer':
        return colors.success;
      case 'accepted':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'withdrawn':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'applied':
        return <Clock size={20} color={getStatusColor(status)} />;
      case 'screening':
        return <FileText size={20} color={getStatusColor(status)} />;
      case 'interview':
      case 'technical':
        return <Calendar size={20} color={getStatusColor(status)} />;
      case 'offer':
      case 'accepted':
        return <CheckCircle size={20} color={getStatusColor(status)} />;
      case 'rejected':
        return <XCircle size={20} color={getStatusColor(status)} />;
      case 'withdrawn':
        return <AlertCircle size={20} color={getStatusColor(status)} />;
      default:
        return <Briefcase size={20} color={getStatusColor(status)} />;
    }
  };

  const formatStatus = (status: ApplicationStatus): string => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'screening':
        return 'Resume Screening';
      case 'interview':
        return 'Interview Scheduled';
      case 'technical':
        return 'Technical Interview';
      case 'offer':
        return 'Offer Received';
      case 'accepted':
        return 'Offer Accepted';
      case 'rejected':
        return 'Not Selected';
      case 'withdrawn':
        return 'Application Withdrawn';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const viewJobDetails = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const goBack = () => {
    router.back();
  };

  const getJobTitle = (jobId: string): string => {
    // In a real app, we would get this from a job store or API
    const jobTitles: Record<string, string> = {
      '1': 'Senior React Native Developer at TechCorp',
      '2': 'Frontend Developer at WebSolutions Inc',
      '3': 'Full Stack JavaScript Developer at InnovateTech',
      '4': 'Mobile App Developer at AppWorks',
      '6': 'Backend Node.js Developer at ServerSide Solutions',
    };
    
    return jobTitles[jobId] || 'Unknown Job';
  };

  const getUpcomingInterview = (application: JobApplication) => {
    if (!application.interviews) return null;
    
    const now = new Date();
    const upcomingInterviews = application.interviews
      .filter(interview => !interview.completed && new Date(interview.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;
  };

  const formatInterviewDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <UserProtectedRoute>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="Back"
            variant="outline"
            icon={<ArrowLeft size={18} color={colors.primary} />}
            onPress={goBack}
            style={styles.backButton}
          />
          <Text style={styles.title}>Applied Jobs</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your applications...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>
              {applications.length} {applications.length === 1 ? 'application' : 'applications'} found
            </Text>
            
            <ScrollView style={styles.scrollView}>
              {applications.map((application) => {
                const upcomingInterview = getUpcomingInterview(application);
                
                return (
                  <Card key={application.id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <Text style={styles.jobTitle}>{getJobTitle(application.jobId)}</Text>
                      <View style={styles.statusContainer}>
                        {getStatusIcon(application.status)}
                        <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                          {formatStatus(application.status)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateLabel}>Applied:</Text>
                      <Text style={styles.dateValue}>{formatDate(application.appliedDate)}</Text>
                      
                      {application.lastUpdated !== application.appliedDate && (
                        <>
                          <Text style={styles.dateLabel}>Updated:</Text>
                          <Text style={styles.dateValue}>{formatDate(application.lastUpdated)}</Text>
                        </>
                      )}
                    </View>
                    
                    {upcomingInterview && (
                      <View style={styles.interviewContainer}>
                        <Text style={styles.interviewTitle}>
                          Upcoming {upcomingInterview.type.charAt(0).toUpperCase() + upcomingInterview.type.slice(1)} Interview
                        </Text>
                        <Text style={styles.interviewDate}>
                          {formatInterviewDate(upcomingInterview.date)}
                        </Text>
                      </View>
                    )}
                    
                    {application.feedback && application.feedback.length > 0 && (
                      <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackTitle}>Feedback</Text>
                        <Text style={styles.feedbackContent}>
                          {application.feedback[0].content}
                        </Text>
                      </View>
                    )}
                    
                    <Button 
                      title="View Job Details"
                      onPress={() => viewJobDetails(application.jobId)}
                      variant="outline"
                      style={styles.viewButton}
                    />
                  </Card>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>
    </UserProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultsText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  applicationCard: {
    marginBottom: 16,
  },
  applicationHeader: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
    color: colors.text,
    marginRight: 12,
  },
  interviewContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  interviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  interviewDate: {
    fontSize: 14,
    color: colors.primary,
  },
  feedbackContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  feedbackContent: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  viewButton: {
    marginTop: 8,
  },
});