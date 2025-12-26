import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  padding?: number;
}

export default function GlassCard({ 
  children, 
  intensity = 20, 
  style,
  padding = 16 
}: GlassCardProps) {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View 
      style={[
        styles.container, 
        {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          padding,
          ...(isWeb && {
            backdropFilter: `blur(${intensity}px)`,
            WebkitBackdropFilter: `blur(${intensity}px)`,
          } as any),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
