import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, Button, Card, TextInput, Chip } from "react-native-paper";
import { budgetAPI } from "../services/api";
import { Budget, CATEGORIES } from "../types";

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [saving, setSaving] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getAll(currentMonth, currentYear);
      setBudgets(response.data);
    } catch (error) {
      console.error("Failed to load budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      Alert.alert("Error", "Please select a category and enter a limit");
      return;
    }

    if (isNaN(parseFloat(newLimit)) || parseFloat(newLimit) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setSaving(true);
      await budgetAPI.create({
        category: newCategory,
        limit: parseFloat(newLimit),
        month: currentMonth,
        year: currentYear,
      });
      setNewCategory("");
      setNewLimit("");
      setShowAdd(false);
      await loadBudgets();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add budget"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    Alert.alert(
      "Delete Budget",
      "Are you sure you want to delete this budget?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await budgetAPI.delete(id);
              await loadBudgets();
            } catch (error) {
              Alert.alert("Error", "Failed to delete budget");
            }
          },
        },
      ]
    );
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "#ef4444";
    if (percentage >= 80) return "#f59e0b";
    return "#10b981";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Budgets
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadBudgets}
            tintColor="white"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {budgets.length === 0 && !showAdd && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No budgets set
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Set a budget to track your spending
            </Text>
          </View>
        )}

        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const remaining = budget.limit - budget.spent;

          return (
            <Card key={budget._id} style={styles.card}>
              <Card.Content>
                <View style={styles.budgetHeader}>
                  <Text variant="titleLarge" style={styles.category}>
                    {budget.category}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.status,
                      { color: getProgressColor(budget.spent, budget.limit) },
                    ]}
                  >
                    {percentage.toFixed(0)}%
                  </Text>
                </View>

                <View style={styles.amounts}>
                  <View>
                    <Text variant="bodySmall" style={styles.label}>
                      Spent
                    </Text>
                    <Text variant="titleMedium" style={styles.amount}>
                      ₹{budget.spent.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text variant="bodySmall" style={styles.label}>
                      Limit
                    </Text>
                    <Text variant="titleMedium" style={styles.amount}>
                      ₹{budget.limit.toFixed(2)}
                    </Text>
                  </View>
                  <View>
                    <Text variant="bodySmall" style={styles.label}>
                      Remaining
                    </Text>
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.amount,
                        { color: remaining >= 0 ? "#10b981" : "#ef4444" },
                      ]}
                    >
                      ₹{remaining.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: getProgressColor(
                          budget.spent,
                          budget.limit
                        ),
                      },
                    ]}
                  />
                </View>

                <Button
                  mode="text"
                  icon="delete"
                  onPress={() => handleDeleteBudget(budget._id)}
                  textColor="#ef4444"
                  style={styles.deleteButton}
                >
                  Delete
                </Button>
              </Card.Content>
            </Card>
          );
        })}

        {showAdd && (
          <Card style={styles.addCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.addTitle}>
                Add New Budget
              </Text>

              <Text variant="titleSmall" style={styles.inputLabel}>
                Category
              </Text>
              <View style={styles.chips}>
                {CATEGORIES.map((cat) => {
                  const hasBudget = budgets.some((b) => b.category === cat);
                  return (
                    <Chip
                      key={cat}
                      selected={newCategory === cat}
                      onPress={() => !hasBudget && setNewCategory(cat)}
                      disabled={hasBudget}
                      style={[
                        styles.chip,
                        newCategory === cat && styles.selectedChip,
                      ]}
                      textStyle={
                        newCategory === cat
                          ? styles.selectedChipText
                          : styles.chipText
                      }
                      selectedColor="black"
                    >
                      {cat}
                    </Chip>
                  );
                })}
              </View>

              <TextInput
                label="Monthly Limit"
                value={newLimit}
                onChangeText={setNewLimit}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                textColor="white"
                outlineColor="rgba(255, 255, 255, 0.3)"
                activeOutlineColor="white"
                theme={{
                  colors: { onSurfaceVariant: "rgba(255, 255, 255, 0.6)" },
                }}
                left={
                  <TextInput.Affix text="₹" textStyle={{ color: "white" }} />
                }
              />

              <View style={styles.addActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowAdd(false);
                    setNewCategory("");
                    setNewLimit("");
                  }}
                  textColor="white"
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddBudget}
                  loading={saving}
                  disabled={saving}
                  buttonColor="white"
                  textColor="black"
                  style={styles.saveButton}
                >
                  Add
                </Button>
              </View>
            </Card.Content>
          </Card>
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
      </ScrollView>
    </View>
  );
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
  },
  scrollContent: {
    padding: 16,
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
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  category: {
    color: "white",
    fontWeight: "bold",
  },
  status: {
    fontWeight: "600",
  },
  amounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },
  amount: {
    color: "white",
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  addCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  addTitle: {
    color: "white",
    marginBottom: 16,
    fontWeight: "bold",
  },
  inputLabel: {
    color: "white",
    marginBottom: 12,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
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
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  addActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: "white",
  },
  saveButton: {
    flex: 1,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
