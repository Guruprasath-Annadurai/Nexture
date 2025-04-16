import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useResumeStore } from '@/stores/resume-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Lightbulb, FileText, MessageSquare, FileEdit, UserRound } from 'lucide-react-native';

export default function ResumeResults() {
  const { currentAnalysis } = useResumeStore();
  
  // If no analysis is available, redirect to the resume assistant
  if (!currentAnalysis || !currentAnalysis.result) {
    router.replace('/resume-assistant');
    return null;
  }
  
  const { result } = currentAnalysis;
  
  const navigateToTool = (path: string) => {
    router.push(path);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back"
          variant="outline"
          icon={<ArrowLeft size={18} color={colors.primary} />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={styles.title}>Resume Analysis</Text>
      </View>
      
      <Card style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>Match Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{result.matchScore}%</Text>
          <View style={styles.scoreBar}>
            <View 
              style={[
                styles.scoreBarFill, 
                { width: `${result.matchScore}%` },
                result.matchScore < 40 ? styles.scoreBarLow : 
                result.matchScore < 70 ? styles.scoreBarMedium : 
                styles.scoreBarHigh
              ]} 
            />
          </View>
        </View>
        <Text style={styles.scoreDescription}>
          {result.matchScore >= 80 ? 'Excellent match!' : 
           result.matchScore >= 60 ? 'Good match' : 
           result.matchScore >= 40 ? 'Fair match' : 'Poor match'}
        </Text>
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Missing Keywords</Text>
        {result.missingKeywords.length === 0 ? (
          <Text style={styles.emptyMessage}>No missing keywords! Great job.</Text>
        ) : (
          <View style={styles.keywordsList}>
            {result.missingKeywords.map((keyword, index) => (
              <View key={index} style={styles.keywordItem}>
                <XCircle size={16} color={colors.error} style={styles.keywordIcon} />
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Strengths</Text>
        {result.strengths.map((strength, index) => (
          <View key={index} style={styles.listItem}>
            <CheckCircle2 size={16} color={colors.success} style={styles.listIcon} />
            <Text style={styles.listText}>{strength}</Text>
          </View>
        ))}
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
        {result.weaknesses.map((weakness, index) => (
          <View key={index} style={styles.listItem}>
            <AlertCircle size={16} color={colors.warning} style={styles.listIcon} />
            <Text style={styles.listText}>{weakness}</Text>
          </View>
        ))}
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Suggestions</Text>
        {result.suggestions.map((suggestion, index) => (
          <View key={index} style={styles.listItem}>
            <Lightbulb size={16} color={colors.primary} style={styles.listIcon} />
            <Text style={styles.listText}>{suggestion}</Text>
          </View>
        ))}
      </Card>
      
      {result.formattingIssues.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Formatting Issues</Text>
          {result.formattingIssues.map((issue, index) => (
            <View key={index} style={styles.listItem}>
              <FileText size={16} color={colors.textSecondary} style={styles.listIcon} />
              <Text style={styles.listText}>{issue}</Text>
            </View>
          ))}
        </Card>
      )}
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Assessment</Text>
        <Text style={styles.assessmentText}>{result.overallAssessment}</Text>
      </Card>
      
      <Card style={styles.toolsCard}>
        <Text style={styles.toolsTitle}>Next Steps</Text>
        <Text style={styles.toolsSubtitle}>Continue improving your job search with these tools:</Text>
        
        <View style={styles.toolsGrid}>
          <Button
            title="Interview Prep"
            icon={<MessageSquare size={18} color="white" />}
            onPress={() => navigateToTool('/resume-assistant/interview-prep')}
            style={styles.toolButton}
          />
          
          <Button
            title="Cover Letter"
            icon={<FileEdit size={18} color="white" />}
            onPress={() => navigateToTool('/resume-assistant/cover-letter')}
            style={styles.toolButton}
          />
          
          <Button
            title="Career Summary"
            icon={<UserRound size={18} color="white" />}
            onPress={() => navigateToTool('/resume-assistant/career-summary')}
            style={styles.toolButton}
          />
        </View>
      </Card>
      
      <View style={styles.actions}>
        <Button
          title="Back to Resume Assistant"
          onPress={() => router.replace('/resume-assistant')}
          style={styles.actionButton}
        />
        <Button
          title="Find Matching Jobs"
          variant="outline"
          onPress={() => router.replace('/jobs')}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
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
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  scoreCard: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scoreContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  scoreBarHigh: {
    backgroundColor: colors.success,
  },
  scoreBarMedium: {
    backgroundColor: colors.warning,
  },
  scoreBarLow: {
    backgroundColor: colors.error,
  },
  scoreDescription: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyMessage: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  keywordIcon: {
    marginRight: 6,
  },
  keywordText: {
    color: colors.text,
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  assessmentText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  toolsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  toolsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  toolsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  toolsGrid: {
    gap: 12,
  },
  toolButton: {
    marginBottom: 0,
  },
  actions: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});