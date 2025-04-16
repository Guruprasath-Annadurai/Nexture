import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { colors } from '@/constants/colors';

interface SuperadminProtectedRouteProps {
  children: React.ReactNode;
}

export const SuperadminProtectedRoute = ({ children }: SuperadminProtectedRouteProps) => {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'superadmin') {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router]);
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (user?.role !== 'superadmin') {
    return null;
  }
  
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});