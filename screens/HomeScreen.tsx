import { useAuthStore } from '@/store/authStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSampleStore } from '@/store/sampleStore';
import { router, useFocusEffect } from 'expo-router';
import {
  BookOpen,
  Cloud,
  Download,
  Edit3,
  LogOut,
  PlusCircle,
  Power,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { useCallback } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Design Tokens (Standardized across Tocklai Field App) ───────────────────
const C = {
  navy:        '#0D1F3C',
  navyMid:     '#1E3A5F',
  navyDark:    '#0A1A30',
  page:        '#F0F5FF',
  card:        '#FFFFFF',
  gold:        '#E5A820',
  goldLight:   '#FEF9EC',
  goldBorder:  '#F5D485',
  text:        '#0D1F3C',
  textMid:     '#3D5A80',
  textMuted:   '#7A90B8',
  textLight:   '#A8B9D4',
  blue:        '#2563EB',
  blueLight:   '#EFF6FF',
  blueBorder:  '#BFDBFE',
  green:       '#16A34A',
  greenLight:  '#F0FDF4',
  greenBorder: '#BBF7D0',
  btnPrimary:  '#1D3557',
  danger:      '#DC2626',
  dangerLight: '#FEF2F2',
  dangerBorder:'#FECACA',
  border:      '#E2E8F0',
};

const LAST_UPDATED = '12 Nov 2026';

export default function HomeScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);
  const samples = useSampleStore((state) => state.samples);
  const loading = useSampleStore((state) => state.loading);
  const loadSamples = useSampleStore((state) => state.loadSamples);
  const signOut = useAuthStore((state) => state.signOut);

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadSamples();
      }
    }, [loadSamples, loading])
  );

  const samplesWithImages = samples.filter((sample) => sample.images.length > 0).length;
  const samplesWithoutImages = samples.length - samplesWithImages;
  const totalLocalImages = samples.reduce((total, sample) => total + sample.images.length, 0);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              useSampleStore.setState({ samples: [] });
              await signOut();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Sign Out Failed', error instanceof Error ? error.message : 'Unable to sign out.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClear = useCallback(() => {
    router.push('/clear-selection' as never);
  }, []);

  const handleExit = () => {
    Alert.alert(
      'Exit Application',
      'Are you sure you want to close and exit the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'android') {
              BackHandler.exitApp();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TOP BRANDING & HEADER ────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.institute}>Tocklai Tea Research Institute</Text>
          <Text style={styles.appName}>Tocklai Field</Text>
          <Text style={styles.tagline}>Field Research Companion • Offline Mode</Text>

          {/* Badges Row */}
          <View style={styles.metaRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionMain}>v {deviceInfo?.appVersion || '1.1.0'}</Text>
              <View style={styles.versionDot} />
              <Text style={styles.versionSub}>{LAST_UPDATED}</Text>
            </View>

            <TouchableOpacity
              style={styles.guideBadge}
              onPress={() => router.push('/user-guide')}
              activeOpacity={0.8}
            >
              <BookOpen size={13} color={C.blue} />
              <Text style={styles.guideBadgeText}>User Guide</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── METRICS OVERVIEW (STAT CARDS) ─────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardWithImages]}>
            <View style={styles.statIconBadge}>
              <Sparkles size={16} color={C.green} />
            </View>
            <Text style={styles.statNumber}>{samplesWithImages}</Text>
            <Text style={styles.statLabel}>With Images</Text>
            <Text style={styles.statSub}>{totalLocalImages} photos attached</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#F1F5F9' }]}>
              <Edit3 size={16} color={C.textMid} />
            </View>
            <Text style={[styles.statNumber, { color: C.textMid }]}>{samplesWithoutImages}</Text>
            <Text style={styles.statLabel}>Without Images</Text>
            <Text style={styles.statSub}>Data only records</Text>
          </View>
        </View>

        {/* ── PRIMARY ACTIONS (ELEGANT CARDS) ──────────────────────────────── */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionHeading}>Field Operations</Text>

          {/* Add Sample — Hero button */}
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/add-sample')}
            activeOpacity={0.85}
          >
            <View style={styles.heroLeft}>
              <View style={styles.heroIconWrap}>
                <PlusCircle size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.heroTitle}>Add New Sample</Text>
                <Text style={styles.heroSubtitle}>Capture photos, readings & GPS</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* View/Update Sample */}
          <TouchableOpacity
            style={styles.actionRowCard}
            onPress={() => router.push('/update-sample')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionRowIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Edit3 size={20} color="#4F46E5" />
            </View>
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>View / Update Samples</Text>
              <Text style={styles.actionRowSub}>Review & modify stored records</Text>
            </View>
          </TouchableOpacity>

          {/* Export Records */}
          <TouchableOpacity
            style={styles.actionRowCard}
            onPress={() => router.push('/export-records')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionRowIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Download size={20} color="#059669" />
            </View>
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>Export Records</Text>
              <Text style={styles.actionRowSub}>Download CSV or backup archive</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── CLOUD SYNC CARD ──────────────────────────────────────────────── */}
        <View style={styles.syncCard}>
          <View style={styles.syncTop}>
            <View style={styles.syncIconWrap}>
              <Cloud size={24} color={C.blue} />
            </View>
            <View style={styles.syncDetails}>
              <Text style={styles.syncTitle}>Cloud Synchronization</Text>
              <Text style={styles.syncSubtitle}>
                {samplesWithImages > 0
                  ? `${samplesWithImages} sample(s) ready • ${totalLocalImages} image(s)`
                  : 'All samples are currently synced'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, samplesWithImages === 0 && styles.syncBtnDisabled]}
            onPress={() => router.push('/sync')}
            disabled={samplesWithImages === 0}
            activeOpacity={0.85}
          >
            <RefreshCw size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.syncBtnText}>
              {samplesWithImages > 0 ? 'Sync to Cloud Now' : 'Synced'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── DATA & APP CONTROLS ───────────────────────────────────────────── */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionHeading}>Data Management</Text>

          <TouchableOpacity
            style={styles.dangerRowCard}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <View style={styles.dangerIconWrap}>
              <Trash2 size={18} color={C.danger} />
            </View>
            <View style={styles.actionRowText}>
              <Text style={styles.dangerTitle}>Clear Records</Text>
              <Text style={styles.dangerSub}>Safely delete local cached data</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dualActionRow}>
            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut size={16} color={C.navyMid} />
              <Text style={styles.outlineActionText}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={handleExit}
              activeOpacity={0.8}
            >
              <Power size={16} color={C.danger} />
              <Text style={[styles.outlineActionText, { color: C.danger }]}>Exit App</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SCIENTIFIC SUPERVISION FOOTER ─────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.supervisionText}>
            Supervised by Dr. Sangeeta Borchetia &amp; Dr. Prabir Barooah
          </Text>
          {deviceInfo ? (
            <Text style={styles.deviceMeta}>
              {deviceInfo.manufacturer} {deviceInfo.model} • Build {deviceInfo.appVersion}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.page,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },

  // ── Header Section ────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  institute: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 3,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12.5,
    color: C.textMuted,
    marginTop: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    shadowColor: C.gold,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  versionMain: {
    color: C.navy,
    fontSize: 11,
    fontWeight: '800',
  },
  versionDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.navy,
    opacity: 0.5,
  },
  versionSub: {
    color: C.navy,
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.85,
  },
  guideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.blueBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  guideBadgeText: {
    color: C.blue,
    fontSize: 11.5,
    fontWeight: '700',
  },

  // ── Stat Cards ────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  statCardWithImages: {
    borderColor: C.greenBorder,
    backgroundColor: '#FAFDFB',
  },
  statIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: C.green,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy,
    marginBottom: 2,
  },
  statSub: {
    fontSize: 11,
    color: C.textMuted,
  },

  // ── Action Section ────────────────────────────────────────────────────────
  actionSection: {
    marginBottom: 20,
    gap: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 2,
  },

  // Hero Button (Add Sample)
  heroButton: {
    backgroundColor: C.btnPrimary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: C.navyDark,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },

  // Action Row Cards
  actionRowCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionRowIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowText: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.navy,
  },
  actionRowSub: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 1,
  },

  // Danger Row Card (Clear records)
  dangerRowCard: {
    backgroundColor: C.dangerLight,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: C.dangerBorder,
  },
  dangerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.danger,
  },
  dangerSub: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 1,
  },

  // Dual Action Row (Logout / Exit)
  dualActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  outlineActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  outlineActionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.navyMid,
  },

  // ── Sync Card ─────────────────────────────────────────────────────────────
  syncCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: C.blueBorder,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: 14,
  },
  syncTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  syncIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.blueBorder,
  },
  syncDetails: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.navy,
  },
  syncSubtitle: {
    fontSize: 12.5,
    color: C.textMid,
    marginTop: 2,
  },
  syncBtn: {
    backgroundColor: C.blue,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.blue,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  syncBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  supervisionText: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
  },
  deviceMeta: {
    fontSize: 10,
    color: C.textLight,
    textAlign: 'center',
  },
});
