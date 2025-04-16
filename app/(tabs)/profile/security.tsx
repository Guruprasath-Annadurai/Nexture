import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Smartphone, QrCode } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/auth-store';
import { TwoFactorVerification } from '@/components/profile/TwoFactorVerification';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';

export default function SecurityScreen() {
  const { user, updateProfile, disableTwoFactor } = useAuthStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const toggleTwoFactor = async (value: boolean) => {
    if (value && !user?.twoFactorVerified) {
      // If enabling 2FA and not verified, show setup
      setShowTwoFactorSetup(true);
      return;
    }
    
    if (!value && user?.twoFactorEnabled) {
      // If disabling 2FA, confirm with the user
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              try {
                const success = await disableTwoFactor();
                if (success) {
                  setTwoFactorEnabled(false);
                  Alert.alert(
                    'Two-Factor Authentication Disabled',
                    'Two-factor authentication has been disabled for your account.'
                  );
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to disable two-factor authentication.');
              }
            }
          }
        ]
      );
      return;
    }
    
    try {
      // Update the user's 2FA preference
      await updateProfile({ twoFactorEnabled: value });
      setTwoFactorEnabled(value);
      
      Alert.alert(
        value ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
        value 
          ? 'Your account is now more secure with two-factor authentication.' 
          : 'Two-factor authentication has been disabled for your account.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update two-factor authentication settings.');
    }
  };
  
  const handleTwoFactorSuccess = async () => {
    try {
      // Update the user's 2FA status
      await updateProfile({ 
        twoFactorEnabled: true,
        twoFactorVerified: true
      });
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      
      Alert.alert(
        'Two-Factor Authentication Enabled',
        'Your account is now more secure with two-factor authentication.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to enable two-factor authentication.');
    }
  };
  
  return (
    <UserProtectedRoute>
      <Stack.Screen 
        options={{
          title: 'Security Settings',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Shield size={32} color={colors.primary} />
          <Text style={styles.title}>Security Settings</Text>
          <Text style={styles.subtitle}>Manage your account security preferences</Text>
        </View>
        
        {showTwoFactorSetup ? (
          <Card style={styles.card}>
            <TwoFactorVerification 
              email={user?.email || ''}
              phone={user?.phone}
              onSuccess={handleTwoFactorSuccess}
              onCancel={() => setShowTwoFactorSetup(false)}
            />
          </Card>
        ) : showPasswordForm ? (
          <Card style={styles.card}>
            <PasswordChangeForm 
              onSuccess={() => setShowPasswordForm(false)}
              onCancel={() => setShowPasswordForm(false)}
            />
          </Card>
        ) : (
          <>
            <Card style={styles.card}>
              <View style={styles.sectionHeader}>
                <Lock size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Account Access</Text>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingDescription}>
                    Update your password regularly to keep your account secure
                  </Text>
                </View>
                <Button 
                  title="Change" 
                  onPress={() => setShowPasswordForm(true)}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>
                    Add an extra layer of security to your account
                  </Text>
                  {twoFactorEnabled && (
                    <View style={styles.statusBadge}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.statusText, { color: colors.success }]}>
                        {user?.twoFactorVerified ? 'Enabled & Verified' : 'Setup in Progress'}
                      </Text>
                    </View>
                  )}
                  {user?.twoFactorVerified && (
                    <View style={styles.methodBadge}>
                      <QrCode size={14} color={colors.primary} />
                      <Text style={styles.methodText}>Authenticator App</Text>
                    </View>
                  )}
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={toggleTwoFactor}
                  trackColor={{ false: colors.disabled, true: colors.primary + '80' }}
                  thumbColor={twoFactorEnabled ? colors.primary : colors.white}
                />
              </View>
            </Card>
            
            <Card style={styles.card}>
              <View style={styles.sectionHeader}>
                <Smartphone size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Device Management</Text>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Active Sessions</Text>
                  <Text style={styles.settingDescription}>
                    View and manage devices where you're currently logged in
                  </Text>
                </View>
                <Button 
                  title="Manage" 
                  onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Sign Out All Devices</Text>
                  <Text style={styles.settingDescription}>
                    Log out from all devices except your current one
                  </Text>
                </View>
                <Button 
                  title="Sign Out" 
                  onPress={() => {
                    Alert.alert(
                      'Sign Out All Devices',
                      'Are you sure you want to sign out from all other devices?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Sign Out', 
                          style: 'destructive',
                          onPress: () => Alert.alert('Success', 'You have been signed out from all other devices.')
                        }
                      ]
                    );
                  }}
                  variant="outline"
                  style={[styles.actionButton, styles.dangerButton]}
                />
              </View>
            </Card>
            
            <Card style={styles.card}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={24} color={colors.warning} />
                <Text style={styles.sectionTitle}>Account Protection</Text>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Login Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when someone logs into your account
                  </Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={(value) => {
                    Alert.alert(
                      value ? 'Notifications Enabled' : 'Notifications Disabled',
                      value 
                        ? 'You will be notified of new login attempts.' 
                        : 'You will no longer be notified of new login attempts.'
                    );
                  }}
                  trackColor={{ false: colors.disabled, true: colors.primary + '80' }}
                  thumbColor={true ? colors.primary : colors.white}
                />
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Account Recovery</Text>
                  <Text style={styles.settingDescription}>
                    Set up recovery options in case you lose access to your account
                  </Text>
                </View>
                <Button 
                  title="Setup" 
                  onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </Card>
            
            <View style={styles.securityTips}>
              <Text style={styles.tipsTitle}>Security Tips</Text>
              <Text style={styles.tipItem}>• Use a strong, unique password for your account</Text>
              <Text style={styles.tipItem}>• Enable two-factor authentication for extra security</Text>
              <Text style={styles.tipItem}>• Never share your password or verification codes</Text>
              <Text style={styles.tipItem}>• Check your account activity regularly</Text>
            </View>
          </>
        )}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 4,
  },
  actionButton: {
    minWidth: 100,
  },
  dangerButton: {
    borderColor: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  securityTips: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
});