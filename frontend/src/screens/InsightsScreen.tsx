import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import GlassCard from '../components/GlassCard';

export default function InsightsScreen() {
  const { stats, loading, loadStats } = useExpenses();
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadStats(month, year);
    }
  }, [month, year, user]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: '#10b981',
      Transport: '#3b82f6',
      Shopping: '#a855f7',
      Bills: '#ef4444',
      Entertainment: '#f59e0b',
      Other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (month > 1) {
        setMonth(month - 1);
      } else {
        setMonth(12);
        setYear(year - 1);
      }
    } else {
      if (month < 12) {
        setMonth(month + 1);
      } else {
        setMonth(1);
        setYear(year + 1);
      }
    }
  };

  if (!stats || !stats.categoryBreakdown || Object.keys(stats.categoryBreakdown).length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={() => loadStats(month, year)}
              tintColor="white"
            />
          }
        >
          <View style={styles.content}>
            <View style={styles.monthNav}>
              <Button
                icon="chevron-left"
                onPress={() => navigateMonth('prev')}
                mode="outlined"
                textColor="white"
              />
              <Text variant="headlineMedium" style={styles.monthText}>
                {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <Button
                icon="chevron-right"
                onPress={() => navigateMonth('next')}
                mode="outlined"
                textColor="white"
              />
            </View>
            <EmptyState
              title="No data available"
              message="Add some expenses to see insights and spending patterns"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => loadStats(month, year)}
            tintColor="white"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.monthNav}>
            <Button
              icon="chevron-left"
              onPress={() => navigateMonth('prev')}
              mode="outlined"
              textColor="white"
            />
            <Text variant="headlineMedium" style={styles.monthText}>
              {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <Button
              icon="chevron-right"
              onPress={() => navigateMonth('next')}
              mode="outlined"
              textColor="white"
            />
          </View>

          <GlassCard>
            <Text variant="bodySmall" style={styles.label}>
              Total Spending
            </Text>
            <Text variant="displaySmall" style={styles.total}>
              ₹{stats.total.toFixed(2)}
            </Text>
          </GlassCard>

          <Text variant="titleLarge" style={styles.sectionTitle}>
            Category Breakdown
          </Text>
          {Object.entries(stats.categoryBreakdown).map(([cat, amount]) => {
            const percentage = stats.total > 0 ? (amount / stats.total) * 100 : 0;
            return (
              <GlassCard key={cat} style={{ marginBottom: 12 }}>
                <View style={styles.categoryHeader}>
                  <Text variant="titleMedium" style={[styles.categoryName, { color: getCategoryColor(cat) }]}>
                    {cat}
                  </Text>
                  <Text variant="headlineSmall" style={styles.categoryAmount}>
                    ₹{amount.toFixed(2)}
                  </Text>
                </View>
                <ProgressBar
                  progress={percentage / 100}
                  color={getCategoryColor(cat)}
                  style={styles.progress}
                />
                <Text variant="bodySmall" style={styles.percentage}>
                  {percentage.toFixed(1)}% of total
                </Text>
              </GlassCard>
            );
          })}

          {stats.insights && stats.insights.length > 0 && (
            <>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Insights
              </Text>
              {stats.insights.map(insight => (
                <GlassCard key={insight.category} style={{ marginBottom: 12 }}>
                  <View style={styles.insightHeader}>
                    {insight.change > 0 ? (
                      <Text style={styles.insightIcon}>↑</Text>
                    ) : insight.change < 0 ? (
                      <Text style={styles.insightIcon}>↓</Text>
                    ) : (
                      <Text style={styles.insightIcon}>→</Text>
                    )}
                    <Text variant="titleMedium" style={styles.insightCategory}>
                      {insight.category}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.insightText}>
                    You spent ₹{insight.current.toFixed(2)} this month
                  </Text>
                  {insight.change > 0 ? (
                    <Text variant="bodyMedium" style={[styles.insightChange, { color: '#ef4444' }]}>
                      ↑ +{insight.change}% more than last month
                    </Text>
                  ) : insight.change < 0 ? (
                    <Text variant="bodyMedium" style={[styles.insightChange, { color: '#10b981' }]}>
                      ↓ {Math.abs(insight.change)}% less than last month
                    </Text>
                  ) : (
                    <Text variant="bodyMedium" style={[styles.insightChange, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                      → Same as last month
                    </Text>
                  )}
                </GlassCard>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  monthText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  total: {
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: 'white',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontWeight: 'bold',
  },
  categoryAmount: {
    fontWeight: 'bold',
    color: 'white',
  },
  progress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  percentage: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 24,
    color: 'white',
  },
  insightCategory: {
    fontWeight: 'bold',
    color: 'white',
  },
  insightText: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  insightChange: {
    fontWeight: 'bold',
  },
});
