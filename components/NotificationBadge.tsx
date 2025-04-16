import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface NotificationBadgeProps {
  children: React.ReactNode;
  hasNotifications?: boolean;
  containerStyle?: ViewStyle;
}

export function NotificationBadge({ 
  children, 
  hasNotifications = false, 
  containerStyle 
}: NotificationBadgeProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {children}
      {hasNotifications && <View style={styles.badge} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
});