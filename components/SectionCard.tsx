import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const C = {
  navy: '#0D1F3C',
  card: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#EDF2F7',
};

interface SectionCardProps extends PropsWithChildren {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
}

export function SectionCard({
  title,
  badge,
  icon,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    flexShrink: 1,
  },

  title: {
    fontSize: 16.5,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: 0.2,
    flex: 1,
    flexShrink: 1,
  },

  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'center',
    flexShrink: 0,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 14,
  },

  content: {
    gap: 14,
  },
});
