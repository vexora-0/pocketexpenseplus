import React, { useState, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, error, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (error: any) {
      console.error('Register error:', error);
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
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.content}>
            <Text variant="displayMedium" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Start tracking your expenses today
            </Text>

            <GlassCard style={{ marginTop: 32, marginBottom: 16 }}>
              <View style={styles.form}>
                <TextInput
                  label="Name"
                  value={name}
                  onChangeText={setName}
                  mode="outlined"
                  style={styles.input}
                  textColor="white"
                  theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
                />

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  mode="outlined"
                  style={styles.input}
                  textColor="white"
                  theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
                />

                <TextInput
                  label="Password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  mode="outlined"
                  style={styles.input}
                  textColor="white"
                  theme={{ colors: { text: 'white', placeholder: 'rgba(255,255,255,0.6)', primary: 'white' } }}
                />

                {error && (
                  <Card style={styles.errorCard}>
                    <Card.Content>
                      <Text style={styles.errorText}>{error}</Text>
                    </Card.Content>
                  </Card>
                )}

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  disabled={loading || !name || !email || !password || password.length < 6}
                  loading={loading}
                  style={styles.button}
                  buttonColor="white"
                  textColor="black"
                >
                  Register
                </Button>
              </View>
            </GlassCard>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={styles.footerText}>Already have an account? </Text>
              <Text
                variant="bodyMedium"
                style={styles.link}
                onPress={() => navigation.navigate('Login')}
              >
                Login
              </Text>
            </View>
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
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '900',
    marginBottom: 8,
    color: 'white',
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff6b6b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  link: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: 'white',
  },
});
