import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Hata yakalama
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Bazı warningleri gizle

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
