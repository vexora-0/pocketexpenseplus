import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, StyleSheet, View, Platform } from 'react-native';
import { Text, Button, Card, TextInput, ProgressBar, Chip } from 'react-native-paper';
import { budgetService } from '../services/budgetService';
import { Budget } from '../types';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import EmptyState from '../components/EmptyState';
import GlassCard from '../components/GlassCard';
import * as Notifications from 'expo-notifications';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function BudgetScreen() {
  const { user } = useAuth();
  const { loadStats } = useExpenses();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [month, year, user]);

  useEffect(() => {
    if (budgets.length > 0) {
      checkOverspending();
    }
  }, [budgets]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetService.getAll(month, year);
      setBudgets(data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      Alert.alert('Validation Error', 'Please fill all fields');
      return;
    }

    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid budget amount');
      return;
    }

    setSaving(true);
    try {
      await budgetService.create({
        category: newCategory,
        limit,
        month,
        year,
      });
      setShowAdd(false);
      setNewCategory('');
      setNewLimit('');
      await loadBudgets();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create budget');
    } finally {
      setSaving(false);
    }
  };

  const checkOverspending = () => {
    if (Platform.OS === 'web') return;
    
    budgets.forEach(budget => {
      if (budget.exceeded && budget.percentage && budget.percentage > 100) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Budget Exceeded!',
            body: `You've exceeded your ${budget.category} budget by ${(budget.percentage - 100).toFixed(0)}%`,
          },
          trigger: null,
        }).catch(err => console.log('Notification error:', err));
      }
    });
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

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadBudgets}
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

          {showAdd && (
            <GlassCard style={{ marginBottom: 16 }}>
              <View style={styles.addForm}>
                <Text variant="titleLarge" style={styles.addTitle}>Add Budget</Text>
                <View style={styles.categoryChips}>
                  {categories.map(cat => (
                    <Chip
                      key={cat}
                      selected={newCategory === cat}
                      onPress={() => setNewCategory(cat)}
                      style={styles.chip}
                      selectedColor="white"
                      textStyle={newCategory === cat ? styles.selectedChipText : styles.chipText}
                    >
                      {cat}
                    </Chip>
                  ))}
                </View>
                <TextInput
                  label="Budget Limit"
                  value={newLimit}
                  onChangeText={setNewLimit}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  textColor="white"
                  theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
                />
                <View style={styles.addButtons}>
                  <Button
                    mode="contained"
                    onPress={handleAddBudget}
                    disabled={saving || !newCategory || !newLimit}
                    loading={saving}
                    style={styles.addButton}
                    buttonColor="white"
                    textColor="black"
                  >
                    Add
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setShowAdd(false)}
                    textColor="white"
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            </GlassCard>
          )}

          {!showAdd && (
            <Button
              mode="contained"
              icon="plus"
              onPress={() => setShowAdd(true)}
              style={styles.addButton}
              buttonColor="white"
              textColor="black"
            >
              Add Budget
            </Button>
          )}

          {budgets.length === 0 ? (
            <EmptyState
              title="No budgets set"
              message="Create a budget to track your spending limits"
            />
          ) : (
            budgets.map(budget => (
              <GlassCard key={budget._id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <View style={styles.budgetHeader}>
                    <Text variant="titleLarge" style={styles.budgetCategory}>
                      {budget.category}
                    </Text>
                    {budget.exceeded && (
                      <Chip icon="alert" style={styles.alertChip} textStyle={styles.alertChipText}>
                        Exceeded!
                      </Chip>
                    )}
                  </View>

                  <View style={styles.budgetInfo}>
                    <View>
                      <Text variant="bodyMedium" style={styles.budgetLabel}>
                        Limit: ₹{budget.limit.toFixed(2)}
                      </Text>
                      <Text variant="bodyMedium" style={styles.budgetLabel}>
                        Spent: ₹{budget.spent?.toFixed(2) || '0.00'}
                      </Text>
                      <Text variant="bodyMedium" style={styles.budgetLabel}>
                        Remaining: ₹{budget.remaining?.toFixed(2) || budget.limit.toFixed(2)}
                      </Text>
                    </View>
                    <Text
                      variant="displaySmall"
                      style={[styles.percentage, { color: getBudgetColor(budget.percentage || 0) }]}
                    >
                      {budget.percentage}%
                    </Text>
                  </View>

                  <ProgressBar
                    progress={Math.min((budget.percentage || 0) / 100, 1)}
                    color={getBudgetColor(budget.percentage || 0)}
                    style={styles.progress}
                  />

                  <Button
                    mode="outlined"
                    icon="delete"
                    onPress={async () => {
                      Alert.alert(
                        'Delete Budget',
                        `Are you sure you want to delete the ${budget.category} budget?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await budgetService.delete(budget._id!);
                                await loadBudgets();
                              } catch (error) {
                                Alert.alert('Error', 'Failed to delete budget');
                              }
                            },
                          },
                        ]
                      );
                    }}
                    style={styles.deleteButton}
                    textColor="#ef4444"
                  >
                    Delete
                  </Button>
                </Card.Content>
              </GlassCard>
            ))
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
  addForm: {
    gap: 16,
  },
  addTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipText: {
    color: 'white',
  },
  selectedChipText: {
    color: 'black',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    flex: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetCategory: {
    fontWeight: 'bold',
    color: 'white',
  },
  alertChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  alertChipText: {
    color: '#ef4444',
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  percentage: {
    fontWeight: 'bold',
  },
  progress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
});
