import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { FileText } from 'lucide-react-native';

export default function AdminApplicationsScreen() {
  return (
    <AdminProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Applications</Text>
          <Text style={styles.subtitle}>Review and process job applications</Text>
        </View>
        
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <FileText size={32} color={colors.primary} />
            <Text style={styles.cardTitle}>Applications Management</Text>
            <Text style={styles.cardText}>
              This is a placeholder for the Applications Management screen. Job applications will appear here.
            </Text>
          </View>
        </Card>
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
  card: {
    margin: 16,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});