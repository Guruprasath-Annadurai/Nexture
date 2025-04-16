import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Section({ title, icon, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24, // mb-6
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // mb-2
  },
  iconContainer: {
    marginRight: 8, // mr-2
    color: colors.primary, // text-primary
  },
  title: {
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: colors.text, // text-slate-800
  },
});