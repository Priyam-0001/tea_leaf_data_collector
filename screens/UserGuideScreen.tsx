import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';
import { router } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Database,
  FileSpreadsheet,
  HelpCircle,
  Info,
  MapPin,
  Pencil,
  ShieldCheck,
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

export default function UserGuideScreen() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    quickstart: true,
    addSample: false,
    photos: false,
    meter: false,
    viewUpdate: false,
    export: false,
    sync: false,
    troubleshooting: false,
    bestPractices: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    setExpandedSections({
      quickstart: true,
      addSample: true,
      photos: true,
      meter: true,
      viewUpdate: true,
      export: true,
      sync: true,
      troubleshooting: true,
      bestPractices: true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      quickstart: false,
      addSample: false,
      photos: false,
      meter: false,
      viewUpdate: false,
      export: false,
      sync: false,
      troubleshooting: false,
      bestPractices: false,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation & Header */}
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <ArrowLeft size={22} color="#1E293B" />
          </Pressable>

          <View style={styles.headerTextGroup}>
            <View style={styles.headerTagRow}>
              <View style={styles.headerTag}>
                <BookOpen size={11} color="#2563EB" />
                <Text style={styles.headerTagText}>FIELD TRAINING MANUAL</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>
              User Guide & <Text style={styles.headerTitleHighlight}>Training</Text>
            </Text>
            <Text style={styles.headerSubtitle}>
              Standardized field protocol & ML dataset guide
            </Text>
          </View>
        </View>

        {/* Supervision & Scientific Purpose Card (Clean, modern academic design) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.instituteBadge}>
              <Text style={styles.instituteBadgeText}>Tocklai Tea Research Institute</Text>
            </View>
            <View style={styles.protocolBadge}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.protocolBadgeText}>Official Guide</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Tea Leaf Data Collection Protocol</Text>
          <Text style={styles.heroDescription}>
            Standard field procedure for researchers and collectors to capture high-resolution leaf imagery, triplicate SPAD-502 chlorophyll measurements, and field metadata for ML model training.
          </Text>

          {/* Supervisor Card */}
          <View style={styles.supervisorBox}>
            <View style={styles.supervisorIconWrapper}>
              <Info size={15} color="#2563EB" />
            </View>
            <View style={styles.supervisorContent}>
              <Text style={styles.supervisorHeader}>SCIENTIFIC SUPERVISION</Text>
              <Text style={styles.supervisorNames}>
                Dr. Sangeeta Borchetia <Text style={styles.supervisorAmp}>&</Text> Dr. Prabir Barooah
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Action bar */}
        <View style={styles.controlRow}>
          <View style={styles.modulesCountChip}>
            <Text style={styles.modulesCountText}>9 MODULES</Text>
          </View>
          <View style={styles.toggleButtons}>
            <Pressable onPress={expandAll} style={styles.actionChip}>
              <Text style={styles.actionChipText}>Expand All</Text>
            </Pressable>
            <Pressable onPress={collapseAll} style={styles.actionChip}>
              <Text style={styles.actionChipText}>Collapse All</Text>
            </Pressable>
          </View>
        </View>

        {/* 1. Quick Start Workflow */}
        <AccordionCard
          id="quickstart"
          title="1. Quick-Start 5-Step Workflow"
          badge="Essential"
          badgeColor="#D97706"
          icon={<Zap size={19} color="#D97706" />}
          iconBg="#FEF3C7"
          isExpanded={expandedSections.quickstart}
          onToggle={() => toggleSection('quickstart')}
        >
          <View style={styles.stepList}>
            <StepItem
              number="1"
              title="Before going to the field (Online)"
              desc="Log in to the app while connected to Wi-Fi or mobile network. The session stays saved offline."
            />
            <StepItem
              number="2"
              title="Collect tea sample & meter readings"
              desc="Record 3 SPAD readings on the target leaf and observe plant health (healthy, chlorosis, pests, etc.)."
            />
            <StepItem
              number="3"
              title="Add Sample in app (Offline)"
              desc="Open 'Add Sample', fill in Clone, Tree, Leaf number, Position, Flush, Garden, and Section. Capture leaf photos."
            />
            <StepItem
              number="4"
              title="Export records to SD Card / Phone (Offline backup)"
              desc="Go to 'Export Records' at the end of the day to generate a CSV file and copy of images directly into your phone storage."
            />
            <StepItem
              number="5"
              title="Cloud Sync (When back in office)"
              desc="Connect to office Wi-Fi, tap 'Cloud Sync' → 'Sync Now'. Keep the screen open until all records are uploaded."
            />
          </View>
        </AccordionCard>

        {/* 2. Adding a New Sample */}
        <AccordionCard
          id="addSample"
          title="2. Adding a New Sample"
          badge="Required"
          badgeColor="#059669"
          icon={<Pencil size={19} color="#059669" />}
          iconBg="#ECFDF5"
          isExpanded={expandedSections.addSample}
          onToggle={() => toggleSection('addSample')}
        >
          <Text style={styles.bodyText}>
            Tap <Text style={styles.boldText}>"Add Sample"</Text> on the home screen.
            Complete each section carefully:
          </Text>

          <View style={styles.bulletList}>
            <BulletPoint
              title="Sample Information"
              desc="Enter Clone number (e.g. TV1, TV2), Tree number, Leaf number, and select the exact Leaf Position (1st leaf, 2nd leaf, 3rd leaf, maintenance leaf)."
            />
            <BulletPoint
              title="Meter Readings"
              desc="Input 3 distinct chlorophyll meter readings (SPAD values). The app automatically stores all 3 for research averaging."
            />
            <BulletPoint
              title="Flush & Location"
              desc="Choose the active Flush (First, Second, Monsoon, Autumn) and specify the Garden and Section names."
            />
            <BulletPoint
              title="Plant Health Assessment"
              desc="Check any active stress conditions: Healthy, Wilting, Chlorosis, Scorching, Pest Damage, or Disease."
            />
            <BulletPoint
              title="Remarks"
              desc="Optional field notes (e.g. recent rainfall, unusual shading, or physical leaf tears)."
            />
          </View>
        </AccordionCard>

        {/* 3. Image Capture Protocol */}
        <AccordionCard
          id="photos"
          title="3. Leaf Photography Guidelines"
          badge="Critical for ML"
          badgeColor="#2563EB"
          icon={<Camera size={19} color="#2563EB" />}
          iconBg="#EFF6FF"
          isExpanded={expandedSections.photos}
          onToggle={() => toggleSection('photos')}
        >
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Why photo quality matters:</Text>
            <Text style={styles.tipText}>
              The AI/Deep Learning model learns chlorophyll concentration directly from visual
              features (green shades, vein texture, and color variations). Poor photos degrade model accuracy.
            </Text>
          </View>

          <View style={styles.doDontContainer}>
            <View style={styles.doBox}>
              <Text style={styles.doTitle}>DO (Recommended)</Text>
              <Text style={styles.doText}>• Lay leaf flat on a clean white/neutral background.</Text>
              <Text style={styles.doText}>• Capture under uniform, diffused lighting (indoors or shaded).</Text>
              <Text style={styles.doText}>• Keep the camera parallel to the leaf surface without tilting.</Text>
              <Text style={styles.doText}>• Ensure the entire leaf including petiole and apex is in focus.</Text>
            </View>

            <View style={styles.dontBox}>
              <Text style={styles.dontTitle}>AVOID</Text>
              <Text style={styles.dontText}>• Harsh direct sunlight casting high-contrast dark shadows.</Text>
              <Text style={styles.dontText}>• Blurry photos caused by hand shake or wind movement.</Text>
              <Text style={styles.dontText}>• Fingers covering portions of the leaf blade.</Text>
              <Text style={styles.dontText}>• Cluttered colorful backgrounds that confuse AI segmentation.</Text>
            </View>
          </View>
        </AccordionCard>

        {/* 4. Meter Readings (SPAD) */}
        <AccordionCard
          id="meter"
          title="4. Chlorophyll Meter (SPAD) Instructions"
          badge="Triplicate"
          badgeColor="#7C3AED"
          icon={<Smartphone size={19} color="#7C3AED" />}
          iconBg="#F5F3FF"
          isExpanded={expandedSections.meter}
          onToggle={() => toggleSection('meter')}
        >
          <Text style={styles.bodyText}>
            For each sample, take <Text style={styles.boldText}>3 separate measurements</Text> across the leaf blade using the optical meter:
          </Text>

          <View style={styles.bulletList}>
            <BulletPoint
              title="Reading 1"
              desc="Upper half of the leaf (near tip), avoiding the main thick midrib."
            />
            <BulletPoint
              title="Reading 2"
              desc="Middle region of the leaf blade, on the opposite side of Reading 1."
            />
            <BulletPoint
              title="Reading 3"
              desc="Lower half of the leaf (near base), ensuring full sensor contact."
            />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              <Text style={styles.boldText}>Important:</Text> Keep the optical sensor clean and dry. Avoid placing the sensor directly on major thick veins to ensure consistent readings.
            </Text>
          </View>
        </AccordionCard>

        {/* 5. View, Search & Edit Samples */}
        <AccordionCard
          id="viewUpdate"
          title="5. Reviewing & Editing Samples"
          badge="Management"
          badgeColor="#4F46E5"
          icon={<Database size={19} color="#4F46E5" />}
          iconBg="#EEF2FF"
          isExpanded={expandedSections.viewUpdate}
          onToggle={() => toggleSection('viewUpdate')}
        >
          <Text style={styles.bodyText}>
            Need to check previous records or correct an entry?
          </Text>

          <View style={styles.bulletList}>
            <BulletPoint
              title="Locate sample"
              desc="Tap 'View/Update Sample' on the Home screen. Use the search bar to filter by Clone, Tree, Leaf number, Garden, or Sample ID."
            />
            <BulletPoint
              title="Inspect details"
              desc="Tap any sample card to review all recorded metadata, SPAD readings, and captured photos."
            />
            <BulletPoint
              title="Edit values"
              desc="Tap 'Edit Sample' to update meter values, remarks, or add/remove photos if an error was noticed."
            />
          </View>
        </AccordionCard>

        {/* 6. Exporting to Phone Storage (CSV + Images) */}
        <AccordionCard
          id="export"
          title="6. Data Export (Offline CSV & Images)"
          badge="Crucial Backup"
          badgeColor="#0D9488"
          icon={<FileSpreadsheet size={19} color="#0D9488" />}
          iconBg="#CCFBF1"
          isExpanded={expandedSections.export}
          onToggle={() => toggleSection('export')}
        >
          <Text style={styles.bodyText}>
            Always perform an export before leaving the field. This ensures your collected data
            is safely stored on your phone storage independently of cloud sync:
          </Text>

          <View style={styles.stepList}>
            <StepItem
              number="1"
              title="Open Export Screen"
              desc="Tap 'Export Records' on the Home screen."
            />
            <StepItem
              number="2"
              title="Select Samples"
              desc="Tap 'Export Records'. You can choose individual samples or tap 'Select All'."
            />
            <StepItem
              number="3"
              title="Choose Destination Folder"
              desc="The Android folder picker will appear. Select a folder (e.g. Documents, Downloads, or an SD card folder) and tap 'Use this folder' → 'Allow'."
            />
            <StepItem
              number="4"
              title="Verify Output"
              desc="The app generates a CSV spreadsheet with all fields and saves copies of all leaf images into a timestamped subfolder."
            />
          </View>
        </AccordionCard>

        {/* 7. Cloud Synchronization */}
        <AccordionCard
          id="sync"
          title="7. Cloud Synchronization"
          badge="Online Only"
          badgeColor="#0284C7"
          icon={<CloudUpload size={19} color="#0284C7" />}
          iconBg="#E0F2FE"
          isExpanded={expandedSections.sync}
          onToggle={() => toggleSection('sync')}
        >
          <Text style={styles.bodyText}>
            When you return to an area with stable internet (Wi-Fi or 4G/5G):
          </Text>

          <View style={styles.bulletList}>
            <BulletPoint
              title="Check Status"
              desc="Look at the 'Cloud Sync' card on the Home screen. It displays how many samples and images are awaiting sync."
            />
            <BulletPoint
              title="Tap 'Sync Now'"
              desc="The app will upload sample metadata to Supabase and leaf images to cloud storage."
            />
            <BulletPoint
              title="Keep App Open"
              desc="Do not switch apps or close the screen while synchronization is running to avoid interrupted network connections."
            />
            <BulletPoint
              title="Pause & Resume"
              desc="If network gets unstable, tap 'Pause Sync'. You can resume anytime without losing progress."
            />
          </View>
        </AccordionCard>

        {/* 8. Troubleshooting & FAQ */}
        <AccordionCard
          id="troubleshooting"
          title="8. Troubleshooting & FAQ"
          badge="Support"
          badgeColor="#475569"
          icon={<HelpCircle size={19} color="#475569" />}
          iconBg="#F1F5F9"
          isExpanded={expandedSections.troubleshooting}
          onToggle={() => toggleSection('troubleshooting')}
        >
          <FaqItem
            q="The app says 'Location Required' on start. What should I do?"
            a="Ensure phone GPS is enabled and grant Location permission when prompted. If photos are captured indoors at the lab, the app still requires initial GPS permission once during startup."
          />
          <FaqItem
            q="Can I use the app completely offline without internet?"
            a="YES! The app uses an internal SQLite database and offline phone storage. You only need internet for two actions: initial login and final cloud sync."
          />
          <FaqItem
            q="What if I accidentally tap Logout while in the field?"
            a="DO NOT log out in the field if there is no internet, because logging back in requires internet to reach the authentication server. If you stay logged in, the app works 100% offline."
          />
          <FaqItem
            q="Cloud sync is taking too long or stalled on an image."
            a="Check your Wi-Fi or mobile data signal. If stuck, tap 'Pause Sync' → verify your connection → tap 'Resume Sync'. Remember you can always use 'Export Records' as an immediate offline backup."
          />
          <FaqItem
            q="When should I use 'Clear Records'?"
            a="ONLY after you have confirmed that your data is safely exported to CSV or successfully synced to the cloud. Clearing records permanently deletes them from local phone storage."
          />
        </AccordionCard>

        {/* 9. Best Practices Checklist */}
        <AccordionCard
          id="bestPractices"
          title="9. Daily Field Checklist"
          badge="Daily"
          badgeColor="#16A34A"
          icon={<CheckCircle2 size={19} color="#16A34A" />}
          iconBg="#DCFCE7"
          isExpanded={expandedSections.bestPractices}
          onToggle={() => toggleSection('bestPractices')}
        >
          <View style={styles.checklist}>
            <ChecklistItem text="Phone battery charged above 80% before heading to field." />
            <ChecklistItem text="Phone storage has at least 2 GB of free space." />
            <ChecklistItem text="SPAD meter calibrated and sensor lenses wiped clean." />
            <ChecklistItem text="App already logged in while on office Wi-Fi." />
            <ChecklistItem text="Neutral white sheet / clipboard ready for leaf photography." />
            <ChecklistItem text="End-of-day: Exported all records to phone folder (CSV + images)." />
            <ChecklistItem text="Office return: Ran Cloud Sync to upload all data to the research server." />
          </View>
        </AccordionCard>

        {/* Bottom Back Button */}
        <View style={styles.bottomButtons}>
          <ActionButton
            label="Back to Home Dashboard"
            onPress={() => router.back()}
            variant="guide"
            icon={<ArrowLeft size={20} color="#FFFFFF" />}
          />
        </View>

        {/* Footer info */}
        <Text style={styles.footerNote}>
          Tea Leaf Data Collection System • TTRI Research Documentation
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// Helper UI Components
// -------------------------------------------------------------

