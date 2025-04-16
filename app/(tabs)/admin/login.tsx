import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function AdminLoginRedirect() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  useEffect(() => {
    // If already authenticated as admin, go to admin dashboard
    if (isAuthenticated && isAdmin) {
      router.replace('/admin');
      return;
    }
    
    // Otherwise, redirect to the admin login page
    router.replace('/admin/login');
  }, [isAuthenticated, isAdmin]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirecting to admin login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});