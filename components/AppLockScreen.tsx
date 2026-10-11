import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { verifyAppLockPassword } from '@/services/appLockService';

interface AppLockScreenProps {
  onUnlock: () => void;
}

export default function AppLockScreen({
  onUnlock,
}: AppLockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleUnlock() {
    if (!password.trim() || isVerifying) {
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyAppLockPassword(password);

      if (isValid) {
        setPassword('');
        onUnlock();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : 'Unable to verify the password. Please try again.',
      );
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tea Leaf Data Collector</Text>

        <Text style={styles.subtitle}>
          Enter the shared access password to continue.
        </Text>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError('');
          }}
          placeholder="Enter access password"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isVerifying}
          returnKeyType="done"
          onSubmitEditing={handleUnlock}
        />

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            (isVerifying || !password.trim()) && styles.buttonDisabled,
          ]}
          onPress={handleUnlock}
          disabled={isVerifying || !password.trim()}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Unlock App</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.body,
  },
  error: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.body,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
  },
});