function AccordionCard({
  id,
  title,
  badge,
  badgeColor,
  icon,
  iconBg,
  children,
  isExpanded,
  onToggle,
}: {
  id: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  iconBg?: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconCircle, iconBg ? { backgroundColor: iconBg } : null]}>
            {icon}
          </View>
          <View style={styles.cardHeaderTitles}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{title}</Text>
              {badge && (
                <View style={[styles.badgePill, badgeColor ? { backgroundColor: `${badgeColor}15` } : null]}>
                  <Text style={[styles.badgePillText, badgeColor ? { color: badgeColor } : null]}>
                    {badge}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color="#64748B" />
        ) : (
          <ChevronDown size={20} color="#64748B" />
        )}
      </Pressable>

      {isExpanded && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
}

function StepItem({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function BulletPoint({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.bulletItem}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>
        <Text style={styles.boldText}>{title}: </Text>
        {desc}
      </Text>
    </View>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>Q: {q}</Text>
      <Text style={styles.faqAnswer}>{a}</Text>
    </View>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <CheckCircle2 size={18} color="#16A34A" />
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

// -------------------------------------------------------------
// Stylesheet
// -------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: 14,
  },

  // Navigation & Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonPressed: {
    backgroundColor: '#F1F5F9',
    opacity: 0.8,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTagRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerTitleHighlight: {
    color: '#2563EB',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  // Hero Card (Clean, modern academic white surface with subtle slate accents)
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  instituteBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instituteBadgeText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  protocolBadgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  heroDescription: {
    color: '#475569',
    fontSize: 13.5,
    lineHeight: 20,
  },
  supervisorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  supervisorIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supervisorContent: {
    flex: 1,
  },
  supervisorHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  supervisorNames: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  supervisorAmp: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // Action / Count Bar
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  modulesCountChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modulesCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  toggleButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionChipText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },

  // Accordion Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitles: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgePillText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: SPACING.md,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFCFF',
  },

  // Common typography inside card
  bodyText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginVertical: SPACING.xs,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },

  // Step item
  stepList: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  stepItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },

  // Bullet list
  bulletList: {
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginTop: 7,
  },
  bulletText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    flex: 1,
  },

  // Tip box
  tipBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
  },

  // Note Box
  noteBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  noteText: {
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
  },

  // Do / Don't
  doDontContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  doBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: 4,
  },
  doTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  doText: {
    fontSize: 12,
    color: '#14532D',
    lineHeight: 17,
  },
  dontBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    gap: 4,
  },
  dontTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  dontText: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 17,
  },

  // FAQ
  faqItem: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 4,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },

  // Checklist
  checklist: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkText: {
    fontSize: 12.5,
    color: '#1E293B',
    flex: 1,
    lineHeight: 18,
  },

  // Bottom Buttons
  bottomButtons: {
    marginTop: SPACING.sm,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#64748B',
    marginTop: SPACING.xs,
  },
});
