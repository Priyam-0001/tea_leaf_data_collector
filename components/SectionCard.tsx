import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  COLORS,
  FONT_SIZES,
  LAYOUT,
  RADIUS,
  SHADOW,
  SPACING,
} from '@/constants/theme';

interface SectionCardProps extends PropsWithChildren {
  title: string;
}

export function SectionCard({
  title,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.divider} />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,

    borderRadius: RADIUS.lg,

    padding: SPACING.lg,

    // marginBottom: LAYOUT.sectionGap,

    ...SHADOW,
  },

  title: {
    fontSize: FONT_SIZES.sectionTitle,
    fontWeight: '700',

    color: COLORS.text,
  },

  divider: {
    height: 1,

    backgroundColor: COLORS.divider,

    marginVertical: SPACING.md,
  },

  content: {
    gap: LAYOUT.fieldGap,
  },
});