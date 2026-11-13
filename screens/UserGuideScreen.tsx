import { router } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Database,
  FileSpreadsheet,
  HelpCircle,
  KeyRound,
  Pencil,
  Smartphone,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  page:      '#F0F5FF',
  card:      '#FFFFFF',
  border:    '#DDE8F5',
  text:      '#0D1F3C',
  textMid:   '#3D5A80',
  textMuted: '#7A90B8',
  white:     '#FFFFFF',
  blue:      '#2563EB',
  navy:      '#0D1F3C',
};

// ─── Section definitions ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'quickstart',      color: '#D97706', bg: '#FFFBEB' },
  { id: 'auth',            color: '#2563EB', bg: '#EFF6FF' },
  { id: 'addSample',       color: '#059669', bg: '#ECFDF5' },
  { id: 'photos',          color: '#2563EB', bg: '#EFF6FF' },
  { id: 'meter',           color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'viewUpdate',      color: '#4F46E5', bg: '#EEF2FF' },
  { id: 'export',          color: '#0D9488', bg: '#F0FDFA' },
  { id: 'sync',            color: '#0284C7', bg: '#E0F2FE' },
  { id: 'troubleshooting', color: '#475569', bg: '#F1F5F9' },
  { id: 'bestPractices',   color: '#16A34A', bg: '#DCFCE7' },
];

const DEFAULT_STATE: Record<string, boolean> = {
  quickstart: true,
  auth: false,
  addSample: false,
  photos: false,
  meter: false,
  viewUpdate: false,
  export: false,
  sync: false,
  troubleshooting: false,
  bestPractices: false,
};

