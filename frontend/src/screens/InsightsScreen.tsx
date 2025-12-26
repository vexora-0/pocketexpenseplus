import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Modal as RNModal,
} from "react-native";
import {
  Text,
  Button,
  Card,
  IconButton,
  Portal,
  Modal,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { analyticsAPI } from "../services/api";
import { MonthlyStats } from "../types";

export default function InsightsScreen() {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    loadStats(month, year);
  }, [month, year]);

  const loadStats = async (m: number, y: number) => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getMonthly(m, y);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth = month;
    let newYear = year;

    if (direction === "prev") {
      newMonth = month === 1 ? 12 : month - 1;
      newYear = month === 1 ? year - 1 : year;
    } else {
      newMonth = month === 12 ? 1 : month + 1;
      newYear = month === 12 ? year + 1 : year;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const handleDateSelect = () => {
    setMonth(tempDate.getMonth() + 1);
    setYear(tempDate.getFullYear());
    setShowDatePicker(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Food: "#ef4444",
      Travel: "#3b82f6",
      Shopping: "#8b5cf6",
      Bills: "#f59e0b",
      Entertainment: "#ec4899",
      Health: "#10b981",
      Education: "#06b6d4",
      Others: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const monthName = new Date(year, month - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Insights
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.monthNav}>
          <IconButton
            icon="chevron-left"
            size={24}
            iconColor="white"
            onPress={() => navigateMonth("prev")}
          />
          <Button
            mode="text"
            onPress={() => setShowDatePicker(true)}
            textColor="white"
          >
            {monthName}
          </Button>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor="white"
            onPress={() => navigateMonth("next")}
          />
        </View>

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
          {stats && (
            <>
              <Card style={styles.totalCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.totalLabel}>
                    Total Spent
                  </Text>
                  <Text variant="displaySmall" style={styles.totalAmount}>
                    ₹{stats.totalSpent.toFixed(2)}
                  </Text>
                </Card.Content>
              </Card>

              {stats.insights && stats.insights.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Key Insights
                  </Text>
                  {stats.insights.map((insight, index) => (
                    <Card key={index} style={styles.insightCard}>
                      <Card.Content>
                        <Text variant="bodyLarge" style={styles.insightText}>
                          {insight}
                        </Text>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}

              {stats.categoryTotals && stats.categoryTotals.length > 0 && (
                <View style={styles.section}>
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Category Breakdown
                  </Text>
                  {stats.categoryTotals.map((cat) => (
                    <Card key={cat.category} style={styles.categoryCard}>
                      <Card.Content>
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryInfo}>
                            <Text
                              variant="titleMedium"
                              style={[
                                styles.categoryName,
                                { color: getCategoryColor(cat.category) },
                              ]}
                            >
                              {cat.category}
                            </Text>
                            <Text variant="bodySmall" style={styles.percentage}>
                              {cat.percentage.toFixed(1)}% of total
                            </Text>
                          </View>
                          <Text
                            variant="headlineSmall"
                            style={styles.categoryAmount}
                          >
                            ₹{cat.total.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${cat.percentage}%`,
                                backgroundColor: getCategoryColor(cat.category),
                              },
                            ]}
                          />
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              )}
            </>
          )}

          {!loading && (!stats || stats.totalSpent === 0) && (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No expenses for this month
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {Platform.OS === "ios" ? (
        <Portal>
          <Modal
            visible={showDatePicker}
            onDismiss={() => setShowDatePicker(false)}
            contentContainerStyle={styles.datePickerModal}
          >
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                }
              }}
            />
            <View style={styles.modalButtons}>
              <Button
                onPress={() => setShowDatePicker(false)}
                textColor="white"
              >
                Cancel
              </Button>
              <Button onPress={handleDateSelect} textColor="white">
                Done
              </Button>
            </View>
          </Modal>
        </Portal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setMonth(selectedDate.getMonth() + 1);
                setYear(selectedDate.getFullYear());
              }
            }}
          />
        )
      )}
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
    padding: 16,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 24,
  },
  totalLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
  },
  totalAmount: {
    color: "white",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "white",
    marginBottom: 12,
    fontWeight: "600",
  },
  insightCard: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    marginBottom: 12,
  },
  insightText: {
    color: "white",
  },
  categoryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  percentage: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  categoryAmount: {
    color: "white",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  datePickerModal: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
