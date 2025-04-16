import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { FileText, Upload, Sparkles, MessageSquare, FileEdit, UserRound, Info } from 'lucide-react-native';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/Button';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useResumeStore } from '@/stores/resume-store';
import { ModelSelector } from '@/components/ai/ModelSelector';
import { useUserStore } from '@/stores/user-store';

export default function ResumeAssistantScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const [resumeText, setResumeText] = useState(profile.resumeText || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { analyzeResume } = useResumeStore();

  const handleSubmit = async () => {
    if (!resumeText || !jobDescription) {
      Alert.alert(
        "Missing Information",
        "Please provide both your resume and the job description to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await analyzeResume({
        fileName: 'manual-entry.txt',
        resumeText,
        jobDescription,
      });
      router.push('/resume-assistant/results');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      Alert.alert(
        "Analysis Failed",
        "We couldn't analyze your resume. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToTool = (path: string) => {
    router.push(path);
  };

  const handleUseSavedResume = () => {
    if (profile.resumeText) {
      setResumeText(profile.resumeText);
    } else {
      Alert.alert(
        "No Resume Found",
        "You don't have a saved resume. Please upload or paste your resume text.",
        [{ text: "OK" }]
      );
    }
  };

  const handleUploadResume = () => {
    // This would use expo-document-picker in a real implementation
    Alert.alert(
      "File Upload",
      "This feature would allow you to upload a PDF or DOCX resume file. We'd extract the text automatically.",
      [{ text: "OK" }]
    );
  };

  return (
    <UserProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Resume Assistant</Text>
          <Text style={styles.subtitle}>
            Upload your resume and paste the job description to get personalized feedback
          </Text>
        </View>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Info size={18} color={colors.primary} />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI analyzes your resume against the job description to provide tailored feedback, 
            suggest improvements, and highlight key skills to emphasize in your application.
          </Text>
        </Card>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Your Resume</Text>
          
          <View style={styles.resumeActions}>
            {profile.resumeText && (
              <TouchableOpacity 
                style={styles.resumeActionButton} 
                onPress={handleUseSavedResume}
              >
                <FileText size={16} color={colors.primary} />
                <Text style={styles.resumeActionText}>Use My Saved Resume</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.resumeActionButton} 
              onPress={handleUploadResume}
            >
              <Upload size={16} color={colors.primary} />
              <Text style={styles.resumeActionText}>Upload Resume File</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.uploadSubtitle}>PDF or DOCX format (we extract text automatically)</Text>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
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
        </Card>
        
        <Button
          title="Analyze Resume"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.analyzeButton}
        />
        
        <Text style={styles.toolsTitle}>AI Career Tools</Text>
        
        <View style={styles.toolsGrid}>
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => navigateToTool('/resume-assistant/interview-prep')}
          >
            <Card style={styles.toolCardInner}>
              <MessageSquare size={24} color={colors.primary} style={styles.toolIcon} />
              <Text style={styles.toolTitle}>Interview Prep</Text>
              <Text style={styles.toolDescription}>Get AI-powered interview questions and preparation tips</Text>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => navigateToTool('/resume-assistant/cover-letter')}
          >
            <Card style={styles.toolCardInner}>
              <FileEdit size={24} color={colors.primary} style={styles.toolIcon} />
              <Text style={styles.toolTitle}>Cover Letter</Text>
              <Text style={styles.toolDescription}>Generate a customized cover letter for your application</Text>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => navigateToTool('/resume-assistant/career-summary')}
          >
            <Card style={styles.toolCardInner}>
              <UserRound size={24} color={colors.primary} style={styles.toolIcon} />
              <Text style={styles.toolTitle}>Career Summary</Text>
              <Text style={styles.toolDescription}>Create a professional summary for your resume and LinkedIn</Text>
            </Card>
          </TouchableOpacity>
        </View>
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
  infoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.primaryLight + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  resumeActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  textArea: {
    height: 150,
  },
  analyzeButton: {
    margin: 16,
    marginBottom: 24,
  },
  toolsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    marginBottom: 32,
  },
  toolCard: {
    width: '50%',
    padding: 8,
  },
  toolCardInner: {
    padding: 16,
    alignItems: 'center',
    height: '100%',
  },
  toolIcon: {
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});