import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

export function UserProtectedRoute({ children }: UserProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const hasNavigated = useRef(false);
  const hasCheckedAuth = useRef(false);
  const navigationState = useRootNavigationState();
  const [localLoading, setLocalLoading] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLoading) {
        console.log('Auth check timeout - forcing completion');
        setLocalLoading(false);
        setAuthCheckComplete(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [localLoading]);

  // Initial auth check - only run once
  useEffect(() => {
    const performAuthCheck = async () => {
      // Only check auth once
      if (hasCheckedAuth.current) return;
      
      hasCheckedAuth.current = true;
      
      try {
        // Only check auth if we're not already authenticated
        if (!isAuthenticated && !authCheckComplete) {
          await checkAuth();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLocalLoading(false);
        setAuthCheckComplete(true);
      }
    };

    performAuthCheck();
  }, [checkAuth, isAuthenticated, authCheckComplete]);

  // Navigation effect - only run when auth check is complete and navigation is ready
  useEffect(() => {
    // Only run this effect when:
    // 1. Navigation is ready (navigationState is defined AND ready)
    // 2. We know the auth state (auth check is complete)
    // 3. We haven't already navigated
    if (!navigationState?.key || !authCheckComplete || hasNavigated.current) return;
    
    if (!isAuthenticated) {
      hasNavigated.current = true;
      
      // Defer navigation to next tick to avoid navigation during render
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authCheckComplete, navigationState?.key]);

  // Show loading state
  if (localLoading || !navigationState?.key) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Verifying access...</Text>
      </View>
    );
  }

  // Show unauthorized message if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <AlertCircle size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Authentication Required</Text>
        <Text style={styles.errorText}>
          Please sign in to access this page.
        </Text>
        <Button
          title="Go to Login"
          onPress={() => {
            if (!hasNavigated.current && navigationState?.key) {
              hasNavigated.current = true;
              // Use setTimeout to defer navigation
              setTimeout(() => {
                router.replace('/login');
              }, 100);
            }
          }}
          style={styles.loginButton}
        />
      </View>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    minWidth: 200,
  },
});