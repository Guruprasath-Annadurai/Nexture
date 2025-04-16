import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { ArrowLeft, FileText, Copy, CheckCircle } from 'lucide-react-native';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/Button';
import { ModelSelector } from '@/components/ai/ModelSelector';
import { useAIStore } from '@/stores/ai-store';
import { generateCareerSummary } from '@/services/ai-service';
import { CareerSummaryResult } from '@/types/ai';
import { useResumeStore } from '@/stores/resume-store';
import * as Clipboard from 'expo-clipboard';

export default function CareerSummaryScreen() {
  const { selectedModel } = useAIStore();
  const { currentAnalysis } = useResumeStore();
  
  const [resumeText, setResumeText] = useState(
    currentAnalysis?.result?.resumeText || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<CareerSummaryResult | null>(null);

  const handleGenerateSummary = async () => {
    if (!resumeText) {
      // Show error or validation message
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateCareerSummary(resumeText, selectedModel);
      setSummaryResult(result);
    } catch (error) {
      console.error('Error generating career summary:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (summaryResult?.summary) {
      await Clipboard.setStringAsync(summaryResult.summary);
      // Show success message
      alert('Career summary copied to clipboard!');
    }
  };

  return (
    <UserProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Button
            title="Back"
            variant="outline"
            icon={<ArrowLeft size={18} color={colors.primary} />}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Career Summary Builder</Text>
        </View>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <TextArea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChangeText={setResumeText}
            style={styles.textArea}
          />
        </Card>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>AI Model</Text>
          <ModelSelector />
          
          <Button
            title="Generate Career Summary"
            onPress={handleGenerateSummary}
            loading={isLoading}
            style={styles.generateButton}
          />
        </Card>
        
        {isLoading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Creating your career summary...
            </Text>
          </Card>
        ) : summaryResult ? (
          <>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <FileText size={20} color={colors.primary} />
                <Text style={styles.resultTitle}>Your Career Summary</Text>
              </View>
              <Text style={styles.summaryText}>
                {summaryResult.summary}
              </Text>
              <Button
                title="Copy to Clipboard"
                icon={<Copy size={16} color="white" />}
                onPress={handleCopy}
                style={styles.copyButton}
              />
            </Card>
            
            <Card style={styles.highlightsCard}>
              <Text style={styles.highlightsTitle}>Key Highlights</Text>
              {summaryResult.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <CheckCircle size={16} color={colors.success} style={styles.highlightIcon} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </Card>
            
            <Card style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>How to Use Your Summary</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>1.</Text>
                <Text style={styles.tipText}>
                  Add this summary to the top of your resume as a professional profile
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>2.</Text>
                <Text style={styles.tipText}>
                  Use it as the opening paragraph in your LinkedIn profile
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>3.</Text>
                <Text style={styles.tipText}>
                  Adapt it for your cover letters to provide a consistent personal brand
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipNumber}>4.</Text>
                <Text style={styles.tipText}>
                  Customize it slightly for different job applications to emphasize relevant skills
                </Text>
              </View>
            </Card>
          </>
        ) : null}
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
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    padding: 16,
    paddingBottom: 0,
  },
  textArea: {
    margin: 16,
    marginTop: 0,
    height: 150,
  },
  generateButton: {
    margin: 16,
  },
  loadingCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  resultCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  copyButton: {
    marginTop: 8,
  },
  highlightsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    padding: 16,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    marginRight: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipNumber: {
    width: 20,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});