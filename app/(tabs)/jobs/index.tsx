import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { mockJobs } from '@/data/mock-jobs';
import { Job } from '@/types/jobs';
import { Briefcase, Search, History, Filter, MapPin, DollarSign } from 'lucide-react-native';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'remote' | 'onsite'>('all');

  useEffect(() => {
    // In a real app, we would fetch jobs from an API
    // For now, use mock data
    const timer = setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'remote') return job.remote === true;
    if (filter === 'onsite') return job.remote === false;
    return true;
  });

  const goToJobMatch = () => {
    router.push('/jobs/match');
  };
  
  const goToJobMatchHistory = () => {
    router.push('/jobs/history');
  };

  const goToJobDetails = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const goToAppliedJobs = () => {
    router.push('/jobs/applied');
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return 'Salary not specified';
    return `$${salary.toLocaleString()} per year`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Next Job</Text>
        <Text style={styles.subtitle}>
          Browse opportunities or find matches for your skills
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Find Matching Jobs"
          onPress={goToJobMatch}
          icon={<Search size={18} color="#fff" />}
          style={styles.actionButton}
        />
        <Button
          title="View Match History"
          variant="outline"
          onPress={goToJobMatchHistory}
          icon={<History size={18} color={colors.primary} />}
          style={styles.actionButton}
        />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All Jobs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'remote' && styles.filterButtonActive]}
            onPress={() => setFilter('remote')}
          >
            <Text style={[styles.filterButtonText, filter === 'remote' && styles.filterButtonTextActive]}>
              Remote
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'onsite' && styles.filterButtonActive]}
            onPress={() => setFilter('onsite')}
          >
            <Text style={[styles.filterButtonText, filter === 'onsite' && styles.filterButtonTextActive]}>
              On-site
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        
        {filteredJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            onPress={() => goToJobDetails(job.id)}
            activeOpacity={0.7}
          >
            <Card style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {job.remote !== undefined && (
                  <View style={[
                    styles.jobBadge,
                    job.remote ? styles.remoteBadge : styles.onsiteBadge
                  ]}>
                    <Text style={[
                      styles.jobBadgeText,
                      job.remote ? styles.remoteBadgeText : styles.onsiteBadgeText
                    ]}>
                      {job.remote ? 'Remote' : 'On-site'}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.jobCompany}>{job.company}</Text>
              
              <View style={styles.jobDetails}>
                <View style={styles.jobDetailItem}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.location}</Text>
                </View>
                
                <View style={styles.jobDetailItem}>
                  <DollarSign size={16} color={colors.textSecondary} />
                  <Text style={styles.jobDetailText}>{formatSalary(job.salary)}</Text>
                </View>
              </View>
              
              {job.requiredSkills && (
                <View style={styles.skillsContainer}>
                  {job.requiredSkills.slice(0, 3).map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {job.requiredSkills.length > 3 && (
                    <View style={styles.skillBadge}>
                      <Text style={styles.skillText}>+{job.requiredSkills.length - 3} more</Text>
                    </View>
                  )}
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}
        
        <Button
          title="View Applied Jobs"
          variant="outline"
          onPress={goToAppliedJobs}
          icon={<Briefcase size={18} color={colors.primary} />}
          style={styles.viewAppliedButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  jobBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  remoteBadge: {
    backgroundColor: colors.primaryLight,
  },
  onsiteBadge: {
    backgroundColor: colors.secondaryLight,
  },
  jobBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  remoteBadgeText: {
    color: colors.primary,
  },
  onsiteBadgeText: {
    color: colors.secondary,
  },
  jobCompany: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  jobDetails: {
    marginBottom: 12,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewAppliedButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});