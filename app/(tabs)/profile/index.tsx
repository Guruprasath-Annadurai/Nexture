import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { 
  User, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  Calendar, 
  Clock, 
  ChevronRight,
  Bell,
  Download,
  Shield,
  LogOut
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/auth-store';
import { Section } from '@/components/Section';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };
  
  // Generate a default avatar URL based on the user's name
  const getDefaultAvatarUrl = () => {
    const name = user?.name || user?.firstName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;
  };
  
  return (
    <UserProtectedRoute>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/profile/edit')}
              style={styles.editButton}
            >
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user?.avatar || user?.photo || getDefaultAvatarUrl() }}
              style={styles.avatar}
            />
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
              </Text>
              
              <Text style={styles.role}>
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'superadmin' ? 'Super Admin' : 
                 user?.role === 'recruiter' ? 'Recruiter' : 'User'}
              </Text>
              
              <View style={styles.joinedContainer}>
                <Calendar size={14} color={colors.textSecondary} />
                <Text style={styles.joinedText}>
                  Joined {formatDate(user?.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.lastActive}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.lastActiveText}>
              Last active: {getTimeAgo(user?.lastActive)}
            </Text>
          </View>
          
          <Button
            title="Edit Profile"
            onPress={() => router.push('/profile/edit')}
            icon={<Edit size={18} color={colors.white} />}
            iconPosition="left"
            style={styles.editProfileButton}
          />
        </Card>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <User size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>Contact Information</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Mail size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <MapPin size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{user?.location || 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Globe size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Website:</Text>
            <Text style={styles.infoValue}>{user?.website || 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Briefcase size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Job Title:</Text>
            <Text style={styles.infoValue}>{user?.jobTitle || 'Not provided'}</Text>
          </View>
        </Card>
        
        {user?.bio && (
          <Card style={styles.bioCard}>
            <View style={styles.infoHeader}>
              <User size={20} color={colors.primary} />
              <Text style={styles.infoTitle}>About Me</Text>
            </View>
            <Text style={styles.bioText}>{user.bio}</Text>
          </Card>
        )}
        
        {user?.skills && user.skills.length > 0 && (
          <Card style={styles.skillsCard}>
            <View style={styles.infoHeader}>
              <Briefcase size={20} color={colors.primary} />
              <Text style={styles.infoTitle}>Skills</Text>
            </View>
            <View style={styles.skillsContainer}>
              {user.skills.map((skill: string, index: number) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
        
        <View style={styles.tabsContainer}>
          <Section 
            title="⚙️ Account Settings"
            style={styles.section}
          >
            <View style={styles.tabContentContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/profile/edit')}
              >
                <View style={styles.menuItemLeft}>
                  <Edit size={20} color={colors.primary} />
                  <Text style={styles.menuItemText}>Edit Profile</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/profile/security')}
              >
                <View style={styles.menuItemLeft}>
                  <Shield size={20} color={colors.primary} />
                  <Text style={styles.menuItemText}>Security Settings</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/profile/notifications')}
              >
                <View style={styles.menuItemLeft}>
                  <Bell size={20} color={colors.primary} />
                  <Text style={styles.menuItemText}>Notification Preferences</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/profile/email-preferences')}
              >
                <View style={styles.menuItemLeft}>
                  <Mail size={20} color={colors.primary} />
                  <Text style={styles.menuItemText}>Email Preferences</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/profile/downloads')}
              >
                <View style={styles.menuItemLeft}>
                  <Download size={20} color={colors.primary} />
                  <Text style={styles.menuItemText}>Downloads & Reports</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Section>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          >
            <LogOut size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
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
  editButton: {
    marginRight: 16,
  },
  profileCard: {
    margin: 16,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary + '40',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  role: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  joinedText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  lastActive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  lastActiveText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  editProfileButton: {
    marginTop: 16,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
  bioCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  bioText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  skillsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  tabContentContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 8,
  },
})