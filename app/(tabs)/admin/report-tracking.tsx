import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { FileText, Download, User, Mail, BarChart } from 'lucide-react-native';
import { fetchAPI } from '@/services/api';
import { DownloadLog, EmailReport, EmailReportStats } from '@/types/jobs';
import { Tabs } from '@/components/Tabs';

export default function AdminReportTracking() {
  const [activeTab, setActiveTab] = useState<'downloads' | 'emails'>('downloads');
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [emailReports, setEmailReports] = useState<EmailReport[]>([]);
  const [emailStats, setEmailStats] = useState<EmailReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'downloads') {
      fetchDownloadLogs();
    } else {
      fetchEmailReports();
    }
  }, [activeTab]);

  const fetchDownloadLogs = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI<{ logs: DownloadLog[] }>('/admin/download-logs');
      setDownloadLogs(response.logs);
      setError(null);
    } catch (err) {
      console.error('Error fetching download logs:', err);
      setError('Failed to load download logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailReports = async () => {
    try {
      setLoading(true);
      const reportsResponse = await fetchAPI<{ reports: EmailReport[] }>('/admin/email-reports');
      const statsResponse = await fetchAPI<{ stats: EmailReportStats }>('/admin/email-report-stats');
      
      setEmailReports(reportsResponse.reports);
      setEmailStats(statsResponse.stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching email reports:', err);
      setError('Failed to load email reports. Please try again later.');
    } finally {
      setLoading(false);
    }
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

  return (
    <AdminProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Tracking</Text>
          <Text style={styles.subtitle}>Monitor user report activity</Text>
        </View>

        <Tabs
          tabs={[
            { key: 'downloads', label: 'PDF Downloads', icon: <FileText size={16} color={colors.primary} /> },
            { key: 'emails', label: 'Email Reports', icon: <Mail size={16} color={colors.primary} /> }
          ]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as 'downloads' | 'emails')}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Loading {activeTab === 'downloads' ? 'download logs' : 'email reports'}...
            </Text>
          </View>
        ) : error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        ) : activeTab === 'downloads' ? (
          <RenderDownloadLogs logs={downloadLogs} formatDate={formatDate} />
        ) : (
          <RenderEmailReports reports={emailReports} stats={emailStats} formatDate={formatDate} />
        )}
      </ScrollView>
    </AdminProtectedRoute>
  );
}

interface RenderDownloadLogsProps {
  logs: DownloadLog[];
  formatDate: (date: string) => string;
}

