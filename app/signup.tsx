import { router } from 'expo-router';
import {
  BookOpen,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
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

import packageJson from '@/package.json';
import { verifyAppLockPassword } from '@/services/appLockService';
import { useAuthStore } from '@/store/authStore';

// ─── Design tokens ───────────────────────────────────────────────────────────
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
  checkActive: '#1D3557',
  checkBorder: '#C0D0E8',
  errorRed:    '#DC2626',
};

const LAST_UPDATED = '12 Nov 2026';

export default function SignupScreen() {
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [passcode,         setPasscode]         = useState('');
  const [showPassword,     setShowPassword]     = useState(false);
  const [showPasscode,     setShowPasscode]     = useState(false);
  const [isVerifying,      setIsVerifying]      = useState(false);
  const [consentKnowledge, setConsentKnowledge] = useState(false);
  const [consentData,      setConsentData]      = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  const appVersion = packageJson.version;

  const signUp       = useAuthStore((s) => s.signUp);
  const isLoading    = useAuthStore((s) => s.isLoading);
  const isSubmitting = isLoading || isVerifying;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!email.trim() || !password || !passcode) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }
    if (!consentKnowledge || !consentData) {
      setShowConsentError(true);
      Alert.alert(
        'Consent Required',
        'Please tick both checkboxes to confirm your understanding and consent.',
      );
      return;
    }
    if (isSubmitting) return;

    try {
      setIsVerifying(true);
      let valid: boolean;
      try {
        valid = await verifyAppLockPassword(passcode);
      } finally {
        setIsVerifying(false);
      }

      if (!valid) {
        Alert.alert(
          'Invalid Passcode',
          'Incorrect research team passcode. Contact your supervisor.',
        );
        return;
      }

      await signUp(email.trim(), password);

      // ✅ Navigate to the DEDICATED email verification screen
      router.push({ pathname: '/verify-email', params: { email: email.trim() } });
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        error instanceof Error ? error.message : 'Unable to create account.',
      );
    }
  };

  const toggleConsent1 = () => { setConsentKnowledge((v) => !v); setShowConsentError(false); };
  const toggleConsent2 = () => { setConsentData((v) => !v); setShowConsentError(false); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── TOP BRANDING ─────────────────────────── */}
            <View style={s.topSection}>
              <Image source={require('@/assets/images/logo.png')} style={s.logo} resizeMode="contain" />
              <Text style={s.institute}>Tocklai Tea Research Institute</Text>
              <Text style={s.appName}>Tocklai Field</Text>
              <Text style={s.tagline}>Create Your Research Account</Text>

              <View style={s.metaRow}>
                <View style={s.versionBadge}>
                  <Text style={s.versionMain}>v {appVersion}</Text>
                  <View style={s.versionDot} />
                  <Text style={s.versionSub}>Last updated: {LAST_UPDATED}</Text>
                </View>
                <TouchableOpacity style={s.guideBtn} onPress={() => router.push('/guide')} activeOpacity={0.75}>
                  <BookOpen size={12} color={C.navyMid} />
                  <Text style={s.guideBtnText}>User Guide</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── REGISTRATION FORM ─────────────────────── */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Register</Text>
              <Text style={s.cardSub}>Authorized research team members only</Text>

              {/* Email */}
              <Text style={s.label}>Email Address</Text>
              <View style={[s.inputRow, isSubmitting && s.inputDimmed]}>
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
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <Text style={[s.label, s.labelSpaced]}>Password</Text>
              <View style={[s.inputRow, isSubmitting && s.inputDimmed]}>
                <Lock size={19} color={C.textLight} style={s.iconL} />
                <TextInput
                  style={s.input}
                  placeholder="Create a strong password"
                  placeholderTextColor={C.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  {showPassword ? <EyeOff size={20} color={C.textMuted} /> : <Eye size={20} color={C.textMuted} />}
                </TouchableOpacity>
              </View>
              <Text style={s.hint}>💡 Save credentials in your phone's password manager</Text>

              {/* Passcode */}
              <Text style={[s.label, s.labelSpaced]}>Research Team Passcode</Text>
              <View style={[s.inputRow, isSubmitting && s.inputDimmed]}>
                <Shield size={19} color={C.textLight} style={s.iconL} />
                <TextInput
                  style={s.input}
                  placeholder="Enter the shared passcode"
                  placeholderTextColor={C.textLight}
                  value={passcode}
                  onChangeText={setPasscode}
                  secureTextEntry={!showPasscode}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity onPress={() => setShowPasscode((v) => !v)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  {showPasscode ? <EyeOff size={20} color={C.textMuted} /> : <Eye size={20} color={C.textMuted} />}
                </TouchableOpacity>
              </View>
              <Text style={s.hint}>🔑 Get this passcode from your research team supervisor</Text>

              {/* Consent checkboxes */}
              <View style={s.checkSection}>
                <TouchableOpacity style={s.checkRow} onPress={toggleConsent1} activeOpacity={0.7}>
                  <View style={[
                    s.checkBox,
                    consentKnowledge && s.checkBoxChecked,
                    showConsentError && !consentKnowledge && s.checkBoxError,
                  ]}>
                    {consentKnowledge && <Check size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  <Text style={[
                    s.checkLabel,
                    showConsentError && !consentKnowledge && s.checkLabelError,
                  ]}>
                    I confirm that I am fully aware of how to use this app and have read the User Guide.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.checkRow} onPress={toggleConsent2} activeOpacity={0.7}>
                  <View style={[
                    s.checkBox,
                    consentData && s.checkBoxChecked,
                    showConsentError && !consentData && s.checkBoxError,
                  ]}>
                    {consentData && <Check size={12} color="#fff" strokeWidth={3} />}
                  </View>
                  <Text style={[
                    s.checkLabel,
                    showConsentError && !consentData && s.checkLabelError,
                  ]}>
                    I allow this app to collect and upload tea leaf image data for research purposes under Tocklai Tea Research Institute.
                  </Text>
                </TouchableOpacity>

                {showConsentError && (!consentKnowledge || !consentData) && (
                  <Text style={s.checkError}>
                    ⚠ Please acknowledge both items to proceed.
                  </Text>
                )}
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[s.btn, isSubmitting && s.btnDisabled]}
                onPress={handleSignup}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Text style={s.btnText}>
                  {isVerifying ? 'Verifying Passcode…' : isLoading ? 'Creating Account…' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={s.footer}>
                <Text style={s.footerText}>Already registered? </Text>
                <TouchableOpacity onPress={() => { if (!isSubmitting) router.replace('/login'); }}>
                  <Text style={s.link}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.attribution}>
              Supervised by Dr. Sangeeta Borchetia &amp; Dr. Prabir Barooah
            </Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex:   { flex: 1 },
  page:   { flex: 1, backgroundColor: C.page },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  topSection: {
    alignItems:        'center',
    paddingTop:        24,
    paddingBottom:     20,
    paddingHorizontal: 24,
  },
  logo: { width: 72, height: 72, marginBottom: 10 },
  institute: {
    fontSize:      10,
    color:         C.textMuted,
    fontWeight:    '600',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    textAlign:     'center',
    marginBottom:  4,
  },
  appName: {
    fontSize:      34,
    fontWeight:    '800',
    color:         C.navy,
    letterSpacing: 0.3,
    textAlign:     'center',
  },
  tagline: {
    fontSize:   13,
    color:      C.textMuted,
    marginTop:  3,
    marginBottom: 14,
    textAlign:  'center',
  },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  versionBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius:    20,
    gap:             6,
    shadowColor:     C.gold,
    shadowOpacity:   0.80,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 0 },
    elevation:       10,
  },
  versionMain: { color: C.navy, fontSize: 11, fontWeight: '800' },
  versionDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: C.goldDark },
  versionSub:  { color: C.navy, fontSize: 10, fontWeight: '600', opacity: 0.85 },
  guideBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     C.inputBorder,
    backgroundColor: C.card,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius:    20,
    gap:             5,
    shadowColor:     '#000',
    shadowOpacity:   0.07,
    shadowRadius:    4,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  guideBtnText: { color: C.navyMid, fontSize: 12, fontWeight: '600' },

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
  cardTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 19 },

  label:       { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  labelSpaced: { marginTop: 18 },
  inputRow: {
    flexDirection:  'row',
    alignItems:     'center',
    borderWidth:    1.5,
    borderColor:    C.inputBorder,
    borderRadius:   14,
    backgroundColor: C.inputBg,
    paddingHorizontal: 14,
    height:         56,
  },
  inputDimmed: { opacity: 0.6 },
  iconL:  { marginRight: 10 },
  input:  { flex: 1, fontSize: 15, color: C.text, height: '100%' },
  hint:   { fontSize: 11, color: C.textMuted, marginTop: 7, fontStyle: 'italic' },

  /* ── Checkboxes ── */
  checkSection: { marginTop: 20, gap: 10 },
  checkRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           12,
  },
  checkBox: {
    width:           22,
    height:          22,
    borderRadius:    6,
    borderWidth:     2,
    borderColor:     C.checkBorder,
    backgroundColor: C.inputBg,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       1,
    flexShrink:      0,
  },
  checkBoxChecked: {
    backgroundColor: C.checkActive,
    borderColor:     C.checkActive,
  },
  checkBoxError: {
    borderColor:     C.errorRed,
    backgroundColor: '#FFF5F5',
  },
  checkLabel: {
    flex:       1,
    fontSize:   13,
    color:      C.textMid,
    lineHeight: 20,
  },
  checkLabelError: { color: C.errorRed },
  checkError: {
    fontSize:   12,
    color:      C.errorRed,
    fontWeight: '500',
    marginTop:  4,
  },

  /* ── Button ── */
  btn: {
    backgroundColor: C.btnPrimary,
    borderRadius:    14,
    height:          56,
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     C.btnShadow,
    shadowOpacity:   0.40,
    shadowRadius:    12,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       8,
    marginTop:       24,
    marginBottom:    20,
  },
  btnDisabled: { opacity: 0.60 },
  btnText:     { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: C.textMuted },
  link:       { fontSize: 14, fontWeight: '700', color: C.link },

  attribution: {
    textAlign:        'center',
    fontSize:         11,
    color:            C.textMuted,
    paddingHorizontal: 24,
    marginTop:        20,
  },
});
