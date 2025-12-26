import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      <Text variant="headlineSmall" style={styles.text}>
        Loading...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    fontWeight: '700',
    color: 'white',
  },
});
