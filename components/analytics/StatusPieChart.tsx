import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { Platform } from 'react-native';

// For web compatibility, we'll create a simple representation of a pie chart
// In a real app, you would use a charting library like Victory Native or react-native-chart-kit

interface StatusPieChartProps {
  data: {
    status: string;
    count: number;
    color: string;
  }[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate cumulative percentages for positioning
  let cumulativePercentage = 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = (item.count / total) * 100;
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
          cumulativePercentage += percentage;
          
          return (
            <View 
              key={index} 
              style={[
                styles.pieSegment,
                {
                  backgroundColor: item.color,
                  width: percentage > 5 ? '100%' : '90%',
                  height: percentage > 5 ? '100%' : '90%',
                  transform: [
                    { rotate: `${startAngle}deg` },
                    { translateX: percentage > 5 ? 0 : 5 },
                  ],
                  zIndex: data.length - index,
                  opacity: percentage > 5 ? 1 : 0.8,
                }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  chartContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.backgroundLight,
  },
  pieSegment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
});