import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ResumeAssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Resume Assistant',
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          title: 'Resume Analysis',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="interview-prep"
        options={{
          title: 'Interview Preparation',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cover-letter"
        options={{
          title: 'Cover Letter Generator',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="career-summary"
        options={{
          title: 'Career Summary Builder',
          headerShown: false,
        }}
      />
    </Stack>
  );
}