import React, { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import { useExpenses } from '../context/ExpenseContext';
import { Expense } from '../types';
import GlassCard from '../components/GlassCard';

const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const paymentMethods = ['Cash', 'Card', 'UPI', 'Online'];

export default function AddExpenseScreen({ navigation, route }: any) {
  const { addExpense, updateExpense } = useExpenses();
  const expense = route.params?.expense as Expense | undefined;

  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [category, setCategory] = useState(expense?.category || '');
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || '');
  const [date, setDate] = useState(
    expense?.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(expense?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !category || !paymentMethod) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    const expenseData: Omit<Expense, '_id'> = {
      amount: amountNum,
      category,
      paymentMethod,
      date,
      description: description || undefined,
    };

    try {
      if (expense?._id) {
        await updateExpense(expense._id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {expense ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <Button
            icon="close"
            mode="text"
            onPress={() => navigation.goBack()}
            compact
            textColor="white"
          />
        </View>

        <ScrollView style={{ flex: 1 }}>
          <View style={styles.content}>
            <GlassCard>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Amount *
              </Text>
              <TextInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                textColor="white"
                theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
              />
            </GlassCard>

            <GlassCard>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Category *
              </Text>
              <View style={styles.chips}>
                {categories.map(cat => (
                  <Chip
                    key={cat}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                    style={styles.chip}
                    selectedColor="white"
                    textStyle={category === cat ? styles.selectedChipText : styles.chipText}
                  >
                    {cat}
                  </Chip>
                ))}
              </View>
            </GlassCard>

            <GlassCard>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Payment Method *
              </Text>
              <View style={styles.chips}>
                {paymentMethods.map(method => (
                  <Chip
                    key={method}
                    selected={paymentMethod === method}
                    onPress={() => setPaymentMethod(method)}
                    style={styles.chip}
                    selectedColor="white"
                    textStyle={paymentMethod === method ? styles.selectedChipText : styles.chipText}
                  >
                    {method}
                  </Chip>
                ))}
              </View>
            </GlassCard>

            <GlassCard>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Date *
              </Text>
              <TextInput
                label="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                mode="outlined"
                style={styles.input}
                textColor="white"
                theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
              />
            </GlassCard>

            <GlassCard>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Description (Optional)
              </Text>
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                mode="outlined"
                style={styles.input}
                textColor="white"
                theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
              />
            </GlassCard>

            <Button
              mode="contained"
              onPress={handleSave}
              disabled={loading || !amount || !category || !paymentMethod}
              loading={loading}
              style={styles.saveButton}
              buttonColor="white"
              textColor="black"
            >
              {expense ? 'Update' : 'Save'} Expense
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'white',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chips: {
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
  saveButton: {
    marginTop: 8,
  },
});
