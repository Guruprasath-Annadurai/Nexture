import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function JobsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Jobs',
        }}
      />
      <Stack.Screen
        name="match"
        options={{
          title: 'Find Matching Jobs',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Job Match History',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="matches"
        options={{
          title: 'Job Matches',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="applied"
        options={{
          title: 'Applied Jobs',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Job Details',
          headerShown: false,
        }}
      />
    </Stack>
  );
}