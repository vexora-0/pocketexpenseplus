import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, StyleSheet, View } from 'react-native';
import { Text, Button, Card, Chip, FAB } from 'react-native-paper';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { Expense } from '../types';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';
import GlassCard from '../components/GlassCard';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

export default function ExpensesScreen({ navigation }: any) {
  const { expenses, loading, loadExpenses, deleteExpense } = useExpenses();
  const { logout, user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'daily' | 'monthly'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const getFilteredExpenses = () => {
    let filtered = expenses;
    const now = new Date();
    
    if (filter === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(e => new Date(e.date) >= today);
    } else if (filter === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(e => new Date(e.date) >= monthStart);
    }

    if (selectedCategory) {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    return filtered;
  };

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete this ${expense.category} expense of ₹${expense.amount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(expense._id!);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const filteredExpenses = getFilteredExpenses();
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="bodyMedium" style={styles.welcomeText}>
              Welcome back,
            </Text>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.name || 'User'}
            </Text>
          </View>
          <Button
            mode="contained"
            icon="logout"
            onPress={logout}
            buttonColor="rgba(239, 68, 68, 0.3)"
            textColor="white"
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>

        <Card style={styles.totalCard}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.totalLabel}>
              Total Expenses
            </Text>
            <Text variant="displaySmall" style={styles.totalAmount}>
              ₹{total.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </GlassCard>

      <View style={styles.content}>
        <View style={styles.filters}>
          {['all', 'daily', 'monthly'].map((f) => (
            <Button
              key={f}
              mode={filter === f ? 'contained' : 'outlined'}
              onPress={() => setFilter(f as any)}
              style={styles.filterButton}
              buttonColor={filter === f ? 'white' : 'transparent'}
              textColor={filter === f ? 'black' : 'white'}
            >
              {f === 'all' ? 'All' : f === 'daily' ? 'Today' : 'Month'}
            </Button>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <View style={styles.categories}>
            <Chip
              selected={!selectedCategory}
              onPress={() => setSelectedCategory('')}
              style={styles.categoryChip}
              selectedColor="white"
              textStyle={!selectedCategory ? styles.selectedChipText : styles.chipText}
            >
              All
            </Chip>
            {categories.map(cat => (
              <Chip
                key={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
                style={styles.categoryChip}
                selectedColor="white"
                textStyle={selectedCategory === cat ? styles.selectedChipText : styles.chipText}
              >
                {cat}
              </Chip>
            ))}
          </View>
        </ScrollView>

        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={loadExpenses}
              tintColor="white"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredExpenses.length === 0 ? (
            <EmptyState
              title="No expenses found"
              message={selectedCategory ? `No expenses in ${selectedCategory} category` : 'Start adding expenses to track your spending'}
            />
          ) : (
            <View style={styles.expensesList}>
              {filteredExpenses.map(expense => (
                <ExpenseCard
                  key={expense._id}
                  expense={expense}
                  onEdit={() => navigation.navigate('AddExpense', { expense })}
                  onDelete={() => handleDelete(expense)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
        color="black"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userName: {
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    borderRadius: 8,
  },
  totalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  totalAmount: {
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  categoryScroll: {
    paddingRight: 16,
  },
  categories: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipText: {
    color: 'white',
  },
  selectedChipText: {
    color: 'black',
  },
  expensesList: {
    gap: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
});
