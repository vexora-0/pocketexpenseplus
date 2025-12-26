import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import GlassCard from './GlassCard';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <GlassCard>
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
        {message && (
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  message: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