export default function UserGuideScreen() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(DEFAULT_STATE);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const expandAll = () =>
    setExpanded(Object.fromEntries(SECTIONS.map((s) => [s.id, true])));

  const collapseAll = () =>
    setExpanded(Object.fromEntries(SECTIONS.map((s) => [s.id, false])));

  const color = (id: string) => SECTIONS.find((s) => s.id === id)!.color;
  const bg    = (id: string) => SECTIONS.find((s) => s.id === id)!.bg;

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HORIZONTAL HEADER CARD ────────────────────────────── */}
        <View style={s.headerCard}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={20} color={C.text} />
          </Pressable>

          <View style={s.cardTextGroup}>
            <View style={s.tagPill}>
              <Text style={s.topTag}>TOCKLAI TEA RESEARCH INSTITUTE</Text>
            </View>
            <Text style={s.mainTitle}>Field Training Manual</Text>
            <Text style={s.subTitle}>Standard protocol for field leaf data collection</Text>
          </View>
        </View>

        {/* ── EXPAND / COLLAPSE BAR ────────────────────────────── */}
        <View style={s.controlBar}>
          <View style={s.moduleCount}>
            <Text style={s.moduleCountText}>10 TOPICS</Text>
          </View>
          <View style={s.controlBtns}>
            <Pressable onPress={expandAll} style={s.chip}>
              <Text style={s.chipText}>Expand All</Text>
            </Pressable>
            <Pressable onPress={collapseAll} style={s.chip}>
              <Text style={s.chipText}>Collapse All</Text>
            </Pressable>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — Quick-Start Workflow
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="quickstart"
          number="1"
          title="Quick Start: 5 Easy Steps"
          badge="Start Here"
          icon={<Zap size={20} color={color('quickstart')} />}
          color={color('quickstart')}
          iconBg={bg('quickstart')}
          isOpen={expanded.quickstart}
          onToggle={() => toggle('quickstart')}
        >
          <InfoBanner
            color="#D97706"
            bg="#FFFBEB"
            text="Follow these 5 steps every time you go to the field. It only takes a few minutes once you get used to it!"
          />
          <Step
            num="1"
            color={color('quickstart')}
            title="Log in before going to the field"
            desc="Open the app while on Wi-Fi or mobile network. Log in once — your session stays active offline throughout the day."
          />
          <Step
            num="2"
            color={color('quickstart')}
            title="Collect tea sample & meter readings"
            desc="Take 3 SPAD chlorophyll meter readings across the target leaf (tip, middle, and base)."
          />
          <Step
            num="3"
            color={color('quickstart')}
            title="Add Sample in app (Offline)"
            desc="Tap 'Add Sample', fill in Clone, Tree, Leaf number, Position, Flush, Garden, and Section. Capture leaf photos."
          />
          <Step
            num="4"
            color={color('quickstart')}
            title="Export records to phone (Offline backup)"
            desc="Tap 'Export Records' at the end of the day to save a CSV spreadsheet and copies of leaf photos onto your phone."
          />
          <Step
            num="5"
            color={color('quickstart')}
            title="Cloud Sync (Back at office)"
            desc="Connect to office Wi-Fi, tap 'Cloud Sync' → 'Sync Now'. Keep the screen open until all records upload."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — Account Registration & Login
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="auth"
          number="2"
          title="Account Registration & Login"
          badge="With & Without Password"
          icon={<KeyRound size={20} color={color('auth')} />}
          color={color('auth')}
          iconBg={bg('auth')}
          isOpen={expanded.auth}
          onToggle={() => toggle('auth')}
        >
          <InfoBanner
            color="#2563EB"
            bg="#EFF6FF"
            text="Log in or register while connected to Wi-Fi/data before going to the tea field. Once authenticated, your session is saved offline indefinitely."
          />
          <Text style={[s.bold, { color: color('auth'), marginTop: 4, marginBottom: 6 }]}>
            How to Register:
          </Text>
          <Bullet
            color={color('auth')}
            title="Register with Password & Passcode"
            desc="Tap 'Register', enter your institutional email, set a password, enter the supervisor research team passcode, tick both consent boxes, and tap 'Create Account'. Enter the 6-digit OTP code sent to your email to verify."
          />
          <Bullet
            color={color('auth')}
            title="Pre-Provisioned (Without Password)"
            desc="If an account was already created for your email by the research supervisor/admin, you do not need to register or remember a password — proceed directly to 'Email Code' sign-in."
          />
          <Text style={[s.bold, { color: color('auth'), marginTop: 12, marginBottom: 6 }]}>
            How to Log In:
          </Text>
          <Bullet
            color={color('auth')}
            title="Option 1: Login With Password"
            desc="On the Login screen, keep the 'Password' tab selected. Enter your email and password, then tap 'Sign In with Password'. Use 'Forgot Password?' if needed."
          />
          <Bullet
            color={color('auth')}
            title="Option 2: Login Without Password (Email Code / OTP)"
            desc="Switch to the 'Email Code' tab, enter your email, and tap 'Send Sign-In Code'. Enter the 6-digit code received in your inbox to log in immediately without a password."
          />
          <InfoBanner
            color="#DC2626"
            bg="#FEF2F2"
            text="⚠ Critical: Do NOT tap 'Logout' in the field without internet. Logging back in requires reaching the auth server."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — Adding a Sample
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="addSample"
          number="3"
          title="How to Add a New Sample"
          badge="Required"
          icon={<Pencil size={20} color={color('addSample')} />}
          color={color('addSample')}
          iconBg={bg('addSample')}
          isOpen={expanded.addSample}
          onToggle={() => toggle('addSample')}
        >
          <Text style={s.bodyText}>
            Tap <Text style={s.bold}>"Add Sample"</Text> on the home screen and fill in each field:
          </Text>
          <Bullet
            color={color('addSample')}
            title="Clone & Tree Number"
            desc="Enter the clone code (e.g. TV1, TV2) and the specific tree number you are collecting from."
          />
          <Bullet
            color={color('addSample')}
            title="Leaf Number & Position"
            desc="Enter which leaf (e.g. 1, 2, 3) and select its position: 1st leaf, 2nd leaf, 3rd leaf, or maintenance leaf."
          />
          <Bullet
            color={color('addSample')}
            title="SPAD Meter Readings"
            desc="Enter your 3 chlorophyll meter readings in the three boxes. The app keeps all 3 values for research analysis."
          />
          <Bullet
            color={color('addSample')}
            title="Flush & Location"
            desc="Choose the current flush season (First, Second, Monsoon, Autumn) and type the Garden and Section names."
          />
          <Bullet
            color={color('addSample')}
            title="Plant Health"
            desc="Tick any health conditions you observe: Healthy, Wilting, Chlorosis, Scorching, Pest Damage, or Disease."
          />
          <Bullet
            color={color('addSample')}
            title="Remarks (Optional)"
            desc="Add any extra notes — recent rain, unusual shade, leaf tears, or anything that might affect the readings."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 4 — Leaf Photography
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="photos"
          number="4"
          title="How to Take Good Leaf Photos"
          badge="Very Important"
          icon={<Camera size={20} color={color('photos')} />}
          color={color('photos')}
          iconBg={bg('photos')}
          isOpen={expanded.photos}
          onToggle={() => toggle('photos')}
        >
          <InfoBanner
            color="#1D4ED8"
            bg="#EFF6FF"
            text="Photo quality directly affects model accuracy. Clear, well-lit photos without shadows are essential for reliable chlorophyll estimation."
          />
          <View style={s.doDontRow}>
            <View style={[s.doBox, { flex: 1 }]}>
              <Text style={[s.doTitle, { color: '#059669' }]}>✅ DO THIS</Text>
              <DoItem text="Place the leaf flat on a plain white sheet of paper" />
              <DoItem text="Shoot indoors or in shade — avoid direct harsh sunlight" />
              <DoItem text="Hold the camera directly above the leaf, parallel to it" />
              <DoItem text="Ensure the whole leaf (tip to stem) is sharply in focus" />
            </View>
            <View style={[s.dontBox, { flex: 1 }]}>
              <Text style={[s.doTitle, { color: '#DC2626' }]}>❌ AVOID</Text>
              <DoItem text="Dark shadows cast by direct sunlight" color="#991B1B" />
              <DoItem text="Blurry photos from hand movement or wind" color="#991B1B" />
              <DoItem text="Fingers covering any part of the leaf blade" color="#991B1B" />
              <DoItem text="Busy or colourful backgrounds that confuse segmentation" color="#991B1B" />
            </View>
          </View>
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 5 — Chlorophyll Meter
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="meter"
          number="5"
          title="Using the Chlorophyll Meter (SPAD)"
          badge="Take 3 Readings"
          icon={<Smartphone size={20} color={color('meter')} />}
          color={color('meter')}
          iconBg={bg('meter')}
          isOpen={expanded.meter}
          onToggle={() => toggle('meter')}
        >
          <Text style={s.bodyText}>
            For every leaf sample, take <Text style={s.bold}>3 separate readings</Text> across the leaf blade using the optical sensor:
          </Text>
          <Step
            num="1"
            color={color('meter')}
            title="Upper part of the leaf (near tip)"
            desc="Clip the meter on the upper half of the leaf, away from the thick central midrib."
          />
          <Step
            num="2"
            color={color('meter')}
            title="Middle of the leaf (opposite side)"
            desc="Move to the middle region of the leaf blade on the opposite side of Reading 1."
          />
          <Step
            num="3"
            color={color('meter')}
            title="Lower part of the leaf (near stem)"
            desc="Take the final reading near the base. Make sure the sensor is fully flat against the leaf."
          />
          <InfoBanner
            color="#7C3AED"
            bg="#F5F3FF"
            text="⚠ Note: Keep optical sensor lenses clean and dry. Avoid placing the sensor directly on thick veins."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 6 — Viewing & Editing Samples
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="viewUpdate"
          number="6"
          title="Viewing & Editing Your Samples"
          badge="Management"
          icon={<Database size={20} color={color('viewUpdate')} />}
          color={color('viewUpdate')}
          iconBg={bg('viewUpdate')}
          isOpen={expanded.viewUpdate}
          onToggle={() => toggle('viewUpdate')}
        >
          <Text style={s.bodyText}>
            Need to check previous entries or correct a mistake?
          </Text>
          <Bullet
            color={color('viewUpdate')}
            title="Open 'View / Update Sample'"
            desc="Tap this option on the home screen to view your entire collection history."
          />
          <Bullet
            color={color('viewUpdate')}
            title="Search for specific samples"
            desc="Use the search bar at the top to filter by Clone, Tree, Leaf number, Garden, or ID."
          />
          <Bullet
            color={color('viewUpdate')}
            title="Inspect details"
            desc="Tap any card to view its recorded metadata, triplicate SPAD readings, and captured photos."
          />
          <Bullet
            color={color('viewUpdate')}
            title="Edit values"
            desc="Tap 'Edit Sample' to correct readings, remarks, or add/replace photos."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 7 — Exporting Data
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="export"
          number="7"
          title="Exporting Data to Your Phone"
          badge="Daily Backup"
          icon={<FileSpreadsheet size={20} color={color('export')} />}
          color={color('export')}
          iconBg={bg('export')}
          isOpen={expanded.export}
          onToggle={() => toggle('export')}
        >
          <InfoBanner
            color="#0D9488"
            bg="#F0FDFA"
            text="Always export before leaving the field — it guarantees your data is safely backed up on your phone storage independent of cloud connectivity."
          />
          <Step
            num="1"
            color={color('export')}
            title="Tap 'Export Records' on the home screen"
            desc="Opens the export manager where you can pick which samples to back up."
          />
          <Step
            num="2"
            color={color('export')}
            title="Select samples"
            desc="Choose specific entries or tap 'Select All' to export everything."
          />
          <Step
            num="3"
            color={color('export')}
            title="Choose folder"
            desc="In Android's folder picker, select a destination folder (e.g. Documents, Downloads, or SD card) and tap 'Use this folder' → 'Allow'."
          />
          <Step
            num="4"
            color={color('export')}
            title="Done!"
            desc="A CSV spreadsheet and all leaf images are copied to a timestamped folder on your phone."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 8 — Cloud Sync
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="sync"
          number="8"
          title="Syncing Data to the Cloud"
          badge="Needs Internet"
          icon={<CloudUpload size={20} color={color('sync')} />}
          color={color('sync')}
          iconBg={bg('sync')}
          isOpen={expanded.sync}
          onToggle={() => toggle('sync')}
        >
          <Text style={s.bodyText}>
            When you return to an area with reliable internet (Wi-Fi or mobile data):
          </Text>
          <Bullet
            color={color('sync')}
            title="Check Cloud Sync status"
            desc="The home screen displays how many samples and photos are waiting for cloud upload."
          />
          <Bullet
            color={color('sync')}
            title="Tap 'Sync Now'"
            desc="The app securely uploads metadata to Supabase and leaf images to storage."
          />
          <Bullet
            color={color('sync')}
            title="Keep app open"
            desc="Do not close or switch apps while upload is running to avoid interrupted network connections."
          />
          <Bullet
            color={color('sync')}
            title="Pause & resume"
            desc="If connection fluctuates, tap 'Pause Sync'. You can safely resume later without losing progress."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 9 — Troubleshooting
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="troubleshooting"
          number="9"
          title="Common Questions & Problems"
          badge="Help"
          icon={<HelpCircle size={20} color={color('troubleshooting')} />}
          color={color('troubleshooting')}
          iconBg={bg('troubleshooting')}
          isOpen={expanded.troubleshooting}
          onToggle={() => toggle('troubleshooting')}
        >
          <Faq
            q="The app asks for 'Location Required' on start. What should I do?"
            a="Ensure phone GPS is on and grant location permission. The app logs GPS coordinates once during initialization for field geotagging."
          />
          <Faq
            q="Can I use this app completely offline?"
            a="YES! Everything works offline (collecting samples, taking photos, exporting CSV and images). You only need internet for logging in the first time and syncing to cloud at the end."
          />
          <Faq
            q="What if I accidentally tap Logout while in the field?"
            a="Avoid logging out in the field without internet, as logging back in requires reaching the auth server. Your offline session stays valid indefinitely as long as you do not log out."
          />
          <Faq
            q="Cloud sync is stuck or slow."
            a="Check your Wi-Fi or mobile signal. Tap 'Pause Sync' → confirm connection → tap 'Resume'. Remember that 'Export Records' is always available as an immediate local backup."
          />
          <Faq
            q="When is it safe to use 'Clear Records'?"
            a="ONLY after you have confirmed that your data is safely exported to CSV or completely synced to the cloud. Clearing permanently removes records from local phone storage."
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 10 — Daily Checklist
        ═══════════════════════════════════════════════════════ */}
        <Section
          id="bestPractices"
          number="10"
          title="Daily Field Checklist"
          badge="Every Day"
          icon={<CheckCircle2 size={20} color={color('bestPractices')} />}
          color={color('bestPractices')}
          iconBg={bg('bestPractices')}
          isOpen={expanded.bestPractices}
          onToggle={() => toggle('bestPractices')}
        >
          <Text style={s.bodyText}>Before heading out to the field:</Text>
          <CheckItem text="Phone battery charged above 80%" />
          <CheckItem text="Phone storage has at least 2 GB free space" />
          <CheckItem text="SPAD meter calibrated and sensor lenses wiped clean" />
          <CheckItem text="App already logged in while on office Wi-Fi" />
          <CheckItem text="Plain white paper or clipboard ready for photo background" />
          <Text style={[s.bodyText, { marginTop: 14, fontWeight: '700', color: color('bestPractices') }]}>
            Before leaving the field:
          </Text>
          <CheckItem text="Exported all samples to phone (CSV + photos)" />
          <Text style={[s.bodyText, { marginTop: 14, fontWeight: '700', color: color('bestPractices') }]}>
            When back at office:
          </Text>
          <CheckItem text="Ran Cloud Sync and verified all samples uploaded" />
        </Section>

        {/* ── BACK BUTTON ─────────────────────────────────────── */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backFooterBtn, pressed && { opacity: 0.8 }]}
        >
          <ArrowLeft size={18} color={C.white} />
          <Text style={s.backFooterText}>Back to Home</Text>
        </Pressable>

        <Text style={s.footer}>
          Tocklai Tea Research Institute • TTRI Research Documentation
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function Section({
  number,
  title,
  badge,
  icon,
  color,
  iconBg,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  number: string;
  title: string;
  badge?: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={[sc.card, isOpen && { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Pressable onPress={onToggle} style={sc.header}>
        <View style={[sc.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={sc.titleWrap}>
          <Text style={sc.number} numberOfLines={1}>
            <Text style={{ color }}>{number}. </Text>
            {title}
          </Text>
          {badge && (
            <View style={[sc.badge, { backgroundColor: `${color}18` }]}>
              <Text style={[sc.badgeText, { color }]}>{badge}</Text>
            </View>
          )}
        </View>
        <ChevronDown
          size={20}
          color="#94A3B8"
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen && <View style={sc.body}>{children}</View>}
    </View>
  );
}

function Step({ num, color, title, desc }: { num: string; color: string; title: string; desc: string }) {
  return (
    <View style={sc.step}>
      <View style={[sc.stepNum, { backgroundColor: color }]}>
        <Text style={sc.stepNumText}>{num}</Text>
      </View>
      <View style={sc.stepContent}>
        <Text style={sc.stepTitle}>{title}</Text>
        <Text style={sc.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function Bullet({ color, title, desc }: { color: string; title: string; desc: string }) {
  return (
    <View style={sc.bullet}>
      <View style={[sc.bulletDot, { backgroundColor: color }]} />
      <Text style={sc.bulletText}>
        <Text style={[sc.bold, { color }]}>{title}: </Text>
        <Text style={sc.bulletDesc}>{desc}</Text>
      </Text>
    </View>
  );
}

function InfoBanner({ color, bg, text }: { color: string; bg: string; text: string }) {
  return (
    <View style={[sc.banner, { backgroundColor: bg, borderLeftColor: color }]}>
      <Text style={[sc.bannerText, { color }]}>{text}</Text>
    </View>
  );
}

function DoItem({ text, color = '#166534' }: { text: string; color?: string }) {
  return (
    <View style={sc.doItem}>
      <ChevronRight size={12} color={color} style={{ marginTop: 2 }} />
      <Text style={[sc.doText, { color }]}>{text}</Text>
    </View>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <View style={sc.faq}>
      <Text style={sc.faqQ}>❓ {q}</Text>
      <Text style={sc.faqA}>{a}</Text>
    </View>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={sc.checkItem}>
      <CheckCircle2 size={18} color="#16A34A" />
      <Text style={sc.checkText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page:   { flex: 1, backgroundColor: C.page },
  scroll: { paddingBottom: 40 },

  /* Horizontal Header Card */
  headerCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#D8E2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextGroup: {
    flex: 1,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  topTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: C.blue,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  /* Control bar */
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 2,
  },
  moduleCount: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  moduleCountText: { fontSize: 11, fontWeight: '800', color: C.textMid, letterSpacing: 0.5 },
  controlBtns: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: C.blue },

  /* Body text */
  bodyText: { fontSize: 14, color: C.textMid, lineHeight: 22, marginBottom: 10 },
  bold:     { fontWeight: '700', color: C.text },

  /* Do / Don't */
  doDontRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  doBox:   { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, gap: 6 },
  dontBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, gap: 6 },
  doTitle: { fontSize: 12, fontWeight: '800', marginBottom: 4 },

  /* Back footer */
  backFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.navy,
    marginHorizontal: 16,
    borderRadius: 14,
    height: 52,
    marginTop: 14,
    shadowColor: C.navy,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  backFooterText: { color: C.white, fontSize: 15, fontWeight: '700' },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: C.textMuted,
    marginTop: 16,
    lineHeight: 18,
  },
});

const sc = StyleSheet.create({
  /* Section card */
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderLeftWidth: 0,
    borderLeftColor: 'transparent',
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  number:   { fontSize: 15, fontWeight: '700', color: C.text },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#EEF2FF',
  },

  /* Step */
  step: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText:  { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepContent:  { flex: 1 },
  stepTitle:    { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 3, lineHeight: 20 },
  stepDesc:     { fontSize: 13, color: C.textMid, lineHeight: 20 },

  /* Bullet */
  bullet: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 8, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 13.5, lineHeight: 21 },
  bold:       { fontWeight: '700' },
  bulletDesc: { color: C.textMid },

  /* Banner */
  banner: {
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: { fontSize: 13.5, lineHeight: 21, fontWeight: '500' },

  /* Do/Don't item */
  doItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginBottom: 4 },
  doText: { flex: 1, fontSize: 12, lineHeight: 18 },

  /* FAQ */
  faq: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  faqQ: { fontSize: 13.5, fontWeight: '700', color: C.text, marginBottom: 6, lineHeight: 20 },
  faqA: { fontSize: 13, color: C.textMid, lineHeight: 20 },

  /* Checklist */
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  checkText: { flex: 1, fontSize: 13.5, color: '#166534', lineHeight: 20 },
});
