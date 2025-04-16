import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { AlertCircle, Shield } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  allowRecruiter?: boolean;
}

export function AdminProtectedRoute({ children, allowRecruiter = true }: AdminProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const hasNavigated = useRef(false);
  const hasCheckedAuth = useRef(false);
  const navigationState = useRootNavigationState();
  const [localLoading, setLocalLoading] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Determine if user has admin access
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isRecruiter = user?.role === 'recruiter';
  const hasAccess = isAdmin || (allowRecruiter && isRecruiter);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLoading) {
        console.log('Admin auth check timeout - forcing completion');
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
        router.replace('/admin/login');
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    // We don't need to navigate if the user is authenticated but not admin
    // We'll show the forbidden message below
  }, [isAuthenticated, authCheckComplete, navigationState?.key]);

  // Show loading state
  if (localLoading || !navigationState?.key) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Verifying admin access...</Text>
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
          Please sign in to access the admin area.
        </Text>
        <Button
          title="Go to Admin Login"
          onPress={() => {
            if (!hasNavigated.current && navigationState?.key) {
              hasNavigated.current = true;
              router.replace('/admin/login');
            }
          }}
          style={styles.loginButton}
        />
      </View>
    );
  }

  // Show forbidden message if authenticated but not admin or recruiter (if allowed)
  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <Shield size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Admin Access Required</Text>
        <Text style={styles.errorText}>
          You don't have permission to access this area.
          Only administrators can view this content.
        </Text>
        <Button
          title="Go to Home"
          onPress={() => {
            if (!hasNavigated.current && navigationState?.key) {
              hasNavigated.current = true;
              router.replace('/');
            }
          }}
          style={styles.loginButton}
        />
      </View>
    );
  }

  // If authenticated and admin/recruiter, render children
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