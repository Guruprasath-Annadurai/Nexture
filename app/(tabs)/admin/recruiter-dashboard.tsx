import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Switch } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Search, UserCheck, Mail, Star, StarOff, Info, Calendar, Users, CheckCircle, BarChart, PieChart, TrendingUp } from 'lucide-react-native';
import { fetchAPI } from '@/services/api';
import { Candidate, RecruiterStats } from '@/types/jobs';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function RecruiterDashboardScreen() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState('');
  const [minScore, setMinScore] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetchAPI<{ candidates: Candidate[] }>(`/recruiter/candidates?skill=${skill}&minScore=${minScore}`);
      setCandidates(response.candidates);
      setFilteredCandidates(response.candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiterStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetchAPI<{ stats: RecruiterStats }>('/recruiter/stats');
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching recruiter stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const applyFilters = () => {
    fetchCandidates();
  };

  const resetFilters = () => {
    setSkill('');
    setMinScore('');
    fetchCandidates();
  };

  const shortlistCandidate = async (candidateId: string) => {
    try {
      await fetchAPI('/recruiter/shortlist', {
        method: 'POST',
        body: JSON.stringify({ userId: candidateId }),
      });
      
      // Update the local state to reflect the shortlisting
      setCandidates(prevCandidates => 
        prevCandidates.map(candidate => {
          if (candidate.id === candidateId) {
            const shortlistedBy = [...(candidate.shortlistedBy || [])];
            if (user && !shortlistedBy.includes(user.id)) {
              shortlistedBy.push(user.id);
            }
            return { ...candidate, shortlistedBy };
          }
          return candidate;
        })
      );
      
      setFilteredCandidates(prevCandidates => 
        prevCandidates.map(candidate => {
          if (candidate.id === candidateId) {
            const shortlistedBy = [...(candidate.shortlistedBy || [])];
            if (user && !shortlistedBy.includes(user.id)) {
              shortlistedBy.push(user.id);
            }
            return { ...candidate, shortlistedBy };
          }
          return candidate;
        })
      );
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
    }
  };

  const removeShortlist = async (candidateId: string) => {
    try {
      // In a real app, you would make an API call to remove the shortlist
      // For this demo, we'll just update the local state
      
      setCandidates(prevCandidates => 
        prevCandidates.map(candidate => {
          if (candidate.id === candidateId && user) {
            const shortlistedBy = (candidate.shortlistedBy || []).filter(id => id !== user.id);
            return { ...candidate, shortlistedBy };
          }
          return candidate;
        })
      );
      
      setFilteredCandidates(prevCandidates => 
        prevCandidates.map(candidate => {
          if (candidate.id === candidateId && user) {
            const shortlistedBy = (candidate.shortlistedBy || []).filter(id => id !== user.id);
            return { ...candidate, shortlistedBy };
          }
          return candidate;
        })
      );
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

  const viewCandidateDetails = (candidateId: string) => {
    router.push(`/admin/candidate-details?id=${candidateId}`);
  };

  const isShortlisted = (candidate: Candidate) => {
    return user && candidate.shortlistedBy?.includes(user.id);
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const scheduleGroupInterview = () => {
    if (selectedCandidates.length === 0) return;
    
    router.push({
      pathname: '/admin/schedule-interview',
      params: { candidateIds: selectedCandidates.join(',') }
    });
  };

  const scheduleInterview = (candidateId: string) => {
    router.push({
      pathname: '/admin/schedule-interview',
      params: { candidateId }
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Clear selections when turning off selection mode
      setSelectedCandidates([]);
    }
  };

  const compareSelectedCandidates = () => {
    if (selectedCandidates.length < 2) {
      alert('Please select at least 2 candidates to compare');
      return;
    }
    
    router.push({
      pathname: '/admin/compare-candidates',
      params: { candidateIds: selectedCandidates.join(',') }
    });
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    if (!showAnalytics && !stats) {
      fetchRecruiterStats();
    }
  };

  return (
    <AdminProtectedRoute allowRecruiter={true}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recruiter Dashboard</Text>
          <Text style={styles.subtitle}>Find and manage candidates</Text>
        </View>
        
        <View style={styles.analyticsToggleContainer}>
          <TouchableOpacity 
            style={styles.analyticsToggle}
            onPress={toggleAnalytics}
          >
            <BarChart size={20} color={colors.primary} />
            <Text style={styles.analyticsToggleText}>
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {showAnalytics && (
          <Card style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Recruiter Analytics</Text>
            
            {loadingStats ? (
              <View style={styles.statsLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.statsLoadingText}>Loading analytics...</Text>
              </View>
            ) : stats ? (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalScheduled}</Text>
                    <Text style={styles.statLabel}>Scheduled</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: colors.success }]}>{stats.accepted}</Text>
                    <Text style={styles.statLabel}>Accepted</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: colors.error }]}>{stats.declined}</Text>
                    <Text style={styles.statLabel}>Declined</Text>
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: colors.warning }]}>{stats.noResponse}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: colors.info }]}>{stats.rescheduled}</Text>
                    <Text style={styles.statLabel}>Rescheduled</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.acceptanceRate}%</Text>
                    <Text style={styles.statLabel}>Acceptance Rate</Text>
                  </View>
                </View>
                
                <View style={styles.chartSection}>
                  <Text style={styles.chartTitle}>Interviews by Method</Text>
                  <View style={styles.methodCharts}>
                    {stats.interviewsByMethod.map((item, index) => (
                      <View key={index} style={styles.methodItem}>
                        <View style={styles.methodBar}>
                          <View 
                            style={[
                              styles.methodBarFill, 
                              { 
                                width: `${(item.count / Math.max(...stats.interviewsByMethod.map(m => m.count))) * 100}%`,
                                backgroundColor: [colors.primary, colors.success, colors.info, colors.warning][index % 4]
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.methodLabel}>{item.method}</Text>
                        <Text style={styles.methodCount}>{item.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.noStatsText}>No analytics data available</Text>
            )}
          </Card>
        )}
        
        <Card style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filter Candidates</Text>
          
          <TextInput
            label="Skill"
            placeholder="e.g. React, Python, Java"
            value={skill}
            onChangeText={setSkill}
            leftIcon={<Search size={20} color={colors.textSecondary} />}
            containerStyle={styles.inputContainer}
          />
          
          <TextInput
            label="Minimum Match Score"
            placeholder="e.g. 70"
            value={minScore}
            onChangeText={setMinScore}
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
          
          <View style={styles.filterButtons}>
            <Button
              title="Apply Filters"
              onPress={applyFilters}
              style={styles.filterButton}
            />
            <Button
              title="Reset"
              onPress={resetFilters}
              variant="outline"
              style={styles.filterButton}
            />
          </View>
        </Card>
        
        <View style={styles.candidatesSection}>
          <View style={styles.candidatesHeader}>
            <Text style={styles.sectionTitle}>Candidates ({filteredCandidates.length})</Text>
            
            <View style={styles.selectionControls}>
              <View style={styles.selectionModeContainer}>
                <Text style={styles.selectionModeLabel}>Group Selection</Text>
                <Switch
                  value={selectionMode}
                  onValueChange={toggleSelectionMode}
                  trackColor={{ false: colors.border, true: colors.primary + '70' }}
                  thumbColor={selectionMode ? colors.primary : colors.card}
                />
              </View>
              
              {selectionMode && selectedCandidates.length > 0 && (
                <View style={styles.groupActionButtons}>
                  <TouchableOpacity 
                    style={styles.groupActionButton}
                    onPress={scheduleGroupInterview}
                  >
                    <Users size={16} color={colors.background} />
                    <Text style={styles.groupActionText}>Group Interview</Text>
                  </TouchableOpacity>
                  
                  {selectedCandidates.length >= 2 && (
                    <TouchableOpacity 
                      style={[styles.groupActionButton, { backgroundColor: colors.info }]}
                      onPress={compareSelectedCandidates}
                    >
                      <BarChart size={16} color={colors.background} />
                      <Text style={styles.groupActionText}>Compare</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading candidates...</Text>
            </View>
          ) : filteredCandidates.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No candidates found matching your criteria.</Text>
            </Card>
          ) : (
            filteredCandidates.map((candidate) => (
              <Card key={candidate.id} style={[
                styles.candidateCard,
                selectionMode && selectedCandidates.includes(candidate.id) && styles.selectedCard
              ]}>
                {selectionMode && (
                  <TouchableOpacity 
                    style={styles.selectionCheckbox}
                    onPress={() => toggleCandidateSelection(candidate.id)}
                  >
                    {selectedCandidates.includes(candidate.id) ? (
                      <CheckCircle size={24} color={colors.primary} />
                    ) : (
                      <View style={styles.uncheckedBox} />
                    )}
                  </TouchableOpacity>
                )}
                
                <View style={styles.candidateHeader}>
                  <View>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <Text style={styles.candidateEmail}>{candidate.email}</Text>
                    {candidate.timezone && (
                      <Text style={styles.candidateTimezone}>Timezone: {candidate.timezone}</Text>
                    )}
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Match</Text>
                    <Text style={styles.scoreValue}>{candidate.avgScore}%</Text>
                  </View>
                </View>
                
                <View style={styles.candidateDetails}>
                  <Text style={styles.detailLabel}>Applications:</Text>
                  <Text style={styles.detailValue}>{candidate.applications}</Text>
                </View>
                
                <View style={styles.candidateDetails}>
                  <Text style={styles.detailLabel}>Skills:</Text>
                  <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                    {candidate.skillsText.split(' ').join(', ')}
                  </Text>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => isShortlisted(candidate) ? removeShortlist(candidate.id) : shortlistCandidate(candidate.id)}
                  >
                    {isShortlisted(candidate) ? (
                      <StarOff size={20} color={colors.warning} />
                    ) : (
                      <Star size={20} color={colors.warning} />
                    )}
                    <Text style={styles.actionButtonText}>
                      {isShortlisted(candidate) ? 'Remove' : 'Shortlist'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => scheduleInterview(candidate.id)}
                  >
                    <Calendar size={20} color={colors.success} />
                    <Text style={styles.actionButtonText}>Interview</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => contactCandidate(candidate.email)}
                  >
                    <Mail size={20} color={colors.primary} />
                    <Text style={styles.actionButtonText}>Contact</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => viewCandidateDetails(candidate.id)}
                  >
                    <Info size={20} color={colors.text} />
                    <Text style={styles.actionButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </AdminProtectedRoute>
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
  analyticsToggleContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  analyticsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
  },
  analyticsToggleText: {
    marginLeft: 8,
    color: colors.primary,
    fontWeight: '600',
  },
  analyticsCard: {
    margin: 16,
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsLoadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  statsLoadingText: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chartSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  methodCharts: {
    marginTop: 8,
  },
  methodItem: {
    marginBottom: 12,
  },
  methodBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  methodBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  methodLabel: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  methodCount: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  noStatsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 16,
  },
  filterCard: {
    margin: 16,
    padding: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  candidatesSection: {
    padding: 16,
    paddingTop: 0,
  },
  candidatesHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  selectionControls: {
    marginBottom: 8,
  },
  selectionModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectionModeLabel: {
    fontSize: 16,
    color: colors.text,
  },
  groupActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  groupActionText: {
    color: colors.background,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  candidateCard: {
    marginBottom: 16,
    padding: 16,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectionCheckbox: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  uncheckedBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  candidateEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  candidateTimezone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  scoreContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  candidateDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    color: colors.text,
  },
});