import { router } from 'expo-router';
import { ArrowLeft, BookOpen, Eye, EyeOff, KeyRound, Lock, Mail, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import packageJson from '@/package.json';
import { useAuthStore } from '@/store/authStore';

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
    navy:        '#0D1F3C',
    navyMid:     '#1E3A5F',
    blue:        '#3B6FD4',
    gold:        '#E5A820',
    goldDark:    '#B8841A',
    page:        '#F0F5FF',
    card:        '#FFFFFF',
    inputBg:     '#F7F9FF',
    inputBorder: '#D0DCEF',
    text:        '#0D1F3C',
    textMid:     '#3D5A80',
    textMuted:   '#7A90B8',
    textLight:   '#A8B9D4',
    link:        '#2563EB',
    white:       '#FFFFFF',
    btnPrimary:  '#1D3557',
    btnShadow:   '#0A1A30',
};

const LAST_UPDATED = '12 Nov 2026';

type AuthMode = 'password' | 'otp';

export default function LoginScreen() {
    const [authMode, setAuthMode]         = useState<AuthMode>('password');
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // ── OTP State for Sign-In with Code ──
    const [otpSent, setOtpSent]           = useState(false);
    const [otpCode, setOtpCode]           = useState('');
    const [isResending, setIsResending]   = useState(false);

    const signIn          = useAuthStore((s) => s.signIn);
    const sendSignInOtp   = useAuthStore((s) => s.sendSignInOtp);
    const verifySignInOtp = useAuthStore((s) => s.verifySignInOtp);
    const resetPassword   = useAuthStore((s) => s.resetPassword);
    const isLoading       = useAuthStore((s) => s.isLoading);
    const appVersion      = packageJson.version;

    const isSubmitting = isLoading || isResending;

    // ── 1. Standard Password Login ──
    const handleLoginPassword = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Missing Information', 'Please enter your email and password.');
            return;
        }
        try {
            await signIn(email, password);
            router.replace('/');
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unable to login.';
            if (msg.toLowerCase().includes('email not confirmed')) {
                Alert.alert(
                    'Email Not Verified',
                    'Your email address has not been verified yet. Would you like us to send a 6-digit verification code to your email?',
                    [
                        {
                            text: 'Send Verification Code',
                            onPress: () => {
                                setAuthMode('otp');
                                handleSendCode();
                            },
                        },
                        { text: 'Cancel', style: 'cancel' },
                    ]
                );
                return;
            }
            Alert.alert('Login Failed', msg);
        }
    };

    // ── 2. Request OTP Code for Email Sign-In ──
    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert('Email Required', 'Please enter your email address to receive a sign-in code.');
            return;
        }
        try {
            await sendSignInOtp(email.trim());
            router.push({
                pathname: '/verify-signin',
                params: { email: email.trim() },
            });
        } catch (error) {
            Alert.alert(
                'Unable to Send Code',
                error instanceof Error ? error.message : 'Could not send verification code.'
            );
        }
    };

    // ── 3. Verify OTP and Complete Sign-In ──
    const handleVerifyOtp = async () => {
        if (!otpCode.trim() || otpCode.trim().length < 6) {
            Alert.alert('Code Required', 'Please enter the 6-digit sign-in code sent to your email.');
            return;
        }
        try {
            await verifySignInOtp(email.trim(), otpCode.trim());
            router.replace('/');
        } catch (error) {
            Alert.alert(
                'Sign-In Failed',
                error instanceof Error ? error.message : 'Invalid code. Please check and try again.'
            );
        }
    };

    // ── 4. Resend Code ──
    const handleResendCode = async () => {
        try {
            setIsResending(true);
            await sendSignInOtp(email.trim());
            Alert.alert('Code Resent', `A fresh 6-digit sign-in code has been sent to ${email.trim()}.`);
        } catch (error) {
            Alert.alert('Resend Failed', error instanceof Error ? error.message : 'Could not resend code.');
        } finally {
            setIsResending(false);
        }
    };

    // ── 5. Forgot Password Reset Email ──
    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Email Required', 'Please enter your email address first.');
            return;
        }
        try {
            await resetPassword(email);
            Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
        } catch (error) {
            Alert.alert('Reset Failed', error instanceof Error ? error.message : 'Unable to send reset email.');
        }
    };

    return (
        <SafeAreaView style={s.page}>
            <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={s.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── TOP BRANDING SECTION ───────────────────────── */}
                    <View style={s.topSection}>
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={s.logo}
                            resizeMode="contain"
                        />
                        <Text style={s.institute}>Tocklai Tea Research Institute</Text>
                        <Text style={s.appName}>PAATSUTRA</Text>
                        <Text style={s.tagline}>Field Research Companion</Text>

                        {/* Version badge + User Guide */}
                        <View style={s.metaRow}>
                            <View style={s.versionBadge}>
                                <Text style={s.versionMain}>v {appVersion}</Text>
                                <View style={s.versionDot} />
                                <Text style={s.versionSub}>Last updated: {LAST_UPDATED}</Text>
                            </View>

                            <TouchableOpacity
                                style={s.guideBtn}
                                onPress={() => router.push('/guide')}
                                activeOpacity={0.75}
                            >
                                <BookOpen size={12} color={C.navyMid} />
                                <Text style={s.guideBtnText}>User Guide</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── FORM CARD ──────────────────────────────────── */}
                    <View style={s.card}>
                        {/* Tab Switcher: Password vs Email Code */}
                        <View style={s.tabContainer}>
                            <TouchableOpacity
                                style={[s.tabButton, authMode === 'password' && s.tabButtonActive]}
                                onPress={() => {
                                    setAuthMode('password');
                                    setOtpSent(false);
                                }}
                                activeOpacity={0.75}
                            >
                                <Lock size={15} color={authMode === 'password' ? C.navy : C.textMuted} />
                                <Text style={[s.tabText, authMode === 'password' && s.tabTextActive]}>
                                    Password
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[s.tabButton, authMode === 'otp' && s.tabButtonActive]}
                                onPress={() => setAuthMode('otp')}
                                activeOpacity={0.75}
                            >
                                <KeyRound size={15} color={authMode === 'otp' ? C.navy : C.textMuted} />
                                <Text style={[s.tabText, authMode === 'otp' && s.tabTextActive]}>
                                    Email Code
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={s.cardTitle}>
                            {authMode === 'password' ? 'Welcome Back' : 'Sign In with Code'}
                        </Text>
                        <Text style={s.cardSub}>
                            {authMode === 'password'
                                ? 'Sign in using your password'
                                : 'Enter your email to receive a 6-digit sign-in code'}
                        </Text>

                        {/* Email Field (Always visible) */}
                        <Text style={s.label}>Email Address</Text>
                        <View style={s.inputRow}>
                            <Mail size={19} color={C.textLight} style={s.iconL} />
                            <TextInput
                                style={s.input}
                                placeholder="your@email.com"
                                placeholderTextColor={C.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isSubmitting}
                                textContentType="emailAddress"
                                autoComplete="email"
                                returnKeyType={authMode === 'password' ? 'next' : 'done'}
                            />
                        </View>

                        {/* ── MODE 1: PASSWORD LOGIN ────────────────────── */}
                        {authMode === 'password' && (
                            <>
                                <Text style={[s.label, s.labelSpaced]}>Password</Text>
                                <View style={s.inputRow}>
                                    <Lock size={19} color={C.textLight} style={s.iconL} />
                                    <TextInput
                                        style={s.input}
                                        placeholder="Enter your password"
                                        placeholderTextColor={C.textLight}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!isSubmitting}
                                        textContentType="password"
                                        autoComplete="password"
                                        returnKeyType="done"
                                        onSubmitEditing={handleLoginPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword((v) => !v)}
                                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                    >
                                        {showPassword
                                            ? <EyeOff size={20} color={C.textMuted} />
                                            : <Eye    size={20} color={C.textMuted} />}
                                    </TouchableOpacity>
                                </View>
                                <Text style={s.hint}>💡 Save credentials in your phone's password manager</Text>

                                <View style={s.subActionsRow}>
                                    <TouchableOpacity onPress={() => setAuthMode('otp')} activeOpacity={0.7}>
                                        <Text style={s.switchModeText}>Sign in with Email Code</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                                        <Text style={s.forgotText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[s.btn, isSubmitting && s.btnDisabled]}
                                    onPress={handleLoginPassword}
                                    disabled={isSubmitting}
                                    activeOpacity={0.85}
                                >
                                    <Text style={s.btnText}>
                                        {isLoading ? 'Signing in…' : 'Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* ── MODE 2: OTP EMAIL CODE LOGIN ──────────────── */}
                        {authMode === 'otp' && (
                            <>
                                {!otpSent ? (
                                    <>
                                        <Text style={s.otpExplainer}>
                                            No password needed. We will send a 6-digit confirmation code directly to your registered email.
                                        </Text>

                                        <TouchableOpacity
                                            style={[s.btn, isSubmitting && s.btnDisabled]}
                                            onPress={handleSendCode}
                                            disabled={isSubmitting}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={s.btnText}>
                                                {isLoading ? 'Sending Code…' : 'Send Sign-In Code'}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={[s.label, s.labelSpaced]}>6-Digit Sign-In Code</Text>
                                        <View style={s.otpInputRow}>
                                            <KeyRound size={20} color={C.blue} style={s.iconL} />
                                            <TextInput
                                                style={s.otpInput}
                                                placeholder="123456"
                                                placeholderTextColor={C.textLight}
                                                value={otpCode}
                                                onChangeText={setOtpCode}
                                                keyboardType="number-pad"
                                                maxLength={8}
                                                autoFocus
                                                editable={!isSubmitting}
                                                returnKeyType="done"
                                                onSubmitEditing={handleVerifyOtp}
                                            />
                                        </View>
                                        <Text style={s.hint}>⏳ The sign-in code expires in 60 minutes.</Text>

                                        <TouchableOpacity
                                            style={[s.btn, isSubmitting && s.btnDisabled]}
                                            onPress={handleVerifyOtp}
                                            disabled={isSubmitting}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={s.btnText}>
                                                {isLoading ? 'Verifying Code…' : 'Verify & Sign In'}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={s.otpActionRow}>
                                            <TouchableOpacity
                                                onPress={handleResendCode}
                                                disabled={isSubmitting}
                                                style={s.resendBtn}
                                                activeOpacity={0.7}
                                            >
                                                <RefreshCw size={14} color={C.blue} />
                                                <Text style={s.resendText}>
                                                    {isResending ? 'Resending…' : 'Resend Code'}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => setOtpSent(false)}
                                                disabled={isSubmitting}
                                                style={s.changeEmailBtn}
                                                activeOpacity={0.7}
                                            >
                                                <ArrowLeft size={14} color={C.textMuted} />
                                                <Text style={s.changeEmailText}>Change Email</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </>
                        )}

                        {/* Footer link */}
                        <View style={s.footer}>
                            <Text style={s.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.replace('/signup')}>
                                <Text style={s.link}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Attribution */}
                    <Text style={s.attribution}>
                        Supervised by Dr. Sangeeta Borchetia &amp; Dr. Prabir Barooah
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    flex:  { flex: 1 },
    page:  { flex: 1, backgroundColor: C.page },
    scroll: { flexGrow: 1, paddingBottom: 32 },

    topSection: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    logo: { width: 76, height: 76, marginBottom: 10 },
    institute: {
        fontSize: 10,
        color: C.textMuted,
        fontWeight: '600',
        letterSpacing: 1.3,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 4,
    },
    appName: {
        fontSize: 34,
        fontWeight: '800',
        color: C.navy,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 13,
        color: C.textMuted,
        marginTop: 3,
        marginBottom: 14,
        textAlign: 'center',
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    versionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.gold,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
        shadowColor: C.gold,
        shadowOpacity: 0.80,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
    },
    versionMain: { color: C.navy, fontSize: 11, fontWeight: '800' },
    versionDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: C.goldDark },
    versionSub:  { color: C.navy, fontSize: 10, fontWeight: '600', opacity: 0.85 },
    guideBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: C.inputBorder,
        backgroundColor: C.card,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    guideBtnText: { color: C.navyMid, fontSize: 12, fontWeight: '600' },

    card: {
        backgroundColor: C.card,
        marginHorizontal: 16,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1A3A6E',
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },

    /* Tab Switcher */
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#EDF3FC',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 9,
    },
    tabButtonActive: {
        backgroundColor: C.white,
        shadowColor: '#1A3A6E',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: C.textMuted,
    },
    tabTextActive: {
        color: C.navy,
        fontWeight: '700',
    },

    cardTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
    cardSub:   { fontSize: 13, color: C.textMuted, marginBottom: 20 },

    label:       { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
    labelSpaced: { marginTop: 18 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: C.inputBorder,
        borderRadius: 14,
        backgroundColor: C.inputBg,
        paddingHorizontal: 14,
        height: 56,
    },
    iconL: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: C.text, height: '100%' },
    hint:  { fontSize: 11, color: C.textMuted, marginTop: 7, fontStyle: 'italic' },

    subActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 20,
    },
    switchModeText: {
        fontSize: 13,
        fontWeight: '600',
        color: C.link,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '600',
        color: C.textMuted,
    },

    otpExplainer: {
        fontSize: 13,
        color: C.textMid,
        lineHeight: 19,
        marginTop: 14,
        marginBottom: 20,
    },

    /* OTP Inputs */
    otpInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: C.blue,
        borderRadius: 14,
        backgroundColor: '#F0F5FF',
        paddingHorizontal: 16,
        height: 60,
    },
    otpInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: C.navy,
        letterSpacing: 6,
        height: '100%',
    },
    otpActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    resendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    resendText: {
        color: C.blue,
        fontSize: 13.5,
        fontWeight: '700',
    },
    changeEmailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    changeEmailText: {
        color: C.textMuted,
        fontSize: 13.5,
        fontWeight: '600',
    },

    btn: {
        backgroundColor: C.btnPrimary,
        borderRadius: 14,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.btnShadow,
        shadowOpacity: 0.40,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        marginTop: 18,
        marginBottom: 20,
    },
    btnDisabled: { opacity: 0.60 },
    btnText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },

    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { fontSize: 14, color: C.textMuted },
    link:       { fontSize: 14, fontWeight: '700', color: C.link },

    attribution: {
        textAlign: 'center',
        fontSize: 11,
        color: C.textMuted,
        paddingHorizontal: 24,
        marginTop: 20,
    },
});
