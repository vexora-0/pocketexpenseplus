import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, Button, Card, IconButton, FAB } from "react-native-paper";
import { useExpenses } from "../context/ExpenseContext";
import { Expense, CATEGORIES } from "../types";

type Props = {
  navigation: any;
};

export default function ExpensesScreen({ navigation }: Props) {
  const { expenses, loading, loadExpenses, deleteExpense } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  useEffect(() => {
    loadExpenses();
  }, []);

  const filteredExpenses = expenses.filter(
    (e) => !selectedCategory || e.category === selectedCategory
  );

  const groupedExpenses = groupExpenses(filteredExpenses, viewMode);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete expense");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Expenses
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.filters}>
          <Button
            mode={viewMode === "daily" ? "contained" : "outlined"}
            onPress={() => setViewMode("daily")}
            style={styles.filterButton}
            buttonColor={viewMode === "daily" ? "white" : "transparent"}
            textColor={viewMode === "daily" ? "black" : "white"}
          >
            Daily
          </Button>
          <Button
            mode={viewMode === "monthly" ? "contained" : "outlined"}
            onPress={() => setViewMode("monthly")}
            style={styles.filterButton}
            buttonColor={viewMode === "monthly" ? "white" : "transparent"}
            textColor={viewMode === "monthly" ? "black" : "white"}
          >
            Monthly
          </Button>
        </View>

        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categories}>
              <Button
                mode={!selectedCategory ? "contained" : "outlined"}
                onPress={() => setSelectedCategory("")}
                style={styles.categoryButton}
                buttonColor={!selectedCategory ? "white" : "transparent"}
                textColor={!selectedCategory ? "black" : "white"}
              >
                All
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  mode={selectedCategory === cat ? "contained" : "outlined"}
                  onPress={() => setSelectedCategory(cat)}
                  style={styles.categoryButton}
                  buttonColor={
                    selectedCategory === cat ? "white" : "transparent"
                  }
                  textColor={selectedCategory === cat ? "black" : "white"}
                >
                  {cat}
                </Button>
              ))}
            </View>
          </ScrollView>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadExpenses}
              tintColor="white"
            />
          }
          showsVerticalScrollIndicator={false}
          style={styles.expensesScrollView}
        >
          {Object.keys(groupedExpenses).length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No expenses yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Tap the + button to add your first expense
              </Text>
            </View>
          ) : (
            Object.keys(groupedExpenses).map((group) => (
              <View key={group} style={styles.group}>
                <Text variant="titleMedium" style={styles.groupTitle}>
                  {group}
                </Text>
                {groupedExpenses[group].map((expense) => (
                  <Card key={expense._id} style={styles.card}>
                    <Card.Content>
                      <View style={styles.expenseRow}>
                        <View style={styles.expenseInfo}>
                          <Text
                            variant="titleMedium"
                            style={styles.expenseAmount}
                          >
                            ₹{expense.amount.toFixed(2)}
                          </Text>
                          <Text
                            variant="bodyMedium"
                            style={styles.expenseCategory}
                          >
                            {expense.category} • {expense.paymentMethod}
                          </Text>
                          {expense.note && (
                            <Text
                              variant="bodySmall"
                              style={styles.expenseNote}
                            >
                              {expense.note}
                            </Text>
                          )}
                          {expense.pendingSync && (
                            <Text
                              variant="bodySmall"
                              style={styles.pendingSync}
                            >
                              Pending sync
                            </Text>
                          )}
                        </View>
                        <View style={styles.actions}>
                          <IconButton
                            icon="pencil"
                            size={20}
                            iconColor="white"
                            onPress={() =>
                              navigation.navigate("AddExpense", { expense })
                            }
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            iconColor="#ef4444"
                            onPress={() => handleDelete(expense._id)}
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        color="black"
        onPress={() => navigation.navigate("AddExpense")}
      />
    </View>
  );
}

function groupExpenses(expenses: Expense[], mode: "daily" | "monthly") {
  const grouped: { [key: string]: Expense[] } = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    let key = "";

    if (mode === "daily") {
      key = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else {
      key = date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(expense);
  });

  return grouped;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#000000",
  },
  headerTitle: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    borderColor: "white",
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categories: {
    flexDirection: "row",
    gap: 8,
  },
  categoryButton: {
    minWidth: 80,
    borderColor: "white",
  },
  expensesScrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "white",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    color: "white",
    marginBottom: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 12,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmount: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  expenseCategory: {
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  expenseNote: {
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
  },
  pendingSync: {
    color: "#fbbf24",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
  },
});
