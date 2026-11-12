import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/authStore';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy:        '#0D1F3C',
  navyMid:     '#1E3A5F',
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
  green:       '#16A34A',
  greenBg:     '#F0FDF4',
  greenBorder: '#BBF7D0',
  blue:        '#2563EB',
  blueBg:      '#EFF6FF',
  blueBorder:  '#BFDBFE',
};

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otpCode,     setOtpCode]     = useState('');
  const [isResending, setIsResending] = useState(false);
  const [verified,    setVerified]    = useState(false);

  const verifySignupOtp = useAuthStore((s) => s.verifySignupOtp);
  const resendSignupOtp = useAuthStore((s) => s.resendSignupOtp);
  const isLoading       = useAuthStore((s) => s.isLoading);

  const isSubmitting = isLoading || isResending;
  const safeEmail    = email?.trim() ?? '';

  // ── Mask email for display: pr****@gmail.com ──────────────────────────────
  const maskedEmail = (() => {
    if (!safeEmail) return '';
    const [local, domain] = safeEmail.split('@');
    if (!domain) return safeEmail;
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
  })();

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otpCode.trim();
    if (code.length < 6) {
      Alert.alert('Code Required', 'Please enter the full 6-digit code from your email.');
      return;
    }
    if (isSubmitting) return;

    try {
      await verifySignupOtp(safeEmail, code);
      setVerified(true);
      // Small celebration delay then navigate to main app
      setTimeout(() => {
        router.replace('/');
      }, 1800);
    } catch (err) {
      Alert.alert(
        'Verification Failed',
        err instanceof Error
          ? err.message
          : 'The code is incorrect or has expired. Please try again or resend a new code.',
      );
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (isSubmitting) return;
    try {
      setIsResending(true);
      await resendSignupOtp(safeEmail);
      Alert.alert(
        'New Code Sent 📬',
        `A fresh 6-digit code has been sent to ${safeEmail}.\n\nCheck your inbox (and spam folder).`,
      );
    } catch (err) {
      Alert.alert('Resend Failed', err instanceof Error ? err.message : 'Unable to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // ── Verified success state ─────────────────────────────────────────────────
  if (verified) {
    return (
      <SafeAreaView style={s.page}>
        <View style={s.successContainer}>
          <View style={s.successIconWrap}>
            <CheckCircle size={72} color={C.green} strokeWidth={1.5} />
          </View>
          <Text style={s.successTitle}>Email Verified! 🎉</Text>
          <Text style={s.successSub}>
            Welcome to PAATSUTRA.{'\n'}Taking you to the app…
          </Text>
          <View style={s.successBadge}>
            <ShieldCheck size={14} color={C.green} />
            <Text style={s.successBadgeText}>Account activated</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main verify screen ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Back Button ───────────────────────────────────────────── */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color={C.textMid} />
              <Text style={s.backText}>Back</Text>
            </TouchableOpacity>

            {/* ── Top Branding ─────────────────────────────────────────── */}
            <View style={s.topSection}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={s.logo}
                resizeMode="contain"
              />
              <Text style={s.institute}>Tocklai Tea Research Institute</Text>
              <Text style={s.appName}>PAATSUTRA</Text>
            </View>

            {/* ── Email Illustration Card ──────────────────────────────── */}
            <View style={s.illustrationCard}>
              <View style={s.mailIconWrap}>
                <Mail size={36} color={C.navyMid} strokeWidth={1.5} />
              </View>
              <Text style={s.illustTitle}>Check Your Email</Text>
              <Text style={s.illustSub}>
                We've sent a <Text style={s.bold}>6-digit verification code</Text> to:
              </Text>
              <View style={s.emailPill}>
                <Mail size={13} color={C.navyMid} />
                <Text style={s.emailPillText}>{maskedEmail}</Text>
              </View>
              <Text style={s.illustNote}>
                📥 Check your inbox and spam/junk folder
              </Text>
            </View>

            {/* ── OTP Entry Card ───────────────────────────────────────── */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Enter Verification Code</Text>
              <Text style={s.cardSub}>
                Type the 6-digit code exactly as it appears in the email
              </Text>

              {/* OTP Input */}
              <Text style={s.label}>6-Digit Code</Text>
              <View style={s.otpInputRow}>
                <KeyRound size={22} color={C.blue} style={s.iconL} />
                <TextInput
                  style={s.otpInput}
                  placeholder="1 2 3 4 5 6"
                  placeholderTextColor={C.textLight}
                  value={otpCode}
                  onChangeText={(t) => setOtpCode(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  editable={!isSubmitting}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                />
                {otpCode.length === 6 && (
                  <CheckCircle size={20} color={C.green} />
                )}
              </View>

              {/* Timer hint */}
              <View style={s.hintRow}>
                <Text style={s.hint}>⏳ Code expires in 60 minutes</Text>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[s.btn, (isSubmitting || otpCode.length < 6) && s.btnDisabled]}
                onPress={handleVerify}
                disabled={isSubmitting || otpCode.length < 6}
                activeOpacity={0.85}
              >
                <ShieldCheck size={18} color={C.white} style={{ marginRight: 8 }} />
                <Text style={s.btnText}>
                  {isLoading ? 'Verifying…' : 'Verify & Access App'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>Didn't receive the code?</Text>
                <View style={s.dividerLine} />
              </View>

              {/* Resend */}
              <TouchableOpacity
                style={[s.resendBtn, isSubmitting && s.resendDisabled]}
                onPress={handleResend}
                disabled={isSubmitting}
                activeOpacity={0.75}
              >
                <RefreshCw size={15} color={isSubmitting ? C.textLight : C.blue} />
                <Text style={[s.resendText, isSubmitting && s.resendTextDisabled]}>
                  {isResending ? 'Sending new code…' : 'Resend Verification Code'}
                </Text>
              </TouchableOpacity>

              {/* Help note */}
              <View style={s.helpBox}>
                <Text style={s.helpTitle}>💡 Having trouble?</Text>
                <Text style={s.helpItem}>• Check your spam / junk folder</Text>
                <Text style={s.helpItem}>• Make sure you used the correct email</Text>
                <Text style={s.helpItem}>• Wait 1–2 minutes before resending</Text>
                <Text style={s.helpItem}>• Contact your supervisor if the issue persists</Text>
              </View>
            </View>

            {/* ── Attribution ──────────────────────────────────────────── */}
            <Text style={s.attribution}>
              Supervised by Dr. Sangeeta Borchetia &amp; Dr. Prabir Barooah
            </Text>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex:   { flex: 1 },
  page:   { flex: 1, backgroundColor: C.page },
  scroll: { flexGrow: 1, paddingBottom: 36 },

  // Back button
  backBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            6,
    paddingTop:     12,
    paddingLeft:    16,
    paddingBottom:  4,
    alignSelf:      'flex-start',
  },
  backText: { fontSize: 14, color: C.textMid, fontWeight: '600' },

  // Top branding
  topSection: {
    alignItems:        'center',
    paddingTop:        8,
    paddingBottom:     20,
    paddingHorizontal: 24,
  },
  logo:      { width: 64, height: 64, marginBottom: 8 },
  institute: {
    fontSize:      10,
    color:         C.textMuted,
    fontWeight:    '600',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    textAlign:     'center',
    marginBottom:  2,
  },
  appName: {
    fontSize:      28,
    fontWeight:    '800',
    color:         C.navy,
    letterSpacing: 0.3,
    textAlign:     'center',
  },

  // Email illustration card
  illustrationCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    borderRadius:    20,
    padding:         24,
    alignItems:      'center',
    marginBottom:    14,
    shadowColor:     '#1A3A6E',
    shadowOpacity:   0.10,
    shadowRadius:    20,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       8,
    borderWidth:     1.5,
    borderColor:     C.blueBorder,
  },
  mailIconWrap: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: C.blueBg,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
    borderWidth:     1.5,
    borderColor:     C.blueBorder,
  },
  illustTitle: {
    fontSize:   20,
    fontWeight: '800',
    color:      C.navy,
    marginBottom: 6,
    textAlign:  'center',
  },
  illustSub: {
    fontSize:   13,
    color:      C.textMid,
    textAlign:  'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  bold: { fontWeight: '700', color: C.text },
  emailPill: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.blueBg,
    borderWidth:     1.5,
    borderColor:     C.blueBorder,
    borderRadius:    30,
    paddingHorizontal: 14,
    paddingVertical:   7,
    gap:             7,
    marginBottom:    10,
  },
  emailPillText: {
    fontSize:   13.5,
    fontWeight: '700',
    color:      C.navyMid,
    letterSpacing: 0.3,
  },
  illustNote: {
    fontSize:   12,
    color:      C.textMuted,
    fontStyle:  'italic',
    textAlign:  'center',
  },

  // OTP card
  card: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    borderRadius:    24,
    padding:         24,
    shadowColor:     '#1A3A6E',
    shadowOpacity:   0.12,
    shadowRadius:    24,
    shadowOffset:    { width: 0, height: 8 },
    elevation:       10,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 19 },

  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },

  otpInputRow: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    2,
    borderColor:    C.blue,
    borderRadius:   14,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    height:         64,
  },
  iconL:    { marginRight: 10 },
  otpInput: {
    flex:          1,
    fontSize:      28,
    fontWeight:    '800',
    color:         C.navy,
    letterSpacing: 8,
    height:        '100%',
  },

  hintRow: { marginTop: 8, marginBottom: 2 },
  hint:    { fontSize: 12, color: C.textMuted, fontStyle: 'italic' },

  // Verify button
  btn: {
    flexDirection:  'row',
    backgroundColor: C.btnPrimary,
    borderRadius:   14,
    height:         58,
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    C.btnShadow,
    shadowOpacity:  0.40,
    shadowRadius:   12,
    shadowOffset:   { width: 0, height: 6 },
    elevation:      8,
    marginTop:      22,
    marginBottom:   20,
  },
  btnDisabled: { opacity: 0.45 },
  btnText:     { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },

  // Divider
  divider: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
    marginBottom:   16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.inputBorder },
  dividerText: { fontSize: 12, color: C.textMuted, fontWeight: '500' },

  // Resend button
  resendBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    borderWidth:     1.5,
    borderColor:     C.blueBorder,
    backgroundColor: C.blueBg,
    borderRadius:    12,
    paddingVertical: 13,
    marginBottom:    20,
  },
  resendDisabled: { opacity: 0.5 },
  resendText:     { color: C.blue, fontSize: 14, fontWeight: '700' },
  resendTextDisabled: { color: C.textLight },

  // Help box
  helpBox: {
    backgroundColor: '#FEFCE8',
    borderWidth:     1.5,
    borderColor:     '#FDE68A',
    borderRadius:    12,
    padding:         14,
    gap:             4,
  },
  helpTitle: { fontSize: 13, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  helpItem:  { fontSize: 12, color: '#78350F', lineHeight: 20 },

  // Attribution
  attribution: {
    textAlign:        'center',
    fontSize:         11,
    color:            C.textMuted,
    paddingHorizontal: 24,
    marginTop:        20,
  },

  // Success state
  successContainer: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 32,
    gap:             16,
  },
  successIconWrap: {
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: C.greenBg,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     C.greenBorder,
    marginBottom:    8,
  },
  successTitle: {
    fontSize:   28,
    fontWeight: '800',
    color:      C.navy,
    textAlign:  'center',
  },
  successSub: {
    fontSize:   15,
    color:      C.textMid,
    textAlign:  'center',
    lineHeight: 24,
  },
  successBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    backgroundColor: C.greenBg,
    borderWidth:     1.5,
    borderColor:     C.greenBorder,
    borderRadius:    30,
    paddingHorizontal: 16,
    paddingVertical:   8,
    marginTop:       4,
  },
  successBadgeText: {
    fontSize:   13,
    fontWeight: '700',
    color:      C.green,
  },
});
