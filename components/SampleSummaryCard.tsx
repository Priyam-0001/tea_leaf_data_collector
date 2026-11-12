import { ChevronRight, Clock, Image as ImageIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Sample } from '@/types/sample';

interface SampleSummaryCardProps {
  sample: Sample;
  onPress: () => void;
}

function formatCreatedDate(createdAt: string) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? createdAt
    : date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function SampleSummaryCard({ sample, onPress }: SampleSummaryCardProps) {
  const imageCount = sample.images?.length ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.cloneBadge}>
            <Text style={styles.cloneBadgeText}>
              Clone: {sample.cloneNumber || 'N/A'}
            </Text>
          </View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>
              Tree #{sample.treeNumber || '-'} • Leaf #{sample.leafNumber || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.imageBadge}>
          <ImageIcon size={12} color={imageCount > 0 ? '#16A34A' : '#94A3B8'} />
          <Text
            style={[
              styles.imageBadgeText,
              { color: imageCount > 0 ? '#16A34A' : '#94A3B8' },
            ]}
          >
            {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
          </Text>
        </View>
      </View>

      <View style={styles.middleRow}>
        <Text style={styles.idLabel}>
          ID: <Text style={styles.idValue}>{sample.id.slice(0, 18)}…</Text>
        </Text>
        <ChevronRight size={18} color="#94A3B8" />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.dateGroup}>
          <Clock size={12} color="#94A3B8" />
          <Text style={styles.dateText}>
            {formatCreatedDate(sample.createdAt)}
          </Text>
        </View>
        {sample.gardenName ? (
          <Text style={styles.gardenText} numberOfLines={1}>
            {sample.gardenName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    gap: 10,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  cloneBadge: {
    backgroundColor: '#0D1F3C',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cloneBadgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgeText: {
    color: '#334155',
    fontSize: 11.5,
    fontWeight: '700',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  idLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  idValue: {
    fontFamily: 'monospace',
    color: '#1E293B',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  gardenText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    maxWidth: '45%',
  },
});
