import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface SkillsBarChartProps {
  data: {
    skill: string;
    count: number;
  }[];
}

export function SkillsBarChart({ data }: SkillsBarChartProps) {
  // Find the maximum count for scaling
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const percentage = (item.count / maxCount) * 100;
        
        return (
          <View key={index} style={styles.barContainer}>
            <Text style={styles.skillLabel}>{item.skill}</Text>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    width: `${percentage}%`,
                    backgroundColor: getBarColor(index),
                  }
                ]} 
              />
              <Text style={styles.countLabel}>{item.count}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Function to get different colors for bars
const getBarColor = (index: number): string => {
  const barColors = [
    colors.primary,
    colors.secondary,
    colors.info,
    colors.success,
    colors.warning,
  ];
  
  return barColors[index % barColors.length];
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    marginBottom: 16,
  },
  skillLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  barWrapper: {
    height: 24,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  countLabel: {
    position: 'absolute',
    right: 8,
    top: 3,
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
});