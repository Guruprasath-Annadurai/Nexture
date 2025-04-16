import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuperadminProtectedRoute } from '@/components/SuperadminProtectedRoute';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAPI } from '@/services/api';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { UserPlus, UserMinus, Shield, User, Users } from 'lucide-react-native';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
}

export default function ManageAdminsScreen() {
  const { user, token } = useAuthStore();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would be an API call
      const response = await fetchAPI<{ admins: AdminUser[] }>('/admin/list-admins');
      setAdmins(response.admins);
    } catch (err) {
      setError('Failed to load admin users. Please try again.');
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePromoteUser = async (email: string, role: 'admin' | 'superadmin') => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      await fetchAPI('/admin/promote', {
        method: 'POST',
        body: JSON.stringify({ email, role })
      });
      
      // Update the local state
      setAdmins(prev => 
        prev.map(admin => 
          admin.email === email ? { ...admin, role } : admin
        )
      );
      
      Alert.alert('Success', `User ${email} has been promoted to ${role}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to promote user. Please try again.');
      console.error('Error promoting user:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoteAdmin = async (email: string) => {
    // Don't allow demoting yourself
    if (email === user?.email) {
      Alert.alert('Error', 'You cannot demote yourself');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      await fetchAPI('/admin/demote', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      // Update the local state
      setAdmins(prev => 
        prev.map(admin => 
          admin.email === email ? { ...admin, role: 'user' } : admin
        )
      );
      
      Alert.alert('Success', `Admin ${email} has been demoted to user`);
    } catch (err) {
      Alert.alert('Error', 'Failed to demote admin. Please try again.');
      console.error('Error demoting admin:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmAction = (
    email: string, 
    action: 'promote' | 'demote', 
    newRole?: 'admin' | 'superadmin'
  ) => {
    let message = '';
    let confirmAction = () => {};
    
    if (action === 'promote') {
      message = `Are you sure you want to promote ${email} to ${newRole}?`;
      confirmAction = () => handlePromoteUser(email, newRole!);
    } else {
      message = `Are you sure you want to demote ${email} to regular user?`;
      confirmAction = () => handleDemoteAdmin(email);
    }
    
    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: confirmAction }
      ]
    );
  };
  
  const renderRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield size={20} color={colors.primary} />;
      case 'admin':
        return <UserPlus size={20} color={colors.success} />;
      default:
        return <User size={20} color={colors.textSecondary} />;
    }
  };
  
  const renderUserItem = ({ item }: { item: AdminUser }) => {
    return (
      <Card style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View style={styles.roleContainer}>
            {renderRoleIcon(item.role)}
            <Text style={[
              styles.roleText,
              item.role === 'superadmin' ? styles.superadminText : 
              item.role === 'admin' ? styles.adminText : styles.userText
            ]}>
              {item.role}
            </Text>
          </View>
        </View>
        
        {/* Don't show actions for current user */}
        {item.email !== user?.email && (
          <View style={styles.actionButtons}>
            {item.role !== 'admin' && (
              <Button
                title="Promote to Admin"
                onPress={() => confirmAction(item.email, 'promote', 'admin')}
                variant="outline"
                style={styles.actionButton}
                icon={<UserPlus size={16} color={colors.primary} />}
              />
            )}
            
            {item.role !== 'superadmin' && (
              <Button
                title="Promote to Superadmin"
                onPress={() => confirmAction(item.email, 'promote', 'superadmin')}
                variant="outline"
                style={styles.actionButton}
                icon={<Shield size={16} color={colors.primary} />}
              />
            )}
            
            {(item.role === 'admin' || item.role === 'superadmin') && (
              <Button
                title="Demote to User"
                onPress={() => confirmAction(item.email, 'demote')}
                variant="outline"
                style={[styles.actionButton, styles.demoteButton]}
                textStyle={styles.demoteButtonText}
                icon={<UserMinus size={16} color={colors.error} />}
              />
            )}
          </View>
        )}
      </Card>
    );
  };
  
  return (
    <SuperadminProtectedRoute>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen 
          options={{
            title: 'Manage Admins',
            headerBackTitle: 'Back',
          }}
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Users size={24} color={colors.primary} />
              <Text style={styles.title}>User Management</Text>
            </View>
            <Text style={styles.subtitle}>
              Promote users to admin or superadmin roles, or demote existing admins
            </Text>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                title="Try Again" 
                onPress={fetchAdmins} 
                style={styles.retryButton}
              />
            </View>
          ) : (
            <FlatList
              data={admins}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </SuperadminProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    width: 120,
  },
  listContent: {
    paddingBottom: 16,
  },
  userCard: {
    marginBottom: 16,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  superadminText: {
    color: colors.primary,
  },
  adminText: {
    color: colors.success,
  },
  userText: {
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: 150,
  },
  demoteButton: {
    borderColor: colors.error,
  },
  demoteButtonText: {
    color: colors.error,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});