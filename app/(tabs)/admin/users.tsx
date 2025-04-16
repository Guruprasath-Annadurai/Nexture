import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { User, UserSearch, Shield, CheckCircle, X, Filter, Phone, Mail, Calendar } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { fetchAPI } from '@/services/api';

interface UserWithTwoFactor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
  lastActive?: string;
  photo?: string;
}

export default function AdminUsersScreen() {
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin' || user?.role === 'superadmin';
  const [users, setUsers] = useState<UserWithTwoFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  useEffect(() => {
    // Simulate fetching users
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For this demo, we'll use mock data
        setTimeout(() => {
          const mockUsers: UserWithTwoFactor[] = [
            {
              id: 'user1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '+12345678901',
              role: 'user',
              twoFactorEnabled: true,
              twoFactorVerified: true,
              lastActive: '2023-06-15T10:30:00Z',
              photo: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
              id: 'user2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              phone: '+12345678902',
              role: 'user',
              twoFactorEnabled: true,
              twoFactorVerified: false,
              lastActive: '2023-06-14T15:45:00Z',
              photo: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            {
              id: 'user3',
              name: 'Mike Johnson',
              email: 'mike.johnson@example.com',
              phone: '+12345678903',
              role: 'user',
              twoFactorEnabled: false,
              twoFactorVerified: false,
              lastActive: '2023-06-12T09:15:00Z',
              photo: 'https://randomuser.me/api/portraits/men/68.jpg'
            },
            {
              id: 'user4',
              name: 'Sarah Williams',
              email: 'sarah.williams@example.com',
              phone: '+12345678904',
              role: 'user',
              twoFactorEnabled: true,
              twoFactorVerified: true,
              lastActive: '2023-06-10T14:20:00Z',
              photo: 'https://randomuser.me/api/portraits/women/68.jpg'
            },
            {
              id: 'user5',
              name: 'David Brown',
              email: 'david.brown@example.com',
              phone: '+12345678905',
              role: 'user',
              twoFactorEnabled: false,
              twoFactorVerified: false,
              lastActive: '2023-06-08T11:05:00Z',
              photo: 'https://randomuser.me/api/portraits/men/44.jpg'
            }
          ];
          
          setUsers(mockUsers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const filteredUsers = users.filter(user => {
    if (filter === 'verified') {
      return user.twoFactorEnabled && user.twoFactorVerified;
    } else if (filter === 'unverified') {
      return user.twoFactorEnabled && !user.twoFactorVerified;
    }
    return true;
  });
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <AdminProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Users</Text>
          <Text style={styles.subtitle}>View and manage user accounts</Text>
        </View>
        
        {isRecruiter && (
          <Card style={styles.recruiterCard}>
            <View style={styles.cardContent}>
              <UserSearch size={32} color={colors.primary} />
              <Text style={styles.cardTitle}>Recruiter Dashboard</Text>
              <Text style={styles.cardText}>
                Access specialized tools for candidate management and recruitment.
              </Text>
              <Link href="/admin/recruiter-dashboard" asChild>
                <TouchableOpacity style={styles.recruiterButton}>
                  <Text style={styles.recruiterButtonText}>Go to Recruiter Dashboard</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Card>
        )}
        
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <User size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Users Management</Text>
            </View>
            
            <View style={styles.filterContainer}>
              <Filter size={16} color={colors.textSecondary} />
              <Text style={styles.filterLabel}>Filter:</Text>
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'verified' && styles.filterButtonActive]}
                onPress={() => setFilter('verified')}
              >
                <Text style={[styles.filterButtonText, filter === 'verified' && styles.filterButtonTextActive]}>
                  2FA Verified
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'unverified' && styles.filterButtonActive]}
                onPress={() => setFilter('unverified')}
              >
                <Text style={[styles.filterButtonText, filter === 'unverified' && styles.filterButtonTextActive]}>
                  2FA Pending
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found matching the selected filter.</Text>
            </View>
          ) : (
            <View style={styles.usersContainer}>
              {filteredUsers.map(user => (
                <View key={user.id} style={styles.userItem}>
                  <View style={styles.userHeader}>
                    {user.photo ? (
                      <Image source={{ uri: user.photo }} style={styles.userAvatar} />
                    ) : (
                      <View style={styles.userAvatarPlaceholder}>
                        <Text style={styles.userAvatarPlaceholderText}>
                          {user.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userRole}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                    </View>
                    <View style={styles.userStatus}>
                      {user.twoFactorEnabled ? (
                        user.twoFactorVerified ? (
                          <View style={styles.verifiedBadge}>
                            <CheckCircle size={16} color={colors.success} />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        ) : (
                          <View style={styles.pendingBadge}>
                            <Shield size={16} color={colors.warning} />
                            <Text style={styles.pendingText}>Pending</Text>
                          </View>
                        )
                      ) : (
                        <View style={styles.notEnabledBadge}>
                          <X size={16} color={colors.danger} />
                          <Text style={styles.notEnabledText}>Not Enabled</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.userDetails}>
                    <View style={styles.userDetailItem}>
                      <Mail size={16} color={colors.textSecondary} />
                      <Text style={styles.userDetailText}>{user.email}</Text>
                    </View>
                    
                    {user.phone && (
                      <View style={styles.userDetailItem}>
                        <Phone size={16} color={colors.textSecondary} />
                        <Text style={styles.userDetailText}>{user.phone}</Text>
                      </View>
                    )}
                    
                    {user.lastActive && (
                      <View style={styles.userDetailItem}>
                        <Calendar size={16} color={colors.textSecondary} />
                        <Text style={styles.userDetailText}>Last active: {formatDate(user.lastActive)}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.userActionButton}>
                      <Text style={styles.userActionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.userActionButton, styles.userActionButtonDanger]}>
                      <Text style={[styles.userActionButtonText, styles.userActionButtonTextDanger]}>Suspend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </AdminProtectedRoute>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  recruiterCard: {
    margin: 16,
    marginTop: 0,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  recruiterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  recruiterButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  usersContainer: {
    padding: 16,
  },
  userItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  userRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userStatus: {
    marginLeft: 'auto',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 4,
  },
  notEnabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  notEnabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 4,
  },
  userDetails: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userDetailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  userActions: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'flex-end',
    gap: 8,
  },
  userActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  userActionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  userActionButtonDanger: {
    borderColor: colors.danger,
  },
  userActionButtonTextDanger: {
    color: colors.danger,
  },
});