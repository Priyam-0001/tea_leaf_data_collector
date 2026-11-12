import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAlertStore } from '@/store/alertStore';

export default function AlertBar() {
  const { visible, type, message, hideAlert } = useAlertStore();
  const [translateY] = useState(() => new Animated.Value(-120));

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) return null;

  const config = {
    error: {
      icon: AlertCircle,
      title: 'Action Failed',
      bg: '#FEF2F2',
      border: '#FECACA',
      iconColor: '#DC2626',
      titleColor: '#991B1B',
      msgColor: '#B91C1C',
    },
    success: {
      icon: CheckCircle2,
      title: 'Success',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      iconColor: '#16A34A',
      titleColor: '#166534',
      msgColor: '#15803D',
    },
    warning: {
      icon: TriangleAlert,
      title: 'Attention',
      bg: '#FFFBEB',
      border: '#FDE68A',
      iconColor: '#D97706',
      titleColor: '#92400E',
      msgColor: '#B45309',
    },
    info: {
      icon: Info,
      title: 'Notice',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      iconColor: '#2563EB',
      titleColor: '#1E40AF',
      msgColor: '#1D4ED8',
    },
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: current.bg,
          borderColor: current.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: current.bg }]}>
          <Icon size={22} color={current.iconColor} strokeWidth={2.2} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: current.titleColor }]}>
            {current.title}
          </Text>
          <Text style={[styles.message, { color: current.msgColor }]}>
            {message}
          </Text>
        </View>

        <Pressable
          onPress={hideAlert}
          hitSlop={12}
          style={styles.closeBtn}
        >
          <X size={18} color={current.titleColor} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },

  content: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 2,
  },

  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
