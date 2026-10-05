import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = useAuthStore((state) => state.signIn);
    const resetPassword = useAuthStore((state) => state.resetPassword);
    const isLoading = useAuthStore((state) => state.isLoading);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing Information', 'Please enter your email and password.');
            return;
        }

        try {
            await signIn(email, password);
            router.replace('/');
        } catch (error) {
            Alert.alert(
                'Login Failed',
                error instanceof Error ? error.message : 'Unable to login.'
            );
        }
    };
    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert(
                'Email Required',
                'Please enter your email address first.'
            );
            return;
        }

        try {
            await resetPassword(email);

            Alert.alert(
                'Password Reset',
                'A password reset link has been sent to your email.'
            );
        } catch (error) {
            Alert.alert(
                'Reset Failed',
                error instanceof Error
                    ? error.message
                    : 'Unable to send password reset email.'
            );
        }
    };

    return (
        <SafeAreaView style={styles.page}>
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.container}>
                    <View>
                        <Text style={styles.title}>Tea Leaf Data Collector</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
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
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={COLORS.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <Text
                            style={styles.forgotPassword}
                            onPress={handleForgotPassword}
                        >
                            Forgot Password?
                        </Text>
                        <ActionButton
                            label={isLoading ? 'Logging in...' : 'Login'}
                            onPress={handleLogin}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>

                        <Text
                            style={styles.link}
                            onPress={() => router.replace('/signup')}
                        >
                            Create Account
                        </Text>
                    </View>
                </View>
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
        fontSize: FONT_SIZES.body,
        color: COLORS.textSecondary,
    },

    link: {
        fontSize: FONT_SIZES.body,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    forgotPassword: {
        fontSize: FONT_SIZES.helper,
        fontWeight: '600',
        color: COLORS.primary,
        textAlign: 'right',
        marginTop: SPACING.xs,
    },
});