import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Manage Users',
        }}
      />
      <Stack.Screen
        name="jobs"
        options={{
          title: 'Manage Jobs',
        }}
      />
      <Stack.Screen
        name="applications"
        options={{
          title: 'Manage Applications',
        }}
      />
      <Stack.Screen
        name="manage-admins"
        options={{
          title: 'Manage Administrators',
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: 'Admin Login',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="recruiter-dashboard"
        options={{
          title: 'Recruiter Dashboard',
        }}
      />
      <Stack.Screen
        name="candidate-details"
        options={{
          title: 'Candidate Details',
        }}
      />
      <Stack.Screen
        name="schedule-interview"
        options={{
          title: 'Schedule Interview',
        }}
      />
      <Stack.Screen
        name="report-tracking"
        options={{
          title: 'Report Download Tracking',
        }}
      />
    </Stack>
  );
}