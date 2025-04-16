import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Email report preferences types
export type EmailFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

export interface EmailReportPreferences {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  weeklyDigest: boolean;
  marketInsights: boolean;
  careerTips: boolean;
  frequency: EmailFrequency;
}

// Default preferences
const DEFAULT_PREFERENCES: EmailReportPreferences = {
  jobAlerts: true,
  applicationUpdates: true,
  weeklyDigest: true,
  marketInsights: false,
  careerTips: false,
  frequency: 'weekly',
};

// Storage key
const STORAGE_KEY = 'email_report_preferences';

// Service functions
export const emailReportService = {
  // Get user preferences
  getPreferences: async (): Promise<EmailReportPreferences> => {
    try {
      const storedPrefs = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedPrefs) {
        return JSON.parse(storedPrefs);
      }
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error getting email preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  // Save user preferences
  savePreferences: async (preferences: EmailReportPreferences): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      
      // In a real app, we would also send these preferences to the server
      if (Platform.OS !== 'web') {
        // Simulate API call to update server preferences
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving email preferences:', error);
      return false;
    }
  },

  // Unsubscribe from all emails
  unsubscribeAll: async (): Promise<boolean> => {
    try {
      const unsubscribedPrefs: EmailReportPreferences = {
        ...DEFAULT_PREFERENCES,
        jobAlerts: false,
        applicationUpdates: false,
        weeklyDigest: false,
        marketInsights: false,
        careerTips: false,
        frequency: 'never',
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unsubscribedPrefs));
      
      // In a real app, we would also send this to the server
      if (Platform.OS !== 'web') {
        // Simulate API call to update server preferences
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from emails:', error);
      return false;
    }
  },

  // Reset to default preferences
  resetToDefaults: async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      
      // In a real app, we would also send this to the server
      if (Platform.OS !== 'web') {
        // Simulate API call to update server preferences
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting email preferences:', error);
      return false;
    }
  },
};