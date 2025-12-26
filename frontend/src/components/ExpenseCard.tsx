import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { Expense } from '../types';
import GlassCard from './GlassCard';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

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

export default function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const categoryColor = getCategoryColor(expense.category);
  const isPending = expense._id?.startsWith('pending_');

  return (
    <GlassCard style={{ marginBottom: 12 }}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryRow}>
            <Text variant="titleMedium" style={[styles.category, { color: categoryColor }]}>
              {expense.category}
            </Text>
            {isPending && (
              <Chip
                style={styles.pendingChip}
                textStyle={styles.pendingText}
              >
                Pending
              </Chip>
            )}
          </View>
          <View style={styles.actions}>
            <Button
              icon="pencil"
              mode="text"
              onPress={onEdit}
              textColor="#3b82f6"
              compact
            />
            <Button
              icon="delete"
              mode="text"
              onPress={onDelete}
              textColor="#ef4444"
              compact
            />
          </View>
        </View>
        <Text variant="displaySmall" style={styles.amount}>
          ₹{expense.amount.toFixed(2)}
        </Text>
        <Text variant="bodyMedium" style={styles.details}>
          {expense.paymentMethod} • {new Date(expense.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
        {expense.description && (
          <Text variant="bodySmall" style={styles.description}>
            {expense.description}
          </Text>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  category: {
    fontWeight: 'bold',
  },
  pendingChip: {
    backgroundColor: '#fff3cd',
    height: 24,
  },
  pendingText: {
    fontSize: 10,
    color: '#f59e0b',
  },
  actions: {
    flexDirection: 'row',
  },
  amount: {
    fontWeight: 'bold',
    color: 'white',
  },
  details: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
});
