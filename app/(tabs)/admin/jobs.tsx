import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { Briefcase } from 'lucide-react-native';

export default function AdminJobsScreen() {
  return (
    <AdminProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Jobs</Text>
          <Text style={styles.subtitle}>Create and edit job listings</Text>
        </View>
        
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Briefcase size={32} color={colors.primary} />
            <Text style={styles.cardTitle}>Jobs Management</Text>
            <Text style={styles.cardText}>
              This is a placeholder for the Jobs Management screen. Job listings will appear here.
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