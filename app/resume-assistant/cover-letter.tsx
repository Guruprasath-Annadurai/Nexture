import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Share } from 'react-native';
import { router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { ArrowLeft, FileText, Copy, Share2, Lightbulb } from 'lucide-react-native';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/Button';
import { ModelSelector } from '@/components/ai/ModelSelector';
import { useAIStore } from '@/stores/ai-store';
import { generateCoverLetter } from '@/services/ai-service';
import { CoverLetterResult } from '@/types/ai';
import { useResumeStore } from '@/stores/resume-store';
import * as Clipboard from 'expo-clipboard';

export default function CoverLetterScreen() {
  const { selectedModel } = useAIStore();
  const { currentAnalysis } = useResumeStore();
  
  const [jobDescription, setJobDescription] = useState(
    currentAnalysis?.jobDescription || ''
  );
  const [resumeText, setResumeText] = useState(
    currentAnalysis?.result?.resumeText || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState<CoverLetterResult | null>(null);

  const handleGenerateCoverLetter = async () => {
    if (!resumeText || !jobDescription) {
      // Show error or validation message
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateCoverLetter(resumeText, jobDescription, selectedModel);
      setCoverLetterResult(result);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (coverLetterResult?.content) {
      await Clipboard.setStringAsync(coverLetterResult.content);
      // Show success message
      alert('Cover letter copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (coverLetterResult?.content) {
      try {
        await Share.share({
          message: coverLetterResult.content,
          title: 'My Cover Letter',
        });
      } catch (error) {
        console.error('Error sharing cover letter:', error);
      }
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
          <Text style={styles.title}>Cover Letter Generator</Text>
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
          <Text style={styles.sectionTitle}>Job Description</Text>
          <TextArea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChangeText={setJobDescription}
            style={styles.textArea}
          />
        </Card>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>AI Model</Text>
          <ModelSelector />
          
          <Button
            title="Generate Cover Letter"
            onPress={handleGenerateCoverLetter}
            loading={isLoading}
            style={styles.generateButton}
          />
        </Card>
        
        {isLoading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Crafting your cover letter...
            </Text>
          </Card>
        ) : coverLetterResult ? (
          <>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <FileText size={20} color={colors.primary} />
                <Text style={styles.resultTitle}>Your Cover Letter</Text>
              </View>
              <Text style={styles.coverLetterText}>
                {coverLetterResult.content}
              </Text>
              <View style={styles.actionButtons}>
                <Button
                  title="Copy"
                  icon={<Copy size={16} color="white" />}
                  onPress={handleCopy}
                  style={styles.actionButton}
                />
                <Button
                  title="Share"
                  icon={<Share2 size={16} color="white" />}
                  onPress={handleShare}
                  style={styles.actionButton}
                />
              </View>
            </Card>
            
            {coverLetterResult.suggestions && (
              <Card style={styles.suggestionsCard}>
                <View style={styles.resultHeader}>
                  <Lightbulb size={20} color={colors.primary} />
                  <Text style={styles.resultTitle}>Customization Tips</Text>
                </View>
                {coverLetterResult.suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemNumber}>•</Text>
                    <Text style={styles.listItemText}>{suggestion}</Text>
                  </View>
                ))}
              </Card>
            )}
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
    height: 120,
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
  coverLetterText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  suggestionsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  listItemNumber: {
    width: 20,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});