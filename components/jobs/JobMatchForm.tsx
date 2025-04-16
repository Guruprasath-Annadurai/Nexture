import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { Search, MapPin, Briefcase, FileText, Upload, Zap } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { TextArea } from '@/components/TextArea';
import { TextInput } from '@/components/TextInput';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useUserStore } from '@/stores/user-store';

interface JobMatchFormProps {
  onSubmit: (resumeText: string, filters?: { role?: string; location?: string; autoApply?: boolean; generateCoverLetter?: boolean }) => void;
  isLoading?: boolean;
}

export function JobMatchForm({ onSubmit, isLoading = false }: JobMatchFormProps) {
  const { profile } = useUserStore();
  const [resumeText, setResumeText] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [autoApply, setAutoApply] = useState(false);
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false);

  // Auto-load resume from user profile
  useEffect(() => {
    if (profile?.resumeText) {
      setResumeText(profile.resumeText);
    }
  }, [profile?.resumeText]);

  const handleSubmit = () => {
    if (!resumeText.trim()) return;
    onSubmit(resumeText.trim(), {
      role: role.trim(),
      location: location.trim(),
      autoApply,
      generateCoverLetter
    });
  };

  const handleUseSavedResume = () => {
    if (profile?.resumeText) {
      setResumeText(profile.resumeText);
    }
  };

  const handleUploadResume = () => {
    // This would use expo-document-picker in a real implementation
    alert('File upload would be implemented here with expo-document-picker');
    // For demo purposes, set some sample text
    setResumeText("Sample resume text from uploaded file. This would be extracted from a PDF or DOCX file in a real implementation.");
  };

  return (
    <Card style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Upload or paste your resume, choose your favorite AI, and get job matches with reasons and suggestions. You can auto-apply too!
        </Text>
      </View>

      <View style={styles.resumeActions}>
        {profile?.resumeText && (
          <TouchableOpacity style={styles.resumeActionButton} onPress={handleUseSavedResume}>
            <FileText size={16} color={colors.primary} />
            <Text style={styles.resumeActionText}>Use My Saved Resume</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.resumeActionButton} onPress={handleUploadResume}>
          <Upload size={16} color={colors.primary} />
          <Text style={styles.resumeActionText}>Upload Resume File</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionLabel}>Or paste your resume text:</Text>
      
      <TextArea
        value={resumeText}
        onChangeText={setResumeText}
        placeholder="Paste your resume text here..."
        style={styles.textarea}
      />

      <View style={styles.filters}>
        <View style={styles.inputRow}>
          <Briefcase size={20} color={colors.textLight} />
          <TextInput
            value={role}
            onChangeText={setRole}
            placeholder="Desired role (optional)"
            style={styles.input}
          />
        </View>

        <View style={styles.inputRow}>
          <MapPin size={20} color={colors.textLight} />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Location (optional)"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <View style={styles.optionRow}>
          <Switch
            value={autoApply}
            onValueChange={setAutoApply}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={autoApply ? colors.primary : colors.backgroundLight}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Auto-apply to top matches</Text>
            <Text style={styles.optionSubtext}>Requires confirmation before sending</Text>
          </View>
        </View>
        
        <View style={styles.optionRow}>
          <Switch
            value={generateCoverLetter}
            onValueChange={setGenerateCoverLetter}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={generateCoverLetter ? colors.primary : colors.backgroundLight}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionText}>Generate custom cover letters</Text>
            <Text style={styles.optionSubtext}>AI will create tailored cover letters for each job</Text>
          </View>
        </View>
      </View>

      <Button
        title="Find Matching Jobs"
        onPress={handleSubmit}
        disabled={!resumeText.trim() || isLoading}
        loading={isLoading}
        style={styles.button}
        icon={<Search size={18} color={colors.white} />}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    gap: 16,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  resumeActionText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: -8,
  },
  textarea: {
    height: 120,
  },
  filters: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {
    marginLeft: 10,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  optionSubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
  button: {
    marginTop: 8,
  },
});