import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { CheckCircle, Clock, XCircle, Calendar } from 'lucide-react-native';

interface StatusFilterProps {
  selectedStatus: string | null;
  onSelectStatus: (status: string | null) => void;
}

export function StatusFilter({ selectedStatus, onSelectStatus }: StatusFilterProps) {
  const statuses = [
    { id: 'all', label: 'All', icon: null },
    { id: 'applied', label: 'Applied', icon: <Clock size={16} color={colors.primary} /> },
    { id: 'submitted', label: 'Submitted', icon: <Clock size={16} color={colors.primary} /> },
    { id: 'interview', label: 'Interview', icon: <Calendar size={16} color={colors.secondary} /> },
    { id: 'offered', label: 'Offered', icon: <CheckCircle size={16} color={colors.success} /> },
    { id: 'accepted', label: 'Accepted', icon: <CheckCircle size={16} color={colors.success} /> },
    { id: 'rejected', label: 'Rejected', icon: <XCircle size={16} color={colors.error} /> },
  ];

  return (
    <View style={styles.container}>
      {statuses.map((status) => (
        <Pressable
          key={status.id}
          style={[
            styles.statusButton,
            selectedStatus === status.id && styles.selectedStatus,
          ]}
          onPress={() => onSelectStatus(status.id === 'all' ? null : status.id)}
        >
          {status.icon && <View style={styles.iconContainer}>{status.icon}</View>}
          <Text
            style={[
              styles.statusText,
              selectedStatus === status.id && styles.selectedStatusText,
            ]}
          >
            {status.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedStatus: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconContainer: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedStatusText: {
    color: colors.background,
    fontWeight: '500',
  },
});