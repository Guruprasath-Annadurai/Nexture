import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  scrollable?: boolean;
  style?: any;
}

export function Tabs({ tabs, activeTab, onTabChange, scrollable = false, style }: TabsProps) {
  const TabContainer = scrollable ? ScrollView : View;
  
  return (
    <View style={[styles.container, style]}>
      <TabContainer 
        horizontal={scrollable}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={scrollable ? styles.scrollableContent : styles.fixedContent}
      >
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton,
              scrollable && styles.scrollableTab
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <View style={styles.tabContent}>
              {tab.icon}
              <Text 
                style={[
                  styles.tabLabel, 
                  activeTab === tab.id && styles.activeTabLabel,
                  tab.icon && styles.tabLabelWithIcon
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </TabContainer>
      <View style={styles.indicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  fixedContent: {
    flexDirection: 'row',
  },
  scrollableContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableTab: {
    flex: 0,
    paddingHorizontal: 16,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabLabelWithIcon: {
    marginTop: 4,
    fontSize: 12,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '500',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});