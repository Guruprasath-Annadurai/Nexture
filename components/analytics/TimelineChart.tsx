import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';

interface TimelineChartProps {
  data: {
    date: string;
    count: number;
  }[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  // Find the maximum count for scaling
  const maxCount = Math.max(...data.map(item => item.count));
  
  // Limit to the last 10 points if there are more
  const displayData = data.length > 10 ? data.slice(data.length - 10) : data;
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {displayData.map((item, index) => {
          const height = (item.count / maxCount) * 100;
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${height}%`,
                      backgroundColor: colors.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dateLabel}>{item.date}</Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.yAxisLabels}>
        <Text style={styles.yAxisLabel}>{maxCount}</Text>
        <Text style={styles.yAxisLabel}>{Math.round(maxCount / 2)}</Text>
        <Text style={styles.yAxisLabel}>0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 200,
    marginTop: 16,
  },
  yAxisLabels: {
    width: 30,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  chartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: '60%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dateLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});