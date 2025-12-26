import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
  dark: true,
  colors: {
    primary: '#ffffff',
    background: '#000000',
    card: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    border: 'rgba(255, 255, 255, 0.2)',
    notification: '#ffffff',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <ExpenseProvider>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <AppNavigator />
          </ExpenseProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

