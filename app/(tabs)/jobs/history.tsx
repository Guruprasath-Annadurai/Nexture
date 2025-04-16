import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, ActivityIndicator, Share, Platform, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Search, Calendar, Star, StarOff, FileText, Download, RefreshCw, SortAsc, SortDesc } from 'lucide-react-native';
import { fetchAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { JobMatchHistoryEntry, JobMatch } from '@/types/jobs';

export default function JobMatchHistory() {
  const { token } = useAuthStore();
  const [history, setHistory] = useState<JobMatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const historyAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    fetchHistory();

    // Start the fade-in animation for the header
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Update animation values when history changes
  useEffect(() => {
    // Create animation values for each history entry
    historyAnims.length = 0;
    history.forEach((_, index) => {
      historyAnims.push(new Animated.Value(0));
    });

    // Start staggered animations for history entries
    if (historyAnims.length > 0) {
      Animated.stagger(
        100,
        historyAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [history]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // In a real app, we would fetch this from the API
      // For this demo, we'll create mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockHistory: JobMatchHistoryEntry[] = [
        {
          id: '1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          resumeText: 'Experienced software developer with 5 years of experience in React Native, JavaScript, and TypeScript.',
          role: 'React Native Developer',
          location: 'New York, NY',
          ai: 'GPT-4',
          summary: 'Found 5 matching jobs with an average match score of 82%.',
          matches: [
            {
              id: 'job1',
              title: 'Senior React Native Developer',
              company: 'TechCorp',
              location: 'New York, NY',
              postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'open',
              type: 'full-time',
              score: 92,
              matchedSkills: ['React Native', 'JavaScript', 'TypeScript'],
              reason: 'Strong match for your React Native experience and TypeScript skills.',
              favorite: true,
              coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my interest in the Senior React Native Developer position at TechCorp. With 5 years of experience in mobile app development using React Native, JavaScript, and TypeScript, I believe I am well-qualified for this role.\n\nThrough my career, I have developed and deployed multiple cross-platform mobile applications, focusing on performance optimization and user experience. My expertise in TypeScript has allowed me to build type-safe, maintainable codebases that scale well with growing teams.\n\nI am excited about the opportunity to bring my skills to TechCorp and contribute to your innovative mobile solutions.\n\nThank you for considering my application.\n\nSincerely,\nDemo User'
            },
            {
              id: 'job2',
              title: 'Mobile Developer',
              company: 'AppWorks',
              location: 'Remote',
              postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'open',
              type: 'full-time',
              score: 85,
              matchedSkills: ['React Native', 'JavaScript'],
              reason: 'Good match for your mobile development skills, but TypeScript not required.',
              favorite: false
            },
            {
              id: 'job3',
              title: 'Frontend Engineer',
              company: 'WebSolutions',
              location: 'New York, NY',
              postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'open',
              type: 'full-time',
              score: 78,
              matchedSkills: ['JavaScript', 'TypeScript'],
              reason: 'Matches your JavaScript and TypeScript skills, but less focus on mobile development.',
              favorite: false
            }
          ]
        },
        {
          id: '2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          resumeText: 'Full-stack developer with experience in React, Node.js, and MongoDB.',
          role: 'Full Stack Developer',
          location: 'San Francisco, CA',
          ai: 'GPT-4',
          summary: 'Found 4 matching jobs with an average match score of 75%.',
          matches: [
            {
              id: 'job4',
              title: 'Full Stack Engineer',
              company: 'TechStartup',
              location: 'San Francisco, CA',
              postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'open',
              type: 'full-time',
              score: 88,
              matchedSkills: ['React', 'Node.js', 'MongoDB'],
              reason: 'Excellent match for your full-stack development skills.',
              favorite: true
            },
            {
              id: 'job5',
              title: 'Backend Developer',
              company: 'DataSystems',
              location: 'Remote',
              postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'open',
              type: 'contract',
              score: 72,
              matchedSkills: ['Node.js', 'MongoDB'],
              reason: 'Good match for your backend skills, but frontend experience not utilized.',
              favorite: false
            }
          ]
        }
      ];
      
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching job match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (entryIndex: number, matchIndex: number) => {
    try {
      const updatedHistory = [...history];
      const match = updatedHistory[entryIndex].matches[matchIndex];
      match.favorite = !match.favorite;
      setHistory(updatedHistory);
      
      // In a real app, we would update this via API
      // For this demo, we'll just update the local state
      console.log(`Toggled favorite for job ${match.id} to ${match.favorite}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const reRunMatch = async (entry: JobMatchHistoryEntry) => {
    try {
      // In a real app, we would call an API to re-run the job match
      // For this demo, we'll just show a success message
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Job matching re-run with updated resume!');
    } catch (error) {
      console.error('Error re-running job match:', error);
      alert('Failed to re-run job match. Please try again.');
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      // Create CSV content
      const csvRows = ['Date,Job Title,Company,Score,Reason'];
      history.forEach(entry => {
        entry.matches.forEach(match => {
          csvRows.push(`"${new Date(entry.date).toLocaleString()}","${match.title}","${match.company}",${match.score},"${match.reason}"`);
        });
      });
      const csvContent = csvRows.join('\n');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Share the CSV content
      try {
        if (Platform.OS === 'web') {
          alert('CSV export initiated. This would download a file in a real app.');
        } else {
          await Share.share({
            message: csvContent,
            title: 'Job Match History CSV'
          });
        }
      } catch (error) {
        console.error('Error sharing CSV:', error);
        alert('Failed to share CSV. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setExportLoading(true);
      
      // In a real app, we would call an API to generate and download a PDF
      // For this demo, we'll just simulate the process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (Platform.OS === 'web') {
        alert('PDF download initiated. Check your downloads folder.');
      } else {
        try {
          await Share.share({
            title: 'Job Match History Report',
            message: 'Your Job Match History Report is ready. This would be a PDF file in a real app.'
          });
        } catch (error) {
          console.error('Error sharing PDF:', error);
          alert('Failed to share PDF. Please try again.');
        }
      }
      
      // Track the download
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Download tracked');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredHistory = history.filter(entry => {
    if (!filter) return true;
    
    const filterLower = filter.toLowerCase();
    
    // Check if any job title or company matches the filter
    return entry.matches.some(match => 
      match.title.toLowerCase().includes(filterLower) || 
      match.company.toLowerCase().includes(filterLower)
    );
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by highest score in each entry
      const scoreA = Math.max(...a.matches.map(m => m.score));
      const scoreB = Math.max(...b.matches.map(m => m.score));
      return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    }
  });

  const toggleSort = (field: 'date' | 'score') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending when changing sort field
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

  const viewCoverLetter = (coverLetter: string, jobTitle: string) => {
    setModalTitle(`Cover Letter for ${jobTitle}`);
    setModalText(coverLetter);
    setModalVisible(true);
  };

  return (
    <UserProtectedRoute>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: 'Job Match History' }} />
        
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.title}>📂 Job Match History</Text>
            <Text style={styles.subtitle}>Review your past job matches and results</Text>
          </View>
          
          <Card style={styles.filterCard}>
            <View style={styles.searchContainer}>
              <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                placeholder="Filter by job title or company..."
                value={filter}
                onChangeText={setFilter}
                style={styles.searchInput}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.sortButtons}>
              <TouchableOpacity 
                style={[
                  styles.sortButton, 
                  sortBy === 'date' && styles.sortButtonActive
                ]}
                onPress={() => toggleSort('date')}
              >
                <Calendar size={16} color={sortBy === 'date' ? colors.white : colors.text} />
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'date' && styles.sortButtonTextActive
                ]}>
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sortButton, 
                  sortBy === 'score' && styles.sortButtonActive
                ]}
                onPress={() => toggleSort('score')}
              >
                <SortDesc size={16} color={sortBy === 'score' ? colors.white : colors.text} />
                <Text style={[
                  styles.sortButtonText,
                  sortBy === 'score' && styles.sortButtonTextActive
                ]}>
                  Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
          
          <View style={styles.exportButtons}>
            <Button
              title="Export CSV"
              onPress={exportToCSV}
              loading={exportLoading}
              icon={<Download size={18} color={colors.white} />}
              style={styles.exportButton}
            />
            
            <Button
              title="Download PDF Report"
              onPress={downloadPDF}
              loading={exportLoading}
              icon={<FileText size={18} color={colors.white} />}
              style={styles.exportButton}
            />
          </View>
        </Animated.View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading job match history...</Text>
          </View>
        ) : sortedHistory.length === 0 ? (
          <Card style={styles.emptyCard}>
            <FileText size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No job match history found</Text>
            <Text style={styles.emptySubtext}>
              {filter ? 'Try adjusting your filter criteria' : 'Your job match history will appear here'}
            </Text>
          </Card>
        ) : (
          sortedHistory.map((entry, entryIndex) => (
            <Animated.View 
              key={entry.id} 
              style={{ 
                opacity: historyAnims[entryIndex] || fadeAnim,
                transform: [{ 
                  translateY: (historyAnims[entryIndex] || fadeAnim).interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }}
            >
              <Card style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDate}>
                    <Calendar size={16} color={colors.primary} />
                    <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.rerunButton}
                    onPress={() => reRunMatch(entry)}
                  >
                    <RefreshCw size={14} color={colors.primary} />
                    <Text style={styles.rerunText}>Re-run</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.searchDetails}>
                  <Text style={styles.searchRole}>
                    <Text style={styles.searchLabel}>Role: </Text>
                    {entry.role}
                  </Text>
                  <Text style={styles.searchLocation}>
                    <Text style={styles.searchLabel}>Location: </Text>
                    {entry.location}
                  </Text>
                </View>
                
                <Text style={styles.aiSummary}>{entry.summary}</Text>
                
                <View style={styles.matchesContainer}>
                  {entry.matches.map((match, matchIndex) => (
                    <View 
                      key={match.id} 
                      style={[
                        styles.matchItem,
                        match.favorite && styles.favoriteMatch,
                        matchIndex < entry.matches.length - 1 && styles.matchItemBorder
                      ]}
                    >
                      <View style={styles.matchHeader}>
                        <View>
                          <Text style={styles.matchTitle}>{match.title}</Text>
                          <Text style={styles.matchCompany}>{match.company}</Text>
                        </View>
                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreText}>{match.score}%</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.matchReason}>{match.reason}</Text>
                      
                      <View style={styles.matchActions}>
                        <TouchableOpacity 
                          style={styles.favoriteButton}
                          onPress={() => toggleFavorite(entryIndex, matchIndex)}
                        >
                          {match.favorite ? (
                            <>
                              <StarOff size={16} color={colors.warning} />
                              <Text style={styles.favoriteButtonText}>Remove Favorite</Text>
                            </>
                          ) : (
                            <>
                              <Star size={16} color={colors.warning} />
                              <Text style={styles.favoriteButtonText}>Add to Favorites</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        
                        {match.coverLetter && (
                          <TouchableOpacity 
                            style={styles.coverLetterButton}
                            onPress={() => viewCoverLetter(match.coverLetter!, match.title)}
                          >
                            <FileText size={16} color={colors.primary} />
                            <Text style={styles.coverLetterText}>View Cover Letter</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            </Animated.View>
          ))
        )}
        
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.modalText}>{modalText}</Text>
              </ScrollView>
              
              <Button
                title="Close"
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </UserProtectedRoute>
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
  filterCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    fontSize: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  exportButton: {
    flex: 0.48,
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
    margin: 16,
    padding: 32,
    alignItems: 'center',
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
  historyCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  rerunButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rerunText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  searchDetails: {
    marginBottom: 8,
  },
  searchRole: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  searchLocation: {
    fontSize: 14,
    color: colors.text,
  },
  searchLabel: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  aiSummary: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.primary,
    marginBottom: 16,
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 8,
  },
  matchesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  matchItem: {
    paddingVertical: 12,
  },
  matchItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  favoriteMatch: {
    backgroundColor: colors.primaryLight,
    margin: -8,
    padding: 8,
    borderRadius: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  matchCompany: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  scoreText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  matchReason: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  favoriteButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  coverLetterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coverLetterText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  modalCloseButton: {
    marginTop: 8,
  },
});