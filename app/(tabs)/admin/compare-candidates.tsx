import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { fetchAPI } from '@/services/api';
import { CandidateComparison } from '@/types/jobs';
import { ArrowLeft, User, Mail, Calendar, Star, Check, X, BarChart, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';

export default function CompareCandidatesScreen() {
  const { candidateIds } = useLocalSearchParams<{ candidateIds: string }>();
  
  const [candidates, setCandidates] = useState<CandidateComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (candidateIds) {
      fetchCandidatesForComparison();
    } else {
      setError('No candidates selected for comparison');
      setLoading(false);
    }
  }, [candidateIds]);
  
  const fetchCandidatesForComparison = async () => {
    try {
      setLoading(true);
      
      const response = await fetchAPI<{ candidates: CandidateComparison[] }>(`/recruiter/compare-candidates?ids=${candidateIds}`);
      setCandidates(response.candidates);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates for comparison:', error);
      setError('Failed to fetch candidate data for comparison');
      setLoading(false);
    }
  };
  
  const scheduleGroupInterview = () => {
    if (candidates.length === 0) return;
    
    router.push({
      pathname: '/admin/schedule-interview',
      params: { candidateIds }
    });
  };
  
  const viewCandidateDetails = (candidateId: string) => {
    router.push(`/admin/candidate-details?id=${candidateId}`);
  };
  
  if (loading) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading candidates for comparison...</Text>
        </View>
      </AdminProtectedRoute>
    );
  }
  
  if (error) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </AdminProtectedRoute>
    );
  }
  
  if (candidates.length === 0) {
    return (
      <AdminProtectedRoute allowRecruiter={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No candidates found for comparison</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </AdminProtectedRoute>
    );
  }
  
  // Sort candidates by score (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => b.avgScore - a.avgScore);
  
  // Find the highest score for reference
  const highestScore = Math.max(...candidates.map(c => c.avgScore));
  
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
          <Text style={styles.headerTitle}>Candidate Comparison</Text>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <Button
            title="Schedule Group Interview"
            onPress={scheduleGroupInterview}
            icon={<Calendar size={20} color={colors.white} />}
            style={styles.actionButton}
          />
        </View>
        
        <ScrollView 
          horizontal 
          style={styles.comparisonScrollView}
          showsHorizontalScrollIndicator={true}
        >
          <View style={styles.comparisonTable}>
            {/* Header Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText}>Criteria</Text>
              </View>
              
              {sortedCandidates.map((candidate, index) => (
                <View key={candidate.id} style={styles.tableHeaderCell}>
                  <View style={styles.candidateHeaderContent}>
                    <View style={[
                      styles.rankBadge, 
                      index === 0 ? styles.rankBadgeFirst : (index === 1 ? styles.rankBadgeSecond : styles.rankBadgeOther)
                    ]}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => viewCandidateDetails(candidate.id)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Match Score Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Match Score</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-score`} style={styles.tableCell}>
                  <View style={styles.scoreContainer}>
                    <Text style={[
                      styles.scoreText,
                      candidate.avgScore === highestScore ? styles.highestScoreText : null
                    ]}>
                      {candidate.avgScore}%
                    </Text>
                    {candidate.avgScore === highestScore ? (
                      <Star size={16} color={colors.warning} style={styles.starIcon} />
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            
            {/* Experience Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Experience</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-exp`} style={styles.tableCell}>
                  <Text style={styles.tableCellText}>{candidate.yearsOfExperience} years</Text>
                </View>
              ))}
            </View>
            
            {/* Education Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Education</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-edu`} style={styles.tableCell}>
                  <Text style={styles.tableCellText}>{candidate.education}</Text>
                </View>
              ))}
            </View>
            
            {/* Skills Match Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Skills Match</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-skills`} style={styles.tableCell}>
                  <Text style={styles.tableCellText}>{candidate.skillsMatch}%</Text>
                </View>
              ))}
            </View>
            
            {/* Interview Performance Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Interview</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-interview`} style={styles.tableCell}>
                  {candidate.interviewScore ? (
                    <Text style={styles.tableCellText}>{candidate.interviewScore}/10</Text>
                  ) : (
                    <Text style={styles.pendingText}>Not interviewed</Text>
                  )}
                </View>
              ))}
            </View>
            
            {/* Availability Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Availability</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-avail`} style={styles.tableCell}>
                  <Text style={styles.tableCellText}>{candidate.availability || 'Unknown'}</Text>
                </View>
              ))}
            </View>
            
            {/* Salary Expectations Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableLabelCell}>
                <Text style={styles.tableLabelText}>Salary</Text>
              </View>
              
              {sortedCandidates.map((candidate) => (
                <View key={`${candidate.id}-salary`} style={styles.tableCell}>
                  <Text style={styles.tableCellText}>{candidate.salaryExpectation || 'Not specified'}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
  },
  comparisonScrollView: {
    paddingHorizontal: 16,
  },
  comparisonTable: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    padding: 16,
    width: 180,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  candidateHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rankBadgeFirst: {
    backgroundColor: colors.success,
  },
  rankBadgeSecond: {
    backgroundColor: colors.primary,
  },
  rankBadgeOther: {
    backgroundColor: colors.textSecondary,
  },
  rankText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewDetailsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  tableLabelCell: {
    padding: 16,
    width: 120,
    backgroundColor: colors.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tableLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tableCell: {
    padding: 16,
    width: 180,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: colors.text,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  highestScoreText: {
    color: colors.success,
  },
  starIcon: {
    marginLeft: 4,
  },
  pendingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});