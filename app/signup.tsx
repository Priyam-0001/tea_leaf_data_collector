import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { verifyAppLockPassword } from '@/services/appLockService';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);

  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const isSubmitting = isLoading || isVerifyingPasscode;

  const handleSignup = async () => {
    if (
      !email.trim() ||
      !password ||
      !passcode
    ) {
      Alert.alert(
        'Missing Information',
        'Please enter your email, password and passcode.',
      );
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      // Step 1: Verify the shared research-team passcode.
      setIsVerifyingPasscode(true);

      let isValidPasscode: boolean;

      try {
        isValidPasscode = await verifyAppLockPassword(passcode);
      } finally {
        setIsVerifyingPasscode(false);
      }

      if (!isValidPasscode) {
        Alert.alert(
          'Invalid Passcode',
          'The passcode is incorrect. Please contact your research team.',
        );
        return;
      }

      // Step 2: Create the account only after successful verification.
      await signUp(email.trim(), password);

      setPasscode('');

      Alert.alert(
        'Registration Successful',
        'Your account has been created. You can now log in.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/login'),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        error instanceof Error
          ? error.message
          : 'Unable to verify the passcode or create your account.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View>
                <Text style={styles.title}>
                  Tea Leaf Data Collector
                </Text>

                <Text style={styles.subtitle}>
                  Register as an authorized data collector
                </Text>
              </View>
 
              <View style={styles.form}>
                <Text style={styles.label}>Email</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  returnKeyType="next"
                />

                <Text style={styles.label}>Password</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  returnKeyType="next"
                />

                <Text style={styles.label}>
                  Research Team Passcode
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter the shared passcode"
                  placeholderTextColor={COLORS.textSecondary}
                  value={passcode}
                  onChangeText={setPasscode}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />

                <ActionButton
                  label={
                    isVerifyingPasscode
                      ? 'Verifying Passcode...'
                      : isLoading
                        ? 'Creating Account...'
                        : 'Register'
                  }
                  onPress={handleSignup}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already registered?
                </Text>

                <Text
                  style={styles.link}
                  onPress={() => {
                    if (!isSubmitting) {
                      router.replace('/login');
                    }
                  }}
                >
                  Login
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },

  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },

  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  form: {
    gap: SPACING.sm,
  },

  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.input,
    color: COLORS.text,
  },

  footer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },

  footerText: {
    fontSize: FONT_SIZES.helper,
    color: COLORS.textSecondary,
  },

  link: {
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },

  scrollContent: {
    flexGrow: 1,
  },
});