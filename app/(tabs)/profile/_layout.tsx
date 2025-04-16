import React from 'react';
import { Stack } from 'expo-router';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';

export default function ProfileLayout() {
  return (
    <UserProtectedRoute>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="edit"
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notifications',
          }}
        />
        <Stack.Screen
          name="downloads"
          options={{
            title: 'Downloads',
          }}
        />
        <Stack.Screen
          name="email-preferences"
          options={{
            title: 'Email Preferences',
          }}
        />
        <Stack.Screen
          name="security"
          options={{
            title: 'Security',
          }}
        />
      </Stack>
    </UserProtectedRoute>
  );
}