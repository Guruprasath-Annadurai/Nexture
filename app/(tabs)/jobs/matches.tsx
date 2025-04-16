import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useJobsStore } from '@/stores/jobs-store';
import { Briefcase, ArrowLeft, Filter, SortAsc, SortDesc } from 'lucide-react-native';

export default function JobMatchesScreen() {
  const { matchedJobs, isLoading } = useJobsStore();
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterApplied, setFilterApplied] = useState(false);
  const [displayJobs, setDisplayJobs] = useState<any[]>([]);

  // Apply sorting and filtering whenever dependencies change
  useEffect(() => {
    if (matchedJobs.length === 0 && !isLoading) {
      // If no jobs are loaded, use mock data
      const mockJobs = [
        {
          id: '1',
          title: 'Senior React Native Developer',
          company: 'TechCorp',
          location: 'Remote',
          score: 92,
          matchedSkills: ['React Native', 'JavaScript', 'Redux', 'API Integration'],
          reason: 'Matched on skills: React Native, JavaScript, Redux, API Integration. Your 5 years of experience meets the 4 year requirement.',
          applied: true,
        },
        {
          id: '2',
          title: 'Frontend Developer',
          company: 'WebSolutions Inc',
          location: 'New York, NY',
          score: 85,
          matchedSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
          reason: 'Matched on skills: React, JavaScript, HTML, CSS. Your experience is well-suited for this role.',
        },
        {
          id: '3',
          title: 'Mobile App Developer',
          company: 'AppWorks',
          location: 'Austin, TX',
          score: 78,
          matchedSkills: ['React Native', 'JavaScript', 'Redux'],
          reason: 'Matched on skills: React Native, JavaScript, Redux. Your mobile development experience is valuable for this position.',
        },
        {
          id: '4',
          title: 'Full Stack JavaScript Developer',
          company: 'InnovateTech',
          location: 'San Francisco, CA',
          score: 75,
          matchedSkills: ['JavaScript', 'Node.js', 'React'],
          reason: 'Matched on skills: JavaScript, Node.js, React. Consider highlighting more backend experience for better matches.',
        },
        {
          id: '5',
          title: 'React Native Contractor',
          company: 'ProjectBoost',
          location: 'Remote',
          score: 70,
          matchedSkills: ['React Native', 'JavaScript', 'Redux'],
          reason: 'Matched on skills: React Native, JavaScript, Redux. This is a 6-month contract role that matches your technical skills.',
        },
      ];
      
      // Apply sorting and filtering to mock data
      let filtered = filterApplied ? mockJobs.filter(job => !job.applied) : mockJobs;
      
      let sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'score') {
          return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
        } else {
          // Sort by date (mock implementation)
          return sortOrder === 'desc' ? -1 : 1;
        }
      });
      
      setDisplayJobs(sorted);
    } else {
      // Use real matched jobs from the store
      let filtered = filterApplied ? matchedJobs.filter(job => !job.applied) : matchedJobs;
      
      let sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'score') {
          return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
        } else {
          // Sort by date if available, otherwise use score
          const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        }
      });
      
      setDisplayJobs(sorted);
    }
  }, [matchedJobs, isLoading, sortBy, sortOrder, filterApplied]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const toggleSortBy = () => {
    setSortBy(sortBy === 'score' ? 'date' : 'score');
  };

  const toggleFilter = () => {
    setFilterApplied(!filterApplied);
  };

  const applyToJob = (jobId: string) => {
    // Navigate to job details with apply action
    router.push(`/jobs/${jobId}?action=apply`);
  };

  const goBack = () => {
    router.back();
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
          <Text style={styles.title}>Job Matches</Text>
        </View>

        <View style={styles.controls}>
          <Button
            title={`Sort: ${sortBy === 'score' ? 'Match Score' : 'Date'}`}
            variant="outline"
            icon={<SortAsc size={18} color={colors.primary} />}
            onPress={toggleSortBy}
            style={styles.controlButton}
          />
          <Button
            title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
            variant="outline"
            icon={sortOrder === 'desc' ? <SortDesc size={18} color={colors.primary} /> : <SortAsc size={18} color={colors.primary} />}
            onPress={toggleSortOrder}
            style={styles.controlButton}
          />
          <Button
            title={filterApplied ? 'Show All' : 'Hide Applied'}
            variant={filterApplied ? 'primary' : 'outline'}
            icon={<Filter size={18} color={filterApplied ? 'white' : colors.primary} />}
            onPress={toggleFilter}
            style={styles.controlButton}
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your job matches...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsText}>
              {displayJobs.length} {displayJobs.length === 1 ? 'match' : 'matches'} found
            </Text>
            
            <ScrollView style={styles.scrollView}>
              {displayJobs.map((match) => (
                <Card key={match.id} style={styles.matchCard}>
                  <View style={styles.matchHeader}>
                    <View style={styles.matchTitleContainer}>
                      <Text style={styles.matchTitle}>{match.title}</Text>
                      <Text style={styles.matchCompany}>{match.company}</Text>
                      <Text style={styles.matchLocation}>{match.location}</Text>
                    </View>
                    <View style={styles.matchScoreContainer}>
                      <Text style={styles.matchScore}>{match.score}%</Text>
                      <Text style={styles.matchScoreLabel}>Match</Text>
                    </View>
                  </View>
                  
                  <View style={styles.skillsContainer}>
                    {match.matchedSkills && match.matchedSkills.map((skill: string, index: number) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <Text style={styles.matchReason}>{match.reason}</Text>
                  
                  <Button 
                    title={match.applied ? "Applied" : "Apply"}
                    onPress={() => applyToJob(match.id)}
                    icon={<Briefcase size={16} color={match.applied ? colors.textLight : "#fff"} />}
                    style={styles.applyButton}
                    variant={match.applied ? "outline" : "primary"}
                    disabled={match.applied}
                  />
                </Card>
              ))}
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
  controls: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  controlButton: {
    flex: 1,
  },
  resultsText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    color: colors.textLight,
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
    color: colors.textLight,
  },
  matchCard: {
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchTitleContainer: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  matchCompany: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  matchLocation: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  matchScoreContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  matchScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  matchScoreLabel: {
    fontSize: 12,
    color: colors.primary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: {
    fontSize: 12,
    color: colors.textLight,
  },
  matchReason: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  applyButton: {
    marginTop: 8,
  },
});