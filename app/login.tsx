import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { Mail, Lock, AlertCircle, Check, Square, User, Eye, EyeOff } from 'lucide-react-native';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, clearError, setRememberMe: storeSetRememberMe } = useAuthStore();
  const hasRedirected = useRef(false);
  const initialRender = useRef(true);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Initialize rememberMe from store on first render only
    if (initialRender.current) {
      initialRender.current = false;
      setRememberMe(useAuthStore.getState().rememberMe);
      
      // Clear any previous errors when mounting the component
      clearError();
    }
  }, []);

  useEffect(() => {
    // Redirect to home if already authenticated, but only once
    // and only if navigation is ready
    if (
      !navigationState?.key || 
      !isAuthenticated || 
      hasRedirected.current
    ) {
      return;
    }
    
    hasRedirected.current = true;
    
    // Defer navigation to next tick to avoid navigation during render
    const timer = setTimeout(() => {
      router.replace('/');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigationState?.key]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    
    // Update rememberMe in store
    storeSetRememberMe(rememberMe);
    
    // Attempt login
    await login(email, password, rememberMe);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <User size={64} color={colors.primary} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to access your job search dashboard
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={toggleShowPassword} style={styles.eyeIcon}>
              {showPassword ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>

          <Pressable style={styles.rememberMe} onPress={toggleRememberMe}>
            {rememberMe ? (
              <Check size={20} color={colors.primary} />
            ) : (
              <Square size={20} color={colors.textSecondary} />
            )}
            <Text style={styles.rememberMeText}>Remember me for 7 days</Text>
          </Pressable>

          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title={isLoading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
            style={styles.loginButton}
          />
          
          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoText}>Email: user@example.com</Text>
            <Text style={styles.demoText}>Password: password123</Text>
          </View>
          
          <View style={styles.registerLink}>
            <Text style={styles.registerLinkText}>Don't have an account?</Text>
            <Button
              title="Create Account"
              variant="outline"
              onPress={() => {
                if (navigationState?.key) {
                  router.push('/register');
                }
              }}
              style={styles.registerButton}
            />
          </View>
          
          <View style={styles.adminLink}>
            <Text style={styles.adminLinkText}>Are you an admin?</Text>
            <Button
              title="Admin Login"
              variant="outline"
              onPress={() => {
                if (navigationState?.key) {
                  router.push('/admin/login');
                }
              }}
              style={styles.adminButton}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 8,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 8,
  },
  demoCredentials: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerButton: {
    marginTop: 4,
  },
  adminLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  adminLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  adminButton: {
    marginTop: 4,
  },
});