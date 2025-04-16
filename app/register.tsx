import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router, useRootNavigationState } from 'expo-router';
import { Mail, Lock, AlertCircle, Check, Square, User, Eye, EyeOff, Phone } from 'lucide-react-native';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { validateEmail, validatePassword, validatePhone } from '@/utils/validation';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    phone?: string;
  }>({});
  
  const { register, isLoading, error, isAuthenticated, clearError, setRememberMe: storeSetRememberMe } = useAuthStore();
  const navigationState = useRootNavigationState();
  const hasRedirected = useRef(false);
  const initialRender = useRef(true);

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

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      firstName?: string;
      phone?: string;
    } = {};
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    // Validate phone number
    const phoneError = validatePhone(phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }
    
    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Update rememberMe in store
    storeSetRememberMe(rememberMe);
    
    // Construct full name
    const name = `${firstName} ${lastName}`.trim();
    
    // Attempt registration with name and phone parameters
    await register(email, password, name, phone);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to start your job search journey
          </Text>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, styles.nameInput]}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
            
            <View style={[styles.inputContainer, styles.nameInput]}>
              <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>
          {errors.firstName && (
            <Text style={styles.fieldError}>{errors.firstName}</Text>
          )}

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
          {errors.email && (
            <Text style={styles.fieldError}>{errors.email}</Text>
          )}

          <View style={styles.inputContainer}>
            <Phone size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Phone Number (+1234567890)"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone && (
            <Text style={styles.fieldError}>{errors.phone}</Text>
          )}

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
          {errors.password && (
            <Text style={styles.fieldError}>{errors.password}</Text>
          )}

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry={!showPassword}
            />
          </View>
          {errors.confirmPassword && (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          )}

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
            title={isLoading ? "Creating account..." : "Create Account"}
            onPress={handleRegister}
            disabled={isLoading || !email || !password || !confirmPassword || !firstName || !phone}
            style={styles.registerButton}
          />
          
          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account?</Text>
            <Button
              title="Sign In"
              variant="outline"
              onPress={() => {
                if (navigationState?.key) {
                  router.push('/login');
                }
              }}
              style={styles.loginButton}
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
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
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
  fieldError: {
    color: colors.error,
    fontSize: 12,
    marginTop: -8,
    marginLeft: 4,
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
  registerButton: {
    marginTop: 8,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginButton: {
    marginTop: 4,
  },
});