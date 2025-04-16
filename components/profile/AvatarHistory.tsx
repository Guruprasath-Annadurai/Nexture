import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { History, RotateCcw } from 'lucide-react-native';

interface AvatarHistoryProps {
  history: string[];
  onRestore: (uri: string) => void;
}

export function AvatarHistory({ history, onRestore }: AvatarHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <History size={16} color={colors.textSecondary} />
        <Text style={styles.title}>Previous Avatars</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyList}
      >
        {history.map((uri, index) => (
          <View key={index} style={styles.historyItem}>
            <Image source={{ uri }} style={styles.historyImage} />
            <TouchableOpacity 
              style={styles.restoreButton}
              onPress={() => onRestore(uri)}
            >
              <RotateCcw size={14} color={colors.white} />
              <Text style={styles.restoreText}>Restore</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  historyList: {
    paddingBottom: 8,
    gap: 12,
  },
  historyItem: {
    alignItems: 'center',
    width: 80,
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  restoreText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});