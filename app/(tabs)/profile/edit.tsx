import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { UserCog, Save, AtSign, Briefcase, Hash, Phone, MapPin, Globe } from 'lucide-react-native';
import { TextInput } from '@/components/TextInput';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/stores/auth-store';
import { UploadAvatar } from '@/components/profile/UploadAvatar';

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  
  const handleSave = async () => {
    try {
      if (!firstName.trim()) {
        Alert.alert('Error', 'First name is required');
        return;
      }
      
      if (!email.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }
      
      // Parse skills from comma-separated string to array
      const skillsArray = skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0);
      
      await updateProfile({
        firstName,
        lastName,
        email,
        jobTitle,
        bio,
        phone,
        location,
        website,
        skills: skillsArray,
      });
      
      Alert.alert(
        'Success', 
        'Your profile has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  
  return (
    <UserProtectedRoute>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your account information</Text>
        </View>
        
        <Card style={styles.card}>
          <UploadAvatar />
          
          <View style={styles.form}>
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              leftIcon={<AtSign size={20} color={colors.textSecondary} />}
              style={styles.input}
            />
            
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              leftIcon={<AtSign size={20} color={colors.textSecondary} />}
              style={styles.input}
            />
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              leftIcon={<AtSign size={20} color={colors.textSecondary} />}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              leftIcon={<Phone size={20} color={colors.textSecondary} />}
              style={styles.input}
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              leftIcon={<MapPin size={20} color={colors.textSecondary} />}
              style={styles.input}
            />
            
            <TextInput
              label="Website"
              value={website}
              onChangeText={setWebsite}
              placeholder="https://yourwebsite.com"
              leftIcon={<Globe size={20} color={colors.textSecondary} />}
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Job Title"
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="e.g. Senior Developer"
              leftIcon={<Briefcase size={20} color={colors.textSecondary} />}
              style={styles.input}
            />
            
            <TextInput
              label="Skills"
              value={skills}
              onChangeText={setSkills}
              placeholder="e.g. React, JavaScript, UI Design"
              leftIcon={<Hash size={20} color={colors.textSecondary} />}
              style={styles.input}
              helperText="Separate skills with commas"
            />
            
            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextArea
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                style={styles.textArea}
              />
              <Text style={styles.helperText}>Brief description for your public profile</Text>
            </View>
            
            <Button
              title="Save Changes"
              onPress={handleSave}
              disabled={isLoading}
              icon={<Save size={18} color={colors.white} />}
              iconPosition="left"
              style={styles.saveButton}
            />
            
            {isLoading && (
              <ActivityIndicator 
                size="small" 
                color={colors.primary} 
                style={styles.loader} 
              />
            )}
          </View>
        </Card>
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
  card: {
    margin: 16,
    padding: 16,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 0,
  },
  textAreaContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textArea: {
    height: 120,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  saveButton: {
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
    alignSelf: 'center',
  },
})