import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Mail, Bell, Clock, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { emailReportService, EmailReportPreferences, EmailFrequency } from '@/services/email-report-service';
import { useAuth } from '@/hooks/useAuth';

export default function EmailPreferencesScreen() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailReportPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await emailReportService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof EmailReportPreferences) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleFrequencyChange = (frequency: EmailFrequency) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      frequency,
    });
  };

  const handleSave = async () => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      const success = await emailReportService.savePreferences(preferences);
      
      if (success) {
        Alert.alert('Success', 'Your email preferences have been updated.');
      } else {
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    Alert.alert(
      'Unsubscribe from All Emails',
      'Are you sure you want to unsubscribe from all email notifications? You can change this later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsubscribe All',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const success = await emailReportService.unsubscribeAll();
              
              if (success) {
                const prefs = await emailReportService.getPreferences();
                setPreferences(prefs);
                Alert.alert('Success', 'You have been unsubscribed from all emails.');
              } else {
                Alert.alert('Error', 'Failed to update preferences. Please try again.');
              }
            } catch (error) {
              console.error('Error unsubscribing:', error);
              Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleResetDefaults = async () => {
    try {
      setSaving(true);
      const success = await emailReportService.resetToDefaults();
      
      if (success) {
        const prefs = await emailReportService.getPreferences();
        setPreferences(prefs);
        Alert.alert('Success', 'Your preferences have been reset to defaults.');
      } else {
        Alert.alert('Error', 'Failed to reset preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UserProtectedRoute>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your preferences...</Text>
        </View>
      </UserProtectedRoute>
    );
  }

  return (
    <UserProtectedRoute>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: 'Email Preferences' }} />
        
        <View style={styles.header}>
          <Mail size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Email Report Preferences</Text>
        </View>
        
        <Text style={styles.description}>
          Customize the types of emails you receive from us. Your email address is {user?.email}.
        </Text>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.preferenceLabel}>Job Alerts</Text>
            </View>
            <Switch
              value={preferences?.jobAlerts}
              onValueChange={() => handleToggle('jobAlerts')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={preferences?.jobAlerts ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.preferenceLabel}>Application Updates</Text>
            </View>
            <Switch
              value={preferences?.applicationUpdates}
              onValueChange={() => handleToggle('applicationUpdates')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={preferences?.applicationUpdates ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.preferenceLabel}>Weekly Digest</Text>
            </View>
            <Switch
              value={preferences?.weeklyDigest}
              onValueChange={() => handleToggle('weeklyDigest')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={preferences?.weeklyDigest ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.preferenceLabel}>Market Insights</Text>
            </View>
            <Switch
              value={preferences?.marketInsights}
              onValueChange={() => handleToggle('marketInsights')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={preferences?.marketInsights ? colors.primary : colors.textSecondary}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Bell size={20} color={colors.primary} />
              <Text style={styles.preferenceLabel}>Career Tips</Text>
            </View>
            <Switch
              value={preferences?.careerTips}
              onValueChange={() => handleToggle('careerTips')}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={preferences?.careerTips ? colors.primary : colors.textSecondary}
            />
          </View>
        </Card>
        
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Email Frequency</Text>
          
          <View style={styles.frequencyOptions}>
            <Button
              title="Daily"
              variant={preferences?.frequency === 'daily' ? 'filled' : 'outline'}
              onPress={() => handleFrequencyChange('daily')}
              style={styles.frequencyButton}
            />
            
            <Button
              title="Weekly"
              variant={preferences?.frequency === 'weekly' ? 'filled' : 'outline'}
              onPress={() => handleFrequencyChange('weekly')}
              style={styles.frequencyButton}
            />
            
            <Button
              title="Monthly"
              variant={preferences?.frequency === 'monthly' ? 'filled' : 'outline'}
              onPress={() => handleFrequencyChange('monthly')}
              style={styles.frequencyButton}
            />
            
            <Button
              title="Never"
              variant={preferences?.frequency === 'never' ? 'filled' : 'outline'}
              onPress={() => handleFrequencyChange('never')}
              style={styles.frequencyButton}
            />
          </View>
        </Card>
        
        <View style={styles.actions}>
          <Button
            title={saving ? "Saving..." : "Save Preferences"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
            icon={<Clock size={18} color={colors.white} />}
          />
          
          <View style={styles.secondaryActions}>
            <Button
              title="Reset to Defaults"
              variant="outline"
              onPress={handleResetDefaults}
              disabled={saving}
              style={styles.resetButton}
              icon={<RefreshCw size={18} color={colors.primary} />}
            />
            
            <Button
              title="Unsubscribe All"
              variant="outline"
              onPress={handleUnsubscribeAll}
              disabled={saving}
              style={[styles.resetButton, styles.unsubscribeButton]}
              icon={<AlertTriangle size={18} color={colors.error} />}
            />
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    margin: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
  },
  actions: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 16,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    flex: 1,
  },
  unsubscribeButton: {
    borderColor: colors.error,
  },
});