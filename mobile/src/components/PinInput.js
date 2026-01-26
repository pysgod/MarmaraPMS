import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Colors from '../theme/Colors';

const PinInput = ({ length = 4, onComplete, disabled }) => {
  const [code, setCode] = useState(new Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    // Sadece rakam
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Doluysa bir sonrakine geç
    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    // Kod tamamlandı mı?
    if (newCode.every((digit) => digit !== '') && text) {
      onComplete && onComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    // Backspace: boşsa bir öncekine geç
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <View key={index} style={[
          styles.inputContainer,
          digit ? styles.inputFilled : null
        ]}>
          <TextInput
            ref={(ref) => inputs.current[index] = ref}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!disabled}
            selectTextOnFocus
            caretHidden
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  inputContainer: {
    width: 56,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputFilled: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
  },
  input: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    width: '100%',
    height: '100%',
    textAlign: 'center',
  },
});

export default PinInput;
