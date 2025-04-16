import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { ArrowLeft, HelpCircle, Lightbulb, ListChecks, Building2, Clock } from 'lucide-react-native';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/Button';
import { ModelSelector } from '@/components/ai/ModelSelector';
import { useAIStore } from '@/stores/ai-store';
import { generateInterviewPrep, suggestInterviewDuration } from '@/services/ai-service';
import { InterviewPrepResult } from '@/types/ai';
import { useResumeStore } from '@/stores/resume-store';

export default function InterviewPrepScreen() {
  const { selectedModel } = useAIStore();
  const { currentAnalysis } = useResumeStore();
  
  const [jobDescription, setJobDescription] = useState(
    currentAnalysis?.jobDescription || ''
  );
  const [resumeText, setResumeText] = useState(
    currentAnalysis?.result?.resumeText || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<InterviewPrepResult | null>(null);
  const [suggestedDuration, setSuggestedDuration] = useState<number | null>(null);
  const [isDurationLoading, setIsDurationLoading] = useState(false);
  const [durationExplanation, setDurationExplanation] = useState<string | null>(null);

  const handleGeneratePrep = async () => {
    if (!resumeText || !jobDescription) {
      // Show error or validation message
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateInterviewPrep(resumeText, jobDescription, selectedModel);
      setPrepResult(result);
    } catch (error) {
      console.error('Error generating interview prep:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestDuration = async () => {
    if (!resumeText || !jobDescription) {
      // Show error or validation message
      return;
    }
    
    setIsDurationLoading(true);
    try {
      // Extract job title from the first line of job description
      const jobTitle = jobDescription.split('\n')[0] || 'the position';
      
      const duration = await suggestInterviewDuration(jobTitle, resumeText, selectedModel);
      setSuggestedDuration(duration);
      
      // Generate explanation based on duration
      let explanation = '';
      if (duration <= 15) {
        explanation = `A ${duration}-minute interview is suitable for initial screening of candidates for this role.`;
      } else if (duration <= 30) {
        explanation = `A ${duration}-minute interview provides enough time for standard questions while respecting everyone's schedule.`;
      } else if (duration <= 45) {
        explanation = `A ${duration}-minute interview allows time for in-depth technical questions and discussion of past experience.`;
      } else if (duration <= 60) {
        explanation = `A ${duration}-minute interview provides ample time for comprehensive evaluation including technical assessment and behavioral questions.`;
      } else {
        explanation = `A ${duration}-minute interview is recommended for this senior role, allowing for thorough technical evaluation and detailed discussion.`;
      }
      
      setDurationExplanation(explanation);
    } catch (error) {
      console.error('Error suggesting interview duration:', error);
      // Show error message
    } finally {
      setIsDurationLoading(false);
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
          <Text style={styles.title}>Interview Preparation</Text>
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
          
          <View style={styles.buttonContainer}>
            <Button
              title="Generate Interview Prep"
              onPress={handleGeneratePrep}
              loading={isLoading}
              style={styles.generateButton}
            />
            
            <Button
              title="Suggest Interview Duration"
              onPress={handleSuggestDuration}
              loading={isDurationLoading}
              variant="outline"
              icon={<Clock size={18} color={colors.primary} />}
              style={styles.durationButton}
            />
          </View>
          
          {suggestedDuration && (
            <View style={styles.durationResultContainer}>
              <Text style={styles.durationResultTitle}>
                Suggested Interview Duration:
              </Text>
              <Text style={styles.durationResult}>
                {suggestedDuration} minutes
              </Text>
              {durationExplanation && (
                <Text style={styles.durationExplanation}>
                  {durationExplanation}
                </Text>
              )}
            </View>
          )}
        </Card>
        
        {isLoading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Generating interview preparation...
            </Text>
          </Card>
        ) : prepResult ? (
          <>
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <HelpCircle size={20} color={colors.primary} />
                <Text style={styles.resultTitle}>Likely Interview Questions</Text>
              </View>
              {prepResult.questions.map((question, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemNumber}>{index + 1}.</Text>
                  <Text style={styles.listItemText}>{question}</Text>
                </View>
              ))}
            </Card>
            
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <ListChecks size={20} color={colors.primary} />
                <Text style={styles.resultTitle}>Technical Topics to Review</Text>
              </View>
              {prepResult.technicalTopics.map((topic, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemNumber}>•</Text>
                  <Text style={styles.listItemText}>{topic}</Text>
                </View>
              ))}
            </Card>
            
            <Card style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Lightbulb size={20} color={colors.primary} />
                <Text style={styles.resultTitle}>Preparation Tips</Text>
              </View>
              {prepResult.preparationTips.map((tip, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemNumber}>•</Text>
                  <Text style={styles.listItemText}>{tip}</Text>
                </View>
              ))}
            </Card>
            
            {prepResult.companyInsights && (
              <Card style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Building2 size={20} color={colors.primary} />
                  <Text style={styles.resultTitle}>Company Insights</Text>
                </View>
                {prepResult.companyInsights.map((insight, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemNumber}>•</Text>
                    <Text style={styles.listItemText}>{insight}</Text>
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
  buttonContainer: {
    margin: 16,
    gap: 12,
  },
  generateButton: {
    marginBottom: 0,
  },
  durationButton: {
    marginBottom: 0,
  },
  durationResultContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.primaryLight + '30',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  durationResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  durationResult: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  durationExplanation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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