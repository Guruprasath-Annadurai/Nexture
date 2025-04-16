import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationsStore } from '@/stores/notifications-store';

// Constants
const NOTIFICATION_TOKEN_KEY = 'notification_token';
const PROFILE_REMINDER_ID = 'profile_upload_reminder';
const JOB_APPLICATION_REMINDER_ID = 'job_application_reminder';
const INTERVIEW_REMINDER_ID = 'interview_reminder';
const RESUME_UPDATE_REMINDER_ID = 'resume_update_reminder';
const SKILL_UPDATE_REMINDER_ID = 'skill_update_reminder';

/**
 * Save notification token to AsyncStorage
 */
export async function saveNotificationToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving notification token:', error);
  }
}

/**
 * Get notification token from AsyncStorage
 */
export async function getNotificationToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(NOTIFICATION_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
}

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('Push notifications not supported on web');
    return null;
  }

  try {
    // Check if device is physical (not simulator/emulator)
    if (!Device.isDevice) {
      console.log('Push notifications are not available on simulator/emulator');
      return null;
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    // Get push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Save token to storage and state
    await saveNotificationToken(token);
    
    // Configure notification handler
    configureNotifications();

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Configure notification handling
 */
export function configureNotifications(): void {
  if (Platform.OS === 'web') return;

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification({
  title,
  body,
  data = {},
  trigger = null,
  identifier,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: Notifications.NotificationTriggerInput;
  identifier?: string;
}): Promise<string> {
  if (Platform.OS === 'web') {
    console.log('Local notifications not supported on web');
    return '';
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger,
      identifier,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return '';
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(
  identifier: string
): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Check if profile upload reminder is scheduled and schedule if not
 */
export async function checkAndScheduleUploadReminder(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    // Check if already scheduled
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const isScheduled = scheduledNotifications.some(
      (notification) => notification.identifier === PROFILE_REMINDER_ID
    );

    if (!isScheduled) {
      // Schedule for tomorrow at 10 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      await scheduleLocalNotification({
        title: 'Complete Your Profile',
        body: "Don't forget to upload your resume to find better job matches!",
        trigger: { date: tomorrow },
        identifier: PROFILE_REMINDER_ID,
      });
    }
  } catch (error) {
    console.error('Error checking/scheduling profile reminder:', error);
  }
}

/**
 * Schedule a job application reminder
 */
export async function scheduleJobApplicationReminder(
  jobTitle: string,
  companyName: string,
  dueDate: Date
): Promise<string> {
  if (Platform.OS === 'web') return '';

  try {
    // Schedule for 2 days before the due date at 9 AM
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 2);
    reminderDate.setHours(9, 0, 0, 0);

    // Only schedule if reminder date is in the future
    if (reminderDate > new Date()) {
      const id = await scheduleLocalNotification({
        title: 'Job Application Reminder',
        body: `Don't forget to apply for ${jobTitle} at ${companyName} soon!`,
        data: {
          type: 'job_application',
          jobTitle,
          companyName,
        },
        trigger: { date: reminderDate },
        identifier: `${JOB_APPLICATION_REMINDER_ID}_${jobTitle}_${companyName}`.replace(/\s+/g, '_'),
      });
      return id;
    }
    return '';
  } catch (error) {
    console.error('Error scheduling job application reminder:', error);
    return '';
  }
}

/**
 * Schedule an interview reminder
 */
export async function scheduleInterviewReminder(
  jobTitle: string,
  companyName: string,
  interviewDate: Date
): Promise<string> {
  if (Platform.OS === 'web') return '';

  try {
    // Schedule for 1 day before the interview at 6 PM
    const reminderDate = new Date(interviewDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(18, 0, 0, 0);

    // Also schedule for 1 hour before the interview
    const hourBeforeDate = new Date(interviewDate);
    hourBeforeDate.setHours(hourBeforeDate.getHours() - 1);

    // Only schedule if reminder dates are in the future
    const now = new Date();
    let id = '';

    if (reminderDate > now) {
      id = await scheduleLocalNotification({
        title: 'Interview Tomorrow',
        body: `Prepare for your interview with ${companyName} for the ${jobTitle} position tomorrow!`,
        data: {
          type: 'interview',
          jobTitle,
          companyName,
          interviewDate: interviewDate.toISOString(),
        },
        trigger: { date: reminderDate },
        identifier: `${INTERVIEW_REMINDER_ID}_day_${jobTitle}_${companyName}`.replace(/\s+/g, '_'),
      });
    }

    if (hourBeforeDate > now) {
      await scheduleLocalNotification({
        title: 'Interview Soon',
        body: `Your interview with ${companyName} for the ${jobTitle} position is in 1 hour!`,
        data: {
          type: 'interview',
          jobTitle,
          companyName,
          interviewDate: interviewDate.toISOString(),
        },
        trigger: { date: hourBeforeDate },
        identifier: `${INTERVIEW_REMINDER_ID}_hour_${jobTitle}_${companyName}`.replace(/\s+/g, '_'),
      });
    }

    return id;
  } catch (error) {
    console.error('Error scheduling interview reminder:', error);
    return '';
  }
}

/**
 * Schedule a resume update reminder
 */
export async function scheduleResumeUpdateReminder(
  intervalDays: number = 30
): Promise<string> {
  if (Platform.OS === 'web') return '';

  try {
    // Cancel any existing resume update reminders
    await cancelScheduledNotification(RESUME_UPDATE_REMINDER_ID);

    // Schedule for X days from now at 11 AM
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + intervalDays);
    reminderDate.setHours(11, 0, 0, 0);

    const id = await scheduleLocalNotification({
      title: 'Update Your Resume',
      body: `It's been ${intervalDays} days since your last resume update. Keep it fresh for better job matches!`,
      data: {
        type: 'resume_update',
      },
      trigger: { date: reminderDate },
      identifier: RESUME_UPDATE_REMINDER_ID,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling resume update reminder:', error);
    return '';
  }
}

/**
 * Schedule a skills update reminder
 */
export async function scheduleSkillsUpdateReminder(
  intervalDays: number = 60
): Promise<string> {
  if (Platform.OS === 'web') return '';

  try {
    // Cancel any existing skills update reminders
    await cancelScheduledNotification(SKILL_UPDATE_REMINDER_ID);

    // Schedule for X days from now at 10 AM
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + intervalDays);
    reminderDate.setHours(10, 0, 0, 0);

    const id = await scheduleLocalNotification({
      title: 'Update Your Skills',
      body: 'Have you learned any new skills recently? Update your profile to improve job matches!',
      data: {
        type: 'skill_update',
      },
      trigger: { date: reminderDate },
      identifier: SKILL_UPDATE_REMINDER_ID,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling skills update reminder:', error);
    return '';
  }
}