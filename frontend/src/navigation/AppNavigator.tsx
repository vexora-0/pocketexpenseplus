import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ExpenseProvider } from '../context/ExpenseContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import InsightsScreen from '../screens/InsightsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import LoadingScreen from '../components/LoadingScreen';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="wallet" size={size} color={color} />,
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" size={size} color={color} />,
          tabBarLabel: 'Insights',
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="target" size={size} color={color} />,
          tabBarLabel: 'Budget',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticatedNavigator() {
  return (
    <ExpenseProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </ExpenseProvider>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? <AuthNavigator /> : <AuthenticatedNavigator />}
    </NavigationContainer>
  );
}
