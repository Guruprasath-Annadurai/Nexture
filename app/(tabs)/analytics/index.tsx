import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { getApplicationAnalytics } from '@/services/analytics-service';
import { AnalyticsData } from '@/types/analytics';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { StatusPieChart } from '@/components/analytics/StatusPieChart';
import { SkillsBarChart } from '@/components/analytics/SkillsBarChart';
import { TimelineChart } from '@/components/analytics/TimelineChart';
import { MetricCard } from '@/components/analytics/MetricCard';
import { BarChart2, Calendar, Briefcase, Award, Clock, TrendingUp, Users, Building } from 'lucide-react-native';

export default function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getApplicationAnalytics(user.id);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      saved: colors.info,
      applied: colors.primary,
      submitted: colors.primary,
      pending: colors.warning,
      interview: colors.secondary,
      offered: colors.success,
      accepted: colors.success,
      rejected: colors.error
    };
    
    return statusColors[status] || colors.textSecondary;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <UserProtectedRoute>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Stack.Screen options={{ title: 'Analytics Dashboard' }} />
        
        <View style={styles.header}>
          <Text style={styles.title}>Job Application Analytics</Text>
          <Text style={styles.subtitle}>Track your job search progress</Text>
        </View>

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : analytics ? (
          <>
            {/* Summary Metrics */}
            <View style={styles.metricsContainer}>
              <MetricCard 
                title="Total Applications"
                value={analytics.totalApplications.toString()}
                icon={<Briefcase size={24} color={colors.primary} />}
                style={styles.metricCard}
              />
              
              <MetricCard 
                title="Pending"
                value={analytics.pendingApplications.toString()}
                icon={<Clock size={24} color={colors.warning} />}
                style={styles.metricCard}
              />
              
              <MetricCard 
                title="Success Rate"
                value={`${analytics.successRate}%`}
                icon={<Award size={24} color={colors.success} />}
                style={styles.metricCard}
              />
              
              <MetricCard 
                title="Avg Match Score"
                value={`${analytics.avgMatchScore}%`}
                icon={<TrendingUp size={24} color={colors.secondary} />}
                style={styles.metricCard}
              />
            </View>

            {/* Status Breakdown */}
            {analytics.applicationsByStatus.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <BarChart2 size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Application Status Breakdown</Text>
                </View>
                
                <StatusPieChart 
                  data={analytics.applicationsByStatus.map(item => ({
                    status: item.status,
                    count: item.count,
                    color: getStatusColor(item.status)
                  }))}
                />
                
                <View style={styles.legendContainer}>
                  {analytics.applicationsByStatus.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View 
                        style={[
                          styles.legendColor, 
                          { backgroundColor: getStatusColor(item.status) }
                        ]} 
                      />
                      <Text style={styles.legendText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)} ({item.count})
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Application Timeline */}
            {analytics.applicationTimeline.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Calendar size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Application Timeline</Text>
                </View>
                
                <TimelineChart 
                  data={analytics.applicationTimeline.map(item => ({
                    date: formatDate(item.date),
                    count: item.count
                  }))}
                />
              </Card>
            )}

            {/* Top Skills */}
            {analytics.topSkills.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Award size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Top Skills in Your Applications</Text>
                </View>
                
                <SkillsBarChart 
                  data={analytics.topSkills.slice(0, 5).map(item => ({
                    skill: item.skill,
                    count: item.count
                  }))}
                />
              </Card>
            )}

            {/* Companies Applied To */}
            {analytics.companiesAppliedTo.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Building size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Companies Applied To</Text>
                </View>
                
                <View style={styles.companiesContainer}>
                  {analytics.companiesAppliedTo.map((company, index) => (
                    <View key={index} style={styles.companyItem}>
                      <View style={styles.companyIcon}>
                        <Building size={16} color={colors.white} />
                      </View>
                      <Text style={styles.companyName}>{company}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Insights */}
            <Card style={styles.insightsCard}>
              <View style={styles.chartHeader}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.chartTitle}>Insights & Recommendations</Text>
              </View>
              
              <View style={styles.insightItem}>
                <Text style={styles.insightTitle}>Application Volume</Text>
                <Text style={styles.insightText}>
                  {analytics.totalApplications < 5 
                    ? "Consider increasing your application volume to improve your chances."
                    : analytics.totalApplications > 20
                      ? "Great job on submitting multiple applications! Focus on quality follow-ups."
                      : "You're maintaining a good application pace. Keep it up!"}
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <Text style={styles.insightTitle}>Success Rate</Text>
                <Text style={styles.insightText}>
                  {analytics.successRate < 10
                    ? "Your success rate is below average. Consider revising your resume or targeting more suitable positions."
                    : analytics.successRate > 25
                      ? "Your success rate is above average! Your application strategy is working well."
                      : "Your success rate is within the average range. Continue refining your approach."}
                </Text>
              </View>
              
              <View style={styles.insightItem}>
                <Text style={styles.insightTitle}>Skill Alignment</Text>
                <Text style={styles.insightText}>
                  {analytics.avgMatchScore < 60
                    ? "Your skills match score is low. Try targeting jobs that better align with your experience."
                    : analytics.avgMatchScore > 80
                      ? "Your skills are well-aligned with the positions you're applying for!"
                      : "Your skills match is decent. Consider highlighting relevant skills more prominently."}
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Application Data</Text>
            <Text style={styles.emptyText}>
              Start applying to jobs to see your analytics here. Your application data will help you track your job search progress.
            </Text>
          </Card>
        )}
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
  header: {
    padding: 16,
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
  errorCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.errorLight,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  metricCard: {
    width: '48%',
    marginBottom: 16,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  companiesContainer: {
    marginTop: 8,
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  companyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    color: colors.text,
  },
  insightsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    marginBottom: 24,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});