import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../theme/Colors';

export default function PlaceholderScreen({ route }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{route.name} Sayfası</Text>
      <Text style={styles.subtext}>Yakında eklenecek...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    color: Colors.textSecondary,
    marginTop: 8,
  }
});
