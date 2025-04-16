import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { Users, Briefcase, Bell, FileText, Shield, UserSearch, FileBarChart, Search } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';
import { Link } from 'expo-router';
import { User } from '@/types/users';

export default function AdminDashboardScreen() {
  const { user } = useAuthStore();
  // Derive these properties from the user's role
  const isSuperadmin = user?.role === 'superadmin';
  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin' || user?.role === 'superadmin';
  
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    applications: 0,
    notifications: 0
  });
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef<Animated.Value[]>([]).current;
  
  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        users: 124,
        jobs: 57,
        applications: 89,
        notifications: 12
      });
    }, 1000);
    
    // Simulate fetching users
    const userTimer = setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'Software Developer',
          matchScore: 85,
          skills: ['React', 'JavaScript', 'TypeScript'],
          photo: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
          id: '2',
          name: 'Sarah Smith',
          email: 'sarah.smith@example.com',
          role: 'UX Designer',
          matchScore: 92,
          skills: ['UI Design', 'Figma', 'User Research'],
          photo: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
          id: '3',
          name: 'Michael Johnson',
          email: 'michael.j@example.com',
          role: 'Product Manager',
          matchScore: 78,
          skills: ['Agile', 'Product Strategy', 'Roadmapping'],
          photo: 'https://randomuser.me/api/portraits/men/67.jpg'
        }
      ]);
    }, 1500);
    
    // Start the fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    return () => {
      clearTimeout(timer);
      clearTimeout(userTimer);
    };
  }, []);
  
  // Update animation values when users changes
  useEffect(() => {
    // Create animation values for each user
    cardAnims.length = 0;
    users.forEach(() => {
      cardAnims.push(new Animated.Value(0));
    });
    
    // Start staggered animations for user cards
    if (cardAnims.length > 0) {
      Animated.stagger(
        100,
        cardAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [users]);
  
  const filteredUsers = users.filter(user => {
    if (!filter) return true;
    
    const filterLower = filter.toLowerCase();
    return (
      user.name?.toLowerCase().includes(filterLower) ||
      user.email?.toLowerCase().includes(filterLower) ||
      user.role?.toLowerCase().includes(filterLower) ||
      user.skills?.some(skill => skill.toLowerCase().includes(filterLower))
    );
  });
  
  const viewUserProfile = (user: User) => {
    alert(`Viewing ${user.name}'s profile`);
    // In a real app, navigate to user profile
  };
  
  return (
    <AdminProtectedRoute>
      <ScrollView style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage your platform</Text>
          </View>
          
          {isSuperadmin && (
            <View style={styles.superadminSection}>
              <Card style={styles.superadminCard}>
                <View style={styles.superadminHeader}>
                  <Shield size={24} color={colors.warning} />
                  <Text style={styles.superadminTitle}>Superadmin Access</Text>
                </View>
                <Text style={styles.superadminDescription}>
                  You have elevated privileges to manage administrators and system settings.
                </Text>
                <Link href="/admin/manage-admins" asChild>
                  <TouchableOpacity style={styles.superadminButton}>
                    <Text style={styles.superadminButtonText}>Manage Administrators</Text>
                  </TouchableOpacity>
                </Link>
              </Card>
            </View>
          )}
          
          {isRecruiter && (
            <View style={styles.recruiterSection}>
              <Card style={styles.recruiterCard}>
                <View style={styles.recruiterHeader}>
                  <UserSearch size={24} color={colors.primary} />
                  <Text style={styles.recruiterTitle}>Recruiter Tools</Text>
                </View>
                <Text style={styles.recruiterDescription}>
                  Access specialized tools for candidate management and recruitment.
                </Text>
                <Link href="/admin/recruiter-dashboard" asChild>
                  <TouchableOpacity style={styles.recruiterButton}>
                    <Text style={styles.recruiterButtonText}>Go to Recruiter Dashboard</Text>
                  </TouchableOpacity>
                </Link>
              </Card>
            </View>
          )}
          
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Users size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats.users}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Briefcase size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats.jobs}</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <FileText size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Bell size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats.notifications}</Text>
              <Text style={styles.statLabel}>Notifications</Text>
            </Card>
          </View>
        </Animated.View>
        
        <View style={styles.candidateSection}>
          <Text style={styles.sectionTitle}>📋 Candidate Overview</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search by name, email, role or skill..."
              value={filter}
              onChangeText={setFilter}
              style={styles.searchInput}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          {filteredUsers.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No candidates found</Text>
              <Text style={styles.emptySubtext}>
                {filter ? 'Try adjusting your search criteria' : 'Candidates will appear here once added'}
              </Text>
            </Card>
          ) : (
            filteredUsers.map((user, index) => (
              <Animated.View 
                key={user.id}
                style={{
                  opacity: cardAnims[index] || fadeAnim,
                  transform: [{ 
                    translateY: (cardAnims[index] || fadeAnim).interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }}
              >
                <Card style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      {user.photo ? (
                        <View style={styles.avatarContainer}>
                          <Animated.Image
                            source={{ uri: user.photo }}
                            style={styles.avatar}
                          />
                        </View>
                      ) : (
                        <View style={[styles.avatarContainer, styles.avatarPlaceholder]}>
                          <Text style={styles.avatarText}>
                            {user.name?.charAt(0) || 'U'}
                          </Text>
                        </View>
                      )}
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user.name || 'Unnamed User'}</Text>
                        <Text style={styles.userRole}>{user.role}</Text>
                      </View>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>{user.matchScore || '-'}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.userContact}>
                    <Text style={styles.contactText}>📧 {user.email}</Text>
                  </View>
                  
                  {user.skills && user.skills.length > 0 && (
                    <View style={styles.skillsContainer}>
                      <Text style={styles.skillsLabel}>Skills:</Text>
                      <View style={styles.skillsList}>
                        {user.skills.map((skill: string, skillIndex: number) => (
                          <View key={skillIndex} style={styles.skillBadge}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.viewProfileButton}
                    onPress={() => viewUserProfile(user)}
                  >
                    <Text style={styles.viewProfileText}>View Profile</Text>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            ))
          )}
        </View>
        
        <View style={styles.quickLinksSection}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksContainer}>
            <Link href="/admin/users" asChild>
              <TouchableOpacity style={styles.quickLinkCard}>
                <Users size={24} color={colors.primary} />
                <Text style={styles.quickLinkText}>Manage Users</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/admin/jobs" asChild>
              <TouchableOpacity style={styles.quickLinkCard}>
                <Briefcase size={24} color={colors.primary} />
                <Text style={styles.quickLinkText}>Manage Jobs</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/admin/applications" asChild>
              <TouchableOpacity style={styles.quickLinkCard}>
                <FileText size={24} color={colors.primary} />
                <Text style={styles.quickLinkText}>Applications</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/admin/report-tracking" asChild>
              <TouchableOpacity style={styles.quickLinkCard}>
                <FileBarChart size={24} color={colors.primary} />
                <Text style={styles.quickLinkText}>Report Tracking</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.bold}>John Doe</Text> applied for <Text style={styles.bold}>Senior Developer</Text>
                </Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.bold}>New job</Text> posted: <Text style={styles.bold}>UX Designer</Text>
                </Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.bold}>Sarah Smith</Text> registered as a new user
                </Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.bold}>System</Text> sent 15 job match notifications
                </Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
          </Card>
        </View>
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
  superadminSection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  superadminCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warning + '40', // Adding transparency
  },
  superadminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  superadminTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 8,
  },
  superadminDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  superadminButton: {
    backgroundColor: colors.warning + '20', // Adding transparency
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  superadminButtonText: {
    color: colors.warning,
    fontWeight: '600',
  },
  recruiterSection: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
  },
  recruiterCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '40', // Adding transparency
  },
  recruiterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recruiterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  recruiterDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  recruiterButton: {
    backgroundColor: colors.primary + '20', // Adding transparency
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  recruiterButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    margin: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  candidateSection: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    fontSize: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  userContact: {
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: colors.text,
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  viewProfileButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewProfileText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  quickLinksSection: {
    padding: 16,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLinkCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  quickLinkText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  activityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
});