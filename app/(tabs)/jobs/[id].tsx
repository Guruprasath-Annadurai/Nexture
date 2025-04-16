import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { mockJobs } from '@/data/mock-jobs';
import { Job } from '@/types/jobs';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  GraduationCap, 
  Award, 
  CheckCircle, 
  ArrowLeft, 
  Share2, 
  BookmarkPlus 
} from 'lucide-react-native';

export default function JobDetailScreen() {
  const { id, action } = useLocalSearchParams<{ id: string; action?: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch job details from an API
    // For now, use mock data
    const timer = setTimeout(() => {
      const foundJob = mockJobs.find(j => j.id === id);
      setJob(foundJob || null);
      setLoading(false);
      
      // If action is apply, show apply dialog
      if (action === 'apply' && foundJob) {
        handleApply();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id, action]);

  const handleApply = () => {
    if (applied) {
      Alert.alert(
        "Already Applied",
        "You have already applied to this job.",
        [{ text: "OK" }]
      );
      return;
    }
    
    Alert.alert(
      "Apply to Job",
      `Are you sure you want to apply for ${job?.title} at ${job?.company}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Apply",
          onPress: async () => {
            setApplying(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setApplying(false);
            setApplied(true);
            Alert.alert(
              "Application Submitted",
              "Your application has been submitted successfully!",
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  const handleSave = () => {
    setSaved(!saved);
    Alert.alert(
      saved ? "Job Removed" : "Job Saved",
      saved ? "This job has been removed from your saved jobs." : "This job has been saved to your profile.",
      [{ text: "OK" }]
    );
  };

  const handleShare = () => {
    Alert.alert(
      "Share Job",
      "This would share the job via your device's share functionality.",
      [{ text: "OK" }]
    );
  };

  const goBack = () => {
    router.back();
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return 'Not specified';
    return `$${salary.toLocaleString()} per year`;
  };

  if (loading) {
    return (
      <UserProtectedRoute>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </UserProtectedRoute>
    );
  }

  if (!job) {
    return (
      <UserProtectedRoute>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Job Not Found</Text>
          <Text style={styles.errorText}>The job you're looking for doesn't exist or has been removed.</Text>
          <Button
            title="Go Back"
            onPress={goBack}
            icon={<ArrowLeft size={18} color="#fff" />}
            style={styles.backButton}
          />
        </View>
      </UserProtectedRoute>
    );
  }

  return (
    <UserProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Button
            title="Back"
            variant="outline"
            icon={<ArrowLeft size={18} color={colors.primary} />}
            onPress={goBack}
            style={styles.backButton}
          />
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={applying ? "Applying..." : applied ? "Applied" : "Apply Now"}
            onPress={handleApply}
            disabled={applying || applied}
            icon={applying ? undefined : <Briefcase size={18} color={applied ? colors.textSecondary : "#fff"} />}
            style={styles.applyButton}
            variant={applied ? "outline" : "primary"}
          />
          
          <View style={styles.secondaryActions}>
            <Button
              title={saved ? "Saved" : "Save"}
              variant="outline"
              icon={<BookmarkPlus size={18} color={colors.primary} />}
              onPress={handleSave}
              style={styles.secondaryButton}
            />
            <Button
              title="Share"
              variant="outline"
              icon={<Share2 size={18} color={colors.primary} />}
              onPress={handleShare}
              style={styles.secondaryButton}
            />
          </View>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <MapPin size={20} color={colors.textSecondary} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <DollarSign size={20} color={colors.textSecondary} />
            <Text style={styles.detailText}>{formatSalary(job.salary)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Briefcase size={20} color={colors.textSecondary} />
            <Text style={styles.detailText}>{job.employmentType || 'Full-time'}</Text>
          </View>
          
          {job.requiredExperience && (
            <View style={styles.detailRow}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={styles.detailText}>{job.requiredExperience}+ years experience</Text>
            </View>
          )}
          
          {job.requiredEducation && (
            <View style={styles.detailRow}>
              <GraduationCap size={20} color={colors.textSecondary} />
              <Text style={styles.detailText}>{job.requiredEducation}</Text>
            </View>
          )}
          
          {job.remote !== undefined && (
            <View style={styles.detailRow}>
              <Award size={20} color={colors.textSecondary} />
              <Text style={styles.detailText}>{job.remote ? 'Remote' : 'On-site'}</Text>
            </View>
          )}
          
          {job.postedDate && (
            <View style={styles.detailRow}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={styles.detailText}>Posted on {job.postedDate}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>{job.description || 'No description provided.'}</Text>
        </Card>

        {(job.requiredSkills || job.preferredSkills) && (
          <Card style={styles.skillsCard}>
            {job.requiredSkills && (
              <View style={styles.skillsSection}>
                <Text style={styles.sectionTitle}>Required Skills</Text>
                <View style={styles.skillsContainer}>
                  {job.requiredSkills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {job.preferredSkills && (
              <View style={styles.skillsSection}>
                <Text style={styles.sectionTitle}>Preferred Skills</Text>
                <View style={styles.skillsContainer}>
                  {job.preferredSkills.map((skill, index) => (
                    <View key={index} style={[styles.skillBadge, styles.preferredSkillBadge]}>
                      <Text style={styles.preferredSkillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}

        {job.benefits && (
          <Card style={styles.benefitsCard}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <View style={styles.benefitsList}>
              {job.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <CheckCircle size={16} color={colors.primary} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <View style={styles.bottomActions}>
          <Button
            title={applying ? "Applying..." : applied ? "Applied" : "Apply Now"}
            onPress={handleApply}
            disabled={applying || applied}
            icon={applying ? undefined : <Briefcase size={18} color={applied ? colors.textSecondary : "#fff"} />}
            style={styles.bottomApplyButton}
            variant={applied ? "outline" : "primary"}
          />
        </View>
      </ScrollView>
    </UserProtectedRoute>
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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  company: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  actions: {
    padding: 16,
    paddingTop: 0,
  },
  applyButton: {
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  descriptionCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  skillsCard: {
    margin: 16,
    marginTop: 0,
  },
  skillsSection: {
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: {
    fontSize: 14,
    color: colors.text,
  },
  preferredSkillBadge: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  preferredSkillText: {
    fontSize: 14,
    color: colors.primary,
  },
  benefitsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 80,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: colors.text,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomApplyButton: {
    width: '100%',
  },
});