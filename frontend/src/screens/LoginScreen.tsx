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

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Please check your credentials"
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
            Pocket{"\n"}Expense{"\n"}+
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Track your expenses, gain insights
          </Text>

          <View style={styles.form}>
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
              label="Password"
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
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor="white"
              textColor="black"
            >
              Login
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Register")}
              textColor="white"
              style={styles.linkButton}
            >
              Don't have an account? Register
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
    lineHeight: 60,
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
