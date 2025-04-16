import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { UserProtectedRoute } from '@/components/UserProtectedRoute';
import { Card } from '@/components/Card';
import { colors } from '@/constants/colors';
import { Bell, Check, Trash2 } from 'lucide-react-native';
import { useNotificationsStore, Notification } from '@/stores/notifications-store';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
  const { 
    notifications, 
    markAllAsRead, 
    markAsRead, 
    deleteNotification 
  } = useNotificationsStore();

  // Mark all as read when the screen is opened
  useEffect(() => {
    if (notifications.some(n => !n.read)) {
      markAllAsRead();
    }
  }, []);

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    
    return (
      <Card 
        style={[
          styles.notificationCard, 
          !item.read && styles.unreadNotification
        ]}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTypeIndicator}>
            <Bell size={16} color={getNotificationTypeColor(item.type)} />
          </View>
          <Text style={styles.notificationTime}>{timeAgo}</Text>
        </View>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        <View style={styles.notificationActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => markAsRead(item.id)}
          >
            <Check size={16} color={colors.primary} />
            <Text style={styles.actionText}>Mark as read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteNotification(item.id)}
          >
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const getNotificationTypeColor = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.primary;
    }
  };

  return (
    <UserProtectedRoute>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Stay updated with your activity</Text>
        </View>
        
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.notificationsList}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Bell size={32} color={colors.primary} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>
                You don't have any notifications yet. We'll notify you about important updates.
              </Text>
            </View>
          </Card>
        )}
      </View>
    </UserProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTypeIndicator: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors.background,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  emptyCard: {
    margin: 16,
  },
  emptyContent: {
    padding: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});