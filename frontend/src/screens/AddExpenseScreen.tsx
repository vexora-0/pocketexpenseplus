import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Chip, IconButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useExpenses } from "../context/ExpenseContext";
import { CATEGORIES, PAYMENT_METHODS } from "../types";

type Props = {
  navigation: any;
  route: any;
};

export default function AddExpenseScreen({ navigation, route }: Props) {
  const { addExpense, updateExpense } = useExpenses();
  const expense = route.params?.expense;

  const [amount, setAmount] = useState(expense?.amount.toString() || "");
  const [category, setCategory] = useState(expense?.category || "");
  const [paymentMethod, setPaymentMethod] = useState(
    expense?.paymentMethod || ""
  );
  const [date, setDate] = useState(
    expense ? new Date(expense.date) : new Date()
  );
  const [note, setNote] = useState(expense?.note || "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !category || !paymentMethod) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const expenseData = {
        amount: parseFloat(amount),
        category,
        paymentMethod,
        date: date.toISOString(),
        note,
      };

      if (expense) {
        await updateExpense(expense._id, expenseData);
      } else {
        await addExpense(expenseData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          iconColor="white"
          onPress={() => navigation.goBack()}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          {expense ? "Edit Expense" : "Add Expense"}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Amount *"
          value={amount}
          onChangeText={setAmount}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          textColor="white"
          outlineColor="rgba(255, 255, 255, 0.3)"
          activeOutlineColor="white"
          theme={{ colors: { onSurfaceVariant: "rgba(255, 255, 255, 0.6)" } }}
          left={<TextInput.Affix text="₹" textStyle={{ color: "white" }} />}
        />

        <Text variant="titleSmall" style={styles.label}>
          Category *
        </Text>
        <View style={styles.chips}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, category === cat && styles.selectedChip]}
              textStyle={
                category === cat ? styles.selectedChipText : styles.chipText
              }
              selectedColor="black"
            >
              {cat}
            </Chip>
          ))}
        </View>

        <Text variant="titleSmall" style={styles.label}>
          Payment Method *
        </Text>
        <View style={styles.chips}>
          {PAYMENT_METHODS.map((method) => (
            <Chip
              key={method}
              selected={paymentMethod === method}
              onPress={() => setPaymentMethod(method)}
              style={[
                styles.chip,
                paymentMethod === method && styles.selectedChip,
              ]}
              textStyle={
                paymentMethod === method
                  ? styles.selectedChipText
                  : styles.chipText
              }
              selectedColor="black"
            >
              {method}
            </Chip>
          ))}
        </View>

        <Text variant="titleSmall" style={styles.label}>
          Date
        </Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          textColor="white"
          style={styles.dateButton}
        >
          {date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, styles.noteInput]}
          textColor="white"
          outlineColor="rgba(255, 255, 255, 0.3)"
          activeOutlineColor="white"
          theme={{ colors: { onSurfaceVariant: "rgba(255, 255, 255, 0.6)" } }}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor="white"
          textColor="black"
        >
          {expense ? "Save Changes" : "Add Expense"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  noteInput: {
    marginTop: 8,
  },
  label: {
    color: "white",
    marginBottom: 12,
    marginTop: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedChip: {
    backgroundColor: "white",
  },
  chipText: {
    color: "white",
  },
  selectedChipText: {
    color: "black",
  },
  dateButton: {
    borderColor: "white",
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 6,
  },
});
