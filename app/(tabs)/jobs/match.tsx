import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJobsStore } from "@/stores/jobs-store";
import { JobMatchForm } from "@/components/jobs/JobMatchForm";
import { colors } from "@/constants/colors";
import { FileText, Search } from "lucide-react-native";

export default function JobMatchScreen() {
  const { runJobMatch, isLoading, error } = useJobsStore();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (resumeText: string, filters?: { 
    role?: string; 
    location?: string; 
    autoApply?: boolean; 
    generateCoverLetter?: boolean 
  }) => {
    try {
      setSubmitted(true);
      await runJobMatch({
        resumeText,
        role: filters?.role,
        location: filters?.location,
        autoApply: filters?.autoApply,
        generateCoverLetter: filters?.generateCoverLetter
      });
      
      // Navigate to matches screen after successful submission
      router.push('/jobs/matches');
    } catch (err) {
      console.error('Error running job match:', err);
      Alert.alert(
        'Error',
        'Failed to find matching jobs. Please try again later.',
        [{ text: 'OK' }]
      );
      setSubmitted(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Find Matching Jobs',
        headerTitleStyle: { fontWeight: '600' }
      }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Match Your Resume to Jobs</Text>
          <Text style={styles.subtitle}>
            Upload your resume and let AI find the best job matches for you
          </Text>
        </View>
        
        {!submitted && (
          <JobMatchForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Finding your perfect job matches...</Text>
          </View>
        )}
        
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Search size={24} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>AI-Powered Job Matching</Text>
            <Text style={styles.infoText}>
              Our advanced AI analyzes your resume and finds jobs that match your skills and experience.
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <FileText size={24} color={colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Custom Cover Letters</Text>
            <Text style={styles.infoText}>
              Generate tailored cover letters for each job application to increase your chances of getting hired.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  infoSection: {
    padding: 16,
    paddingTop: 8,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoIcon: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});