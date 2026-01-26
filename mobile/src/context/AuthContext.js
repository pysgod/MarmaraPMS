import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

import Constants from 'expo-constants';

const AuthContext = createContext();

// Geliştirme ortamına göre API URL'i
// Expo Go ile çalışırken hostUri bilgisayarın IP'sini verir
// Expo Go ile çalışırken hostUri bilgisayarın IP'sini verir
const API_URL = (() => {
  if (Constants.expoConfig?.hostUri) {
    const host = `http://${Constants.expoConfig.hostUri.split(':')[0]}:3001/api`;
    console.log('API URL detected from Expo Config:', host);
    return host;
  }
  
  // IP Config ile tespit edilen yerel IP
  const local_ip = 'http://192.168.1.100:3001/api';
  
  if (Platform.OS === 'android') {
    return local_ip; // Emulator (10.0.2.2) yerine doğrudan IP deneyelim
  }
  
  // Diğer durumlar (iOS Simulator, Web)
  return 'http://localhost:3001/api';
})();

console.log('Mobile App - Detected Platform:', Platform.OS);
console.log('Mobile App - Final API URL:', API_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('mobile_user');
      const storedToken = await AsyncStorage.getItem('mobile_token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to load storage data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (code) => {
    setIsLoading(true);
    try {
      console.log('Login attempt to:', `${API_URL}/mobile/auth/login`);
      
      const response = await fetch(`${API_URL}/mobile/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.employee;
        const authToken = data.data.token;

        setUser(userData);
        setToken(authToken);

        await AsyncStorage.setItem('mobile_user', JSON.stringify(userData));
        await AsyncStorage.setItem('mobile_token', authToken);
        
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Giriş başarısız' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: 'Sunucu bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('mobile_user');
      await AsyncStorage.removeItem('mobile_token');
      setUser(null);
      setToken(null);
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