function RenderDownloadLogs({ logs, formatDate }: RenderDownloadLogsProps) {
  if (logs.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <FileText size={48} color={colors.textSecondary} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>No downloads tracked yet</Text>
        <Text style={styles.emptySubtext}>
          Download logs will appear here when users export PDF reports
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.logsContainer}>
      <Card style={styles.statsCard}>
        <View style={styles.statItem}>
          <Download size={24} color={colors.primary} />
          <Text style={styles.statValue}>{logs.length}</Text>
          <Text style={styles.statLabel}>Total Downloads</Text>
        </View>
        
        <View style={styles.statItem}>
          <User size={24} color={colors.primary} />
          <Text style={styles.statValue}>
            {new Set(logs.map(log => log.userId)).size}
          </Text>
          <Text style={styles.statLabel}>Unique Users</Text>
        </View>
      </Card>

      {logs.map((log, index) => (
        <Card key={log.id || index} style={styles.logCard}>
          <View style={styles.logHeader}>
            <Image
              source={{ uri: log.userPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(log.userEmail.split('@')[0]) }}
              style={styles.avatar}
            />
            <View style={styles.logInfo}>
              <Text style={styles.userEmail}>{log.userEmail}</Text>
              <Text style={styles.logDate}>{formatDate(log.date)}</Text>
            </View>
          </View>
          <View style={styles.logDetails}>
            <View style={styles.logDetail}>
              <Text style={styles.logDetailLabel}>Download Count:</Text>
              <Text style={styles.logDetailValue}>{log.count}</Text>
            </View>
            {log.reportType && (
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>Report Type:</Text>
                <Text style={styles.logDetailValue}>{log.reportType}</Text>
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
}

interface RenderEmailReportsProps {
  reports: EmailReport[];
  stats: EmailReportStats | null;
  formatDate: (date: string) => string;
}

function RenderEmailReports({ reports, stats, formatDate }: RenderEmailReportsProps) {
  if (reports.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Mail size={48} color={colors.textSecondary} style={styles.emptyIcon} />
        <Text style={styles.emptyText}>No email reports sent yet</Text>
        <Text style={styles.emptySubtext}>
          Email report logs will appear here when weekly/monthly reports are sent
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.logsContainer}>
      {stats && (
        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Mail size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats.totalSent}</Text>
            <Text style={styles.statLabel}>Total Sent</Text>
          </View>
          
          <View style={styles.statItem}>
            <BarChart size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats.openRate}%</Text>
            <Text style={styles.statLabel}>Open Rate</Text>
          </View>
          
          <View style={styles.statItem}>
            <User size={24} color={colors.primary} />
            <Text style={styles.statValue}>
              {new Set(reports.map(report => report.userId)).size}
            </Text>
            <Text style={styles.statLabel}>Recipients</Text>
          </View>
        </Card>
      )}

      <Card style={styles.reportTypesCard}>
        <Text style={styles.sectionTitle}>Reports by Type</Text>
        {stats?.byReportType.map((item, index) => (
          <View key={index} style={styles.typeItem}>
            <View style={styles.typeBar}>
              <View 
                style={[
                  styles.typeBarFill, 
                  { 
                    width: `${(item.sent / Math.max(...stats.byReportType.map(t => t.sent))) * 100}%`,
                    backgroundColor: [colors.primary, colors.success, colors.info, colors.warning][index % 4]
                  }
                ]} 
              />
            </View>
            <View style={styles.typeDetails}>
              <Text style={styles.typeLabel}>{item.reportType}</Text>
              <Text style={styles.typeCount}>{item.sent} sent / {item.opened} opened</Text>
            </View>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Recent Email Reports</Text>
      {reports.map((report, index) => (
        <Card key={report.id || index} style={styles.logCard}>
          <View style={styles.logHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(report.status) }]} />
            <View style={styles.logInfo}>
              <Text style={styles.userEmail}>{report.userEmail}</Text>
              <Text style={styles.logDate}>{formatDate(report.sentDate)}</Text>
            </View>
          </View>
          <View style={styles.logDetails}>
            <View style={styles.logDetail}>
              <Text style={styles.logDetailLabel}>Report Type:</Text>
              <Text style={styles.logDetailValue}>{report.reportType}</Text>
            </View>
            <View style={styles.logDetail}>
              <Text style={styles.logDetailLabel}>Status:</Text>
              <Text style={[styles.logDetailValue, { color: getStatusColor(report.status) }]}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </Text>
            </View>
            {report.openedAt && (
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>Opened:</Text>
                <Text style={styles.logDetailValue}>{formatDate(report.openedAt)}</Text>
              </View>
            )}
            {report.clickedAt && (
              <View style={styles.logDetail}>
                <Text style={styles.logDetailLabel}>Clicked:</Text>
                <Text style={styles.logDetailValue}>{formatDate(report.clickedAt)}</Text>
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'sent':
      return colors.success;
    case 'failed':
      return colors.error;
    case 'pending':
      return colors.warning;
    default:
      return colors.textSecondary;
  }
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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
  emptyCard: {
    margin: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  logsContainer: {
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logCard: {
    marginBottom: 12,
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  logDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  logDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  reportTypesCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  typeItem: {
    marginBottom: 16,
  },
  typeBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  typeBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  typeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 14,
    color: colors.text,
  },
  typeCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});