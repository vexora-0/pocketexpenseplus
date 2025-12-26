import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text variant="displayMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join PocketExpense+ today
          </Text>

          <View style={styles.form}>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
              textColor="white"
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor="white"
              theme={{
                colors: { onSurfaceVariant: "rgba(255, 255, 255, 0.6)" },
              }}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              textColor="white"
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor="white"
              theme={{
                colors: { onSurfaceVariant: "rgba(255, 255, 255, 0.6)" },
              }}
            />
            <TextInput
              label="Password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              textColor="white"
              outlineColor="rgba(255, 255, 255, 0.3)"
              activeOutlineColor="white"
              theme={{
                colors: { onSurfaceVariant: "rgba(255, 255, 255, 0.6)" },
              }}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor="white"
              textColor="black"
            >
              Register
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Login")}
              textColor="white"
              style={styles.linkButton}
            >
              Already have an account? Login
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 48,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 16,
  },
});
