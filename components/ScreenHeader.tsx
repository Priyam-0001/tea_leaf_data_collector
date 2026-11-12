import { router } from 'expo-router';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  textMuted: '#7A90B8',
  blue: '#2563EB',
  blueBorder: '#BFDBFE',
  card: '#FFFFFF',
  border: '#D0DCEF',
};

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showGuideButton?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  showGuideButton = true,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Horizontal Nav Bar with centered title */}
      <View style={styles.horizontalCard}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack || (() => router.back())}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={C.navy} />
        </TouchableOpacity>

        <View style={styles.centerTitleWrap}>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        {showGuideButton ? (
          <TouchableOpacity
            style={styles.guideBtn}
            onPress={() => router.push('/user-guide')}
            activeOpacity={0.75}
          >
            <BookOpen size={12} color={C.blue} />
            <Text style={styles.guideText}>Guide</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingTop: 4,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0DCEF',
  },
  centerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: C.blueBorder,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 5,
  },
  guideText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.blue,
  },
  placeholder: {
    width: 38,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
  },
});
