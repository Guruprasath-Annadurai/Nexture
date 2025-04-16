import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Platform, Image } from 'react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Shield, CheckCircle, X, Smartphone, Mail, QrCode } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth-store';

interface TwoFactorVerificationProps {
  email: string;
  phone?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TwoFactorVerification({ email, phone, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const [step, setStep] = useState<'method' | 'send' | 'verify' | 'totp-setup' | 'totp-verify'>('method');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms' | 'totp'>('totp');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  
  const { setupTwoFactor, verifyTwoFactor } = useAuthStore();
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [timeLeft, resendDisabled]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-focus to next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const sendVerificationCode = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call an API to send a verification code
      // For this demo, we'll simulate a delay and then move to the next step
      setTimeout(() => {
        setStep('verify');
        setTimeLeft(120); // 2 minutes countdown
        setResendDisabled(true);
        setIsLoading(false);
        
        // Focus on first input after a short delay
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        
        Alert.alert(
          'Verification Code Sent',
          verificationMethod === 'email'
            ? `A verification code has been sent to ${email}. Please check your email and enter the code below.`
            : `A verification code has been sent to ${phone}. Please check your SMS messages and enter the code below.`
        );
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
      setIsLoading(false);
    }
  };
  
  const setupTotp = async () => {
    try {
      setIsLoading(true);
      
      // Call the setupTwoFactor function from auth store
      const result = await setupTwoFactor();
      
      // In a real app, this would generate a QR code from the otpauth_url
      // For this demo, we'll use a placeholder QR code image
      setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(result.otpauth_url));
      
      // Extract the secret from the otpauth_url for manual entry
      const secretMatch = result.otpauth_url.match(/secret=([A-Z0-9]+)/);
      if (secretMatch && secretMatch[1]) {
        setTotpSecret(secretMatch[1]);
      }
      
      setStep('totp-setup');
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to set up TOTP authentication. Please try again.');
      setIsLoading(false);
    }
  };
  
  const verifyCode = async () => {
    try {
      const fullCode = code.join('');
      if (!fullCode || fullCode.length !== 6) {
        Alert.alert('Error', 'Please enter the complete 6-digit verification code.');
        return;
      }
      
      setIsLoading(true);
      
      if (verificationMethod === 'totp') {
        // Verify TOTP code using auth store function
        const success = await verifyTwoFactor(fullCode);
        
        if (success) {
          if (onSuccess) {
            onSuccess();
          }
        } else {
          Alert.alert('Error', 'Invalid verification code. Please try again.');
        }
      } else {
        // For email/SMS verification, simulate a delay and then complete the verification
        setTimeout(() => {
          // For demo purposes, any 6-digit code is valid
          if (fullCode.length === 6 && /^\d+$/.test(fullCode)) {
            if (onSuccess) {
              onSuccess();
            }
          } else {
            Alert.alert('Error', 'Invalid verification code. Please try again.');
          }
        }, 1500);
      }
      
      setIsLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
      setIsLoading(false);
    }
  };
  
  const resendCode = () => {
    if (!resendDisabled) {
      setCode(['', '', '', '', '', '']);
      sendVerificationCode();
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  const renderMethodSelection = () => (
    <View style={styles.methodStep}>
      <Text style={styles.methodTitle}>Choose Verification Method</Text>
      <Text style={styles.methodDescription}>
        Select how you want to secure your account with two-factor authentication
      </Text>
      
      <TouchableOpacity
        style={[styles.methodOption, verificationMethod === 'totp' && styles.methodOptionSelected]}
        onPress={() => setVerificationMethod('totp')}
      >
        <QrCode size={24} color={verificationMethod === 'totp' ? colors.white : colors.primary} />
        <View style={styles.methodTextContainer}>
          <Text style={[styles.methodOptionTitle, verificationMethod === 'totp' && styles.methodOptionTitleSelected]}>
            Authenticator App
          </Text>
          <Text style={[styles.methodOptionDescription, verificationMethod === 'totp' && styles.methodOptionDescriptionSelected]}>
            Use Google Authenticator, Authy, or similar apps
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.methodOption, verificationMethod === 'email' && styles.methodOptionSelected]}
        onPress={() => setVerificationMethod('email')}
      >
        <Mail size={24} color={verificationMethod === 'email' ? colors.white : colors.primary} />
        <View style={styles.methodTextContainer}>
          <Text style={[styles.methodOptionTitle, verificationMethod === 'email' && styles.methodOptionTitleSelected]}>
            Email Verification
          </Text>
          <Text style={[styles.methodOptionDescription, verificationMethod === 'email' && styles.methodOptionDescriptionSelected]}>
            Receive verification codes via email
          </Text>
        </View>
      </TouchableOpacity>
      
      {phone && (
        <TouchableOpacity
          style={[styles.methodOption, verificationMethod === 'sms' && styles.methodOptionSelected]}
          onPress={() => setVerificationMethod('sms')}
        >
          <Smartphone size={24} color={verificationMethod === 'sms' ? colors.white : colors.primary} />
          <View style={styles.methodTextContainer}>
            <Text style={[styles.methodOptionTitle, verificationMethod === 'sms' && styles.methodOptionTitleSelected]}>
              SMS Verification
            </Text>
            <Text style={[styles.methodOptionDescription, verificationMethod === 'sms' && styles.methodOptionDescriptionSelected]}>
              Receive verification codes via SMS
            </Text>
          </View>
        </TouchableOpacity>
      )}
      
      <Button
        title="Continue"
        onPress={() => {
          if (verificationMethod === 'totp') {
            setupTotp();
          } else {
            setStep('send');
          }
        }}
        loading={isLoading}
        style={styles.continueButton}
      />
      
      <Button
        title="Cancel"
        onPress={handleCancel}
        variant="outline"
        style={styles.cancelButton}
      />
    </View>
  );
  
  const renderSendStep = () => (
    <View style={styles.sendStep}>
      <Text style={styles.emailText}>
        We'll send a verification code to: 
        <Text style={styles.emailHighlight}>
          {verificationMethod === 'email' ? email : phone}
        </Text>
      </Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
        </Text>
      </View>
      
      <Button
        title={`Send Code via ${verificationMethod === 'email' ? 'Email' : 'SMS'}`}
        onPress={sendVerificationCode}
        loading={isLoading}
        icon={verificationMethod === 'email' 
          ? <Mail size={18} color={colors.white} />
          : <Smartphone size={18} color={colors.white} />
        }
        iconPosition="left"
        style={styles.sendButton}
      />
      
      <Button
        title="Back"
        onPress={() => setStep('method')}
        variant="outline"
        style={styles.backButton}
      />
      
      <Button
        title="Cancel"
        onPress={handleCancel}
        variant="outline"
        style={styles.cancelButton}
      />
    </View>
  );
  
  const renderVerifyStep = () => (
    <View style={styles.verifyStep}>
      <Text style={styles.verifyText}>
        Enter the 6-digit code sent to your {verificationMethod === 'email' ? 'email' : 'phone'}
      </Text>
      
      <View style={styles.codeInputContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => inputRefs.current[index] = ref}
            style={styles.codeDigitInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </View>
      
      {timeLeft > 0 && (
        <Text style={styles.timerText}>
          Code expires in {formatTime(timeLeft)}
        </Text>
      )}
      
      <Button
        title="Verify Code"
        onPress={verifyCode}
        loading={isLoading}
        icon={<CheckCircle size={18} color={colors.white} />}
        iconPosition="left"
        style={styles.verifyButton}
      />
      
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive the code? </Text>
        <Button
          title="Resend"
          onPress={resendCode}
          variant="text"
          disabled={resendDisabled}
          style={styles.resendButton}
        />
      </View>
      
      <Button
        title="Back"
        onPress={() => setStep('send')}
        variant="outline"
        style={styles.backButton}
      />
      
      <Button
        title="Cancel"
        onPress={handleCancel}
        variant="outline"
        icon={<X size={18} color={colors.danger} />}
        iconPosition="left"
        style={styles.cancelVerifyButton}
      />
    </View>
  );
  
  const renderTotpSetup = () => (
    <View style={styles.totpSetupStep}>
      <Text style={styles.totpTitle}>Set Up Authenticator App</Text>
      <Text style={styles.totpDescription}>
        Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
      </Text>
      
      {qrCodeUrl && (
        <View style={styles.qrCodeContainer}>
          <Image
            source={{ uri: qrCodeUrl }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        </View>
      )}
      
      {totpSecret && (
        <View style={styles.secretContainer}>
          <Text style={styles.secretLabel}>Or enter this code manually:</Text>
          <Text style={styles.secretCode}>{totpSecret}</Text>
        </View>
      )}
      
      <Button
        title="I've Scanned the QR Code"
        onPress={() => {
          setStep('totp-verify');
          // Reset code and focus on first input
          setCode(['', '', '', '', '', '']);
          setTimeout(() => {
            inputRefs.current[0]?.focus();
          }, 100);
        }}
        style={styles.continueButton}
      />
      
      <Button
        title="Cancel"
        onPress={handleCancel}
        variant="outline"
        style={styles.cancelButton}
      />
    </View>
  );
  
  const renderTotpVerify = () => (
    <View style={styles.verifyStep}>
      <Text style={styles.verifyText}>
        Enter the 6-digit code from your authenticator app
      </Text>
      
      <View style={styles.codeInputContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => inputRefs.current[index] = ref}
            style={styles.codeDigitInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </View>
      
      <Button
        title="Verify Code"
        onPress={verifyCode}
        loading={isLoading}
        icon={<CheckCircle size={18} color={colors.white} />}
        iconPosition="left"
        style={styles.verifyButton}
      />
      
      <Button
        title="Back"
        onPress={() => setStep('totp-setup')}
        variant="outline"
        style={styles.backButton}
      />
      
      <Button
        title="Cancel"
        onPress={handleCancel}
        variant="outline"
        icon={<X size={18} color={colors.danger} />}
        iconPosition="left"
        style={styles.cancelVerifyButton}
      />
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={32} color={colors.primary} />
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          {step === 'method'
            ? 'Secure your account with two-factor authentication'
            : step === 'send'
            ? 'Send a verification code to your device'
            : step === 'verify' || step === 'totp-verify'
            ? 'Enter the verification code sent to you'
            : 'Set up an authenticator app for two-factor authentication'}
        </Text>
      </View>
      
      {step === 'method' && renderMethodSelection()}
      {step === 'send' && renderSendStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'totp-setup' && renderTotpSetup()}
      {step === 'totp-verify' && renderTotpVerify()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  methodStep: {
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.card,
  },
  methodOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  methodOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodOptionTitleSelected: {
    color: colors.white,
  },
  methodOptionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  methodOptionDescriptionSelected: {
    color: colors.white + 'CC',
  },
  continueButton: {
    minWidth: 200,
    marginTop: 16,
  },
  sendStep: {
    alignItems: 'center',
  },
  emailText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: colors.text,
  },
  infoBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  sendButton: {
    minWidth: 220,
  },
  backButton: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 16,
  },
  verifyStep: {
    alignItems: 'center',
  },
  verifyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  codeDigitInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.inputBackground,
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  verifyButton: {
    minWidth: 180,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendButton: {
    height: 30,
    paddingHorizontal: 0,
  },
  cancelVerifyButton: {
    borderColor: colors.danger,
  },
  totpSetupStep: {
    alignItems: 'center',
  },
  totpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  totpDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  secretContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  secretCode: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
});