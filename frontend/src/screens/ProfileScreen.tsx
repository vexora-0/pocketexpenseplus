import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Profile
        </Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              Name
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.name}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              Email
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {user?.email}
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#ef4444"
          textColor="white"
          icon="logout"
        >
          Logout
        </Button>
      </View>
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
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  label: {
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
  },
  value: {
    color: "white",
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 6,
  },
});
