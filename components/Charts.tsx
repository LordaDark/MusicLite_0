import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simple Bar Chart component
export const BarChart = ({ 
  data, 
  width, 
  height, 
  barColor = '#1DB954',
  textColor = '#FFFFFF'
}: {
  data: { day: string; minutes: number }[];
  width: number;
  height: number;
  barColor?: string;
  textColor?: string;
}) => {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.minutes), 1);
  
  // Calculate bar width based on the number of bars and chart width
  const barWidth = (width - 40) / data.length;
  
  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const barHeight = (item.minutes / maxValue) * (height - 60);
          
          return (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: barHeight, 
                    width: barWidth - 8,
                    backgroundColor: barColor
                  }
                ]} 
              />
              <Text style={[styles.label, { color: textColor }]}>{item.day}</Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.yAxis}>
        <Text style={[styles.yAxisLabel, { color: textColor }]}>{maxValue} min</Text>
        <Text style={[styles.yAxisLabel, { color: textColor }]}>{Math.floor(maxValue / 2)} min</Text>
        <Text style={[styles.yAxisLabel, { color: textColor }]}>0 min</Text>
      </View>
    </View>
  );
};

// Simple Pie Chart component
export const PieChart = ({ 
  data, 
  width, 
  height,
  textColor = '#FFFFFF'
}: {
  data: { name: string; value: number; color: string }[];
  width: number;
  height: number;
  textColor?: string;
}) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={[styles.pieContainer, { width, height }]}>
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[
                styles.legendColor, 
                { backgroundColor: item.color }
              ]} 
            />
            <Text style={[styles.legendText, { color: textColor }]}>
              {item.name} ({Math.round((item.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.pieChart}>
        {/* This is a simplified representation - in a real app, you'd draw actual pie segments */}
        <View style={styles.pieCircle}>
          {data.map((item, index) => {
            const percentage = item.value / total;
            const rotate = index === 0 ? 0 : data
              .slice(0, index)
              .reduce((sum, prev) => sum + (prev.value / total) * 360, 0);
            
            return (
              <View 
                key={index}
                style={[
                  styles.pieSegment,
                  {
                    backgroundColor: item.color,
                    width: '100%',
                    height: '100%',
                    transform: [
                      { rotate: `${rotate}deg` }
                    ],
                    zIndex: data.length - index,
                    opacity: 0.8 + (index * 0.05)
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingLeft: 40,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 20,
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  yAxisLabel: {
    fontSize: 10,
  },
  pieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChart: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#333',
  },
  pieSegment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [{ rotate: '0deg' }],
  },
  legendContainer: {
    flex: 1,
    paddingRight: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
});