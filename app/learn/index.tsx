import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { BookOpen } from 'lucide-react-native';

export default function LearnScreen() {
  return (
    <UserProtectedRoute>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>Improve your skills</Text>
        </View>
        
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <BookOpen size={32} color={colors.primary} />
            <Text style={styles.cardTitle}>Learn Screen</Text>
            <Text style={styles.cardText}>
              This is a placeholder for the Learn screen. Your learning resources will appear here.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </UserProtectedRoute>
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