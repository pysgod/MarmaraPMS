import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBarStyle, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Shield, AlertCircle } from 'lucide-react-native';
import Colors from '../theme/Colors';
import PinInput from '../components/PinInput';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (code) => {
    setLoading(true);
    setError('');
    
    // Simulate slight delay for better UX
    setTimeout(async () => {
      const result = await login(code);
      if (!result.success) {
        setError(result.message);
        setLoading(false);
      }
      // Success is handled by context state change
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Shield size={64} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Marmara PMS</Text>
          <Text style={styles.subtitle}>Personel Mobil Giriş</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.instruction}>
            4 haneli aktivasyon kodunuzu girin
          </Text>

          <PinInput 
            length={4} 
            onComplete={handleLogin}
            disabled={loading}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Giriş yapılıyor...</Text>
            </View>
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Kodunuz yok mu?</Text>
          <Text style={styles.footerSubText}>Yöneticinizle iletişime geçin</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  instruction: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerSubText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
