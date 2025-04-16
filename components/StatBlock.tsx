import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface StatBlockProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function StatBlock({ label, value, icon, style }: StatBlockProps) {
  return (
    <View style={[styles.container, style]}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16, // p-4
    backgroundColor: colors.primaryLight + '10', // bg-indigo-50 (10% opacity)
    borderRadius: 12, // rounded-xl
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14, // text-sm
    color: colors.textSecondary, // text-slate-500
  },
  value: {
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    color: colors.primaryDark, // text-indigo-700
  },
  iconContainer: {
    color: colors.primaryLight, // text-indigo-400
    fontSize: 24, // text-2xl
  },
});