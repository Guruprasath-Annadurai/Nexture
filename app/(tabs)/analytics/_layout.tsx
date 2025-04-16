import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function AnalyticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Analytics',
        }}
      />
    </Stack>
  );
}