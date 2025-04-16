import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { Shield, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';

export default function UnauthorizedScreen() {
  return (
    <View style={styles.container}>
      <Shield size={64} color={colors.error} />
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>
        You don't have permission to access this area. This section is restricted to administrators only.
      </Text>
      <AlertTriangle size={24} color={colors.warning} style={styles.icon} />
      <Text style={styles.warningText}>
        If you believe you should have access, please contact your system administrator.
      </Text>
      <Button 
        title="Go Back to Home" 
        onPress={() => router.replace('/')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '80%',
  },
  icon: {
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
    maxWidth: '80%',
  },
  button: {
    minWidth: 200,
  },
});