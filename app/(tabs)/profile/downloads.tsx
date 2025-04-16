import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { colors } from '@/constants/colors';
import { FileText, Download, Trash2, Filter } from 'lucide-react-native';
import { format } from 'date-fns';

// Define the type for download items
interface DownloadItem {
  id: string;
  fileName: string;
  downloadDate: string;
  fileSize: string;
  fileType: string;
}

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [filteredDownloads, setFilteredDownloads] = useState<DownloadItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    // Fetch downloads - this would normally come from an API
    const mockDownloads: DownloadItem[] = [
      {
        id: '1',
        fileName: 'Resume_John_Doe_Frontend.pdf',
        downloadDate: '2023-05-15T10:30:00Z',
        fileSize: '2.4 MB',
        fileType: 'pdf'
      },
      {
        id: '2',
        fileName: 'Cover_Letter_Software_Engineer.docx',
        downloadDate: '2023-05-10T14:45:00Z',
        fileSize: '1.2 MB',
        fileType: 'docx'
      },
      {
        id: '3',
        fileName: 'Job_Applications_April_2023.xlsx',
        downloadDate: '2023-05-01T09:15:00Z',
        fileSize: '3.7 MB',
        fileType: 'xlsx'
      },
      {
        id: '4',
        fileName: 'Interview_Preparation_Notes.pdf',
        downloadDate: '2023-04-28T16:20:00Z',
        fileSize: '1.8 MB',
        fileType: 'pdf'
      },
      {
        id: '5',
        fileName: 'Salary_Negotiation_Guide.pdf',
        downloadDate: '2023-04-20T11:05:00Z',
        fileSize: '4.2 MB',
        fileType: 'pdf'
      }
    ];
    
    setDownloads(mockDownloads);
    setFilteredDownloads(mockDownloads);
  }, []);

  const filterDownloads = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredDownloads(downloads);
    } else {
      setFilteredDownloads(downloads.filter(item => item.fileType === filter));
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => {
    return (
      <Card style={styles.downloadCard}>
        <View style={styles.downloadHeader}>
          <View style={styles.fileIconContainer}>
            <FileText size={20} color={getFileTypeColor(item.fileType)} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.fileDetails}>
              {formatDate(item.downloadDate)} • {item.fileSize}
            </Text>
          </View>
        </View>
        
        <View style={styles.downloadActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={16} color={colors.primary} />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '#E74C3C';
      case 'docx': return '#3498DB';
      case 'xlsx': return '#2ECC71';
      default: return colors.textSecondary;
    }
  };

  return (
    <UserProtectedRoute>
      <View style={styles.container}>
        <Section title="Downloads" icon={<Download size={20} color={colors.primary} />}>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>
              <Filter size={16} color={colors.textSecondary} /> Filter:
            </Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
                onPress={() => filterDownloads('all')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'all' && styles.activeFilterText]}>
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'pdf' && styles.activeFilter]}
                onPress={() => filterDownloads('pdf')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'pdf' && styles.activeFilterText]}>
                  PDF
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'docx' && styles.activeFilter]}
                onPress={() => filterDownloads('docx')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'docx' && styles.activeFilterText]}>
                  DOCX
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, activeFilter === 'xlsx' && styles.activeFilter]}
                onPress={() => filterDownloads('xlsx')}
              >
                <Text style={[styles.filterButtonText, activeFilter === 'xlsx' && styles.activeFilterText]}>
                  XLSX
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {filteredDownloads.length > 0 ? (
            <FlatList
              data={filteredDownloads}
              renderItem={renderDownloadItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.downloadsList}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <FileText size={32} color={colors.primary} />
                <Text style={styles.emptyTitle}>No Downloads</Text>
                <Text style={styles.emptyText}>
                  You haven't downloaded any files yet. Your downloads will appear here.
                </Text>
              </View>
            </Card>
          )}
        </Section>
      </View>
    </UserProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  activeFilterText: {
    color: colors.white,
  },
  downloadsList: {
    paddingBottom: 16,
  },
  downloadCard: {
    marginBottom: 12,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  downloadActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  emptyCard: {
    marginTop: 16,
  },
  emptyContent: {
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});