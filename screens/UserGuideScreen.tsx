import { ActionButton } from '@/components/ActionButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';
import { router } from 'expo-router';
import {
  AlertTriangle,
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
  Trash2,
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

interface GuideSection {
  id: string;
  title: string;
  badge?: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

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
        {/* Top Header */}
        <ScreenHeader
          title="User Guide & Training"
          subtitle="Complete field data collection walkthrough"
        />

        {/* Supervision & Scientific Purpose Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <BookOpen size={16} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>Tocklai Tea Research Institute</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Tea Leaf Data Collector</Text>
          <Text style={styles.heroDescription}>
            This application is designed for field collectors and researchers to capture
            high-resolution leaf images paired with SPAD chlorophyll meter readings and
            agronomic metadata for machine learning model development.
          </p>
          <View style={styles.supervisorRow}>
            <Info size={14} color="#C8EED5" />
            <Text style={styles.supervisorText}>
              Developed under the supervision of{' '}
              <Text style={styles.boldText}>Dr. Sangeeta Borchetia</Text> &{' '}
              <Text style={styles.boldText}>Dr. Prabir Barooah</Text>.
            </Text>
          </View>
        </View>

        {/* Quick Action bar */}
        <View style={styles.controlRow}>
          <Text style={styles.sectionCountText}>9 Training Modules</Text>
          <View style={styles.toggleButtons}>
            <Pressable onPress={expandAll} style={styles.textBtn}>
              <Text style={styles.textBtnLabel}>Expand All</Text>
            </Pressable>
            <Text style={styles.separator}>•</Text>
            <Pressable onPress={collapseAll} style={styles.textBtn}>
              <Text style={styles.textBtnLabel}>Collapse All</Text>
            </Pressable>
          </View>
        </View>

        {/* 1. Quick Start Workflow */}
        <AccordionCard
          id="quickstart"
          title="1. Quick-Start 5-Step Workflow"
          badge="Essential"
          icon={<Zap size={20} color={COLORS.primary} />}
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
              desc="Connect to office Wi-Fi, tap 'Cloud Sync' $\rightarrow$ 'Sync Now'. Keep the screen open until all records are uploaded."
            />
          </View>
        </AccordionCard>

        {/* 2. Adding a New Sample */}
        <AccordionCard
          id="addSample"
          title="2. Adding a New Sample"
          icon={<Pencil size={20} color={COLORS.primary} />}
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
          icon={<Camera size={20} color="#D97706" />}
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
          icon={<Smartphone size={20} color={COLORS.primary} />}
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
          icon={<Database size={20} color={COLORS.primary} />}
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
          icon={<FileSpreadsheet size={20} color="#0D9488" />}
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
              desc="The Android folder picker will appear. Select a folder (e.g. Documents, Downloads, or an SD card folder) and tap 'Use this folder' $\rightarrow$ 'Allow'."
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
          icon={<CloudUpload size={20} color={COLORS.tertiary} />}
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
          icon={<AlertTriangle size={20} color="#DC2626" />}
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
            a="Check your Wi-Fi or mobile data signal. If stuck, tap 'Pause Sync' $\rightarrow$ verify your connection $\rightarrow$ tap 'Resume Sync'. Remember you can always use 'Export Records' as an immediate offline backup."
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
          icon={<ShieldCheck size={20} color={COLORS.primary} />}
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
            label="Back to Home"
            onPress={() => router.back()}
            variant="secondary"
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
  icon,
  children,
  isExpanded,
  onToggle,
}: {
  id: string;
  title: string;
  badge?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconCircle}>{icon}</View>
          <View style={styles.cardHeaderTitles}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{title}</Text>
              {badge && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{badge}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color={COLORS.textSecondary} />
        ) : (
          <ChevronDown size={20} color={COLORS.textSecondary} />
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
      <CheckCircle2 size={18} color={COLORS.primary} />
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
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },

  // Hero Card
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: SPACING.xs,
  },
  heroDescription: {
    color: '#E8F5E9',
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  supervisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  supervisorText: {
    color: '#C8EED5',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },

  // Action / Count Bar
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  sectionCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  textBtnLabel: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  separator: {
    color: COLORS.border,
  },

  // Accordion Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
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
    backgroundColor: '#F1F8F1',
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
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
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
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: '#FAFAFA',
  },

  // Common typography inside card
  bodyText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginVertical: SPACING.xs,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },

  // Step item
  stepList: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  stepItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primary,
    marginTop: 7,
  },
  bulletText: {
    fontSize: 13,
    color: COLORS.text,
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
    fontSize: 13,
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
    fontSize: 13,
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
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginVertical: 4,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  checkText: {
    fontSize: 13,
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
