import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAlertStore } from '@/store/alertStore';

export default function AlertBar() {
  const {
    visible,
    type,
    message,
    hideAlert,
  } = useAlertStore();

  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const config = {
    error: {
      icon: AlertCircle,
      title: 'Error',
      color: '#db2424f3'
    },
    success: {
      icon: CheckCircle2,
      title: 'Success',
      color: '#24db4cf3'
    },
    warning: {
      icon: TriangleAlert,
      title: 'Warning',
      color: '#db8c24f3'
    },
    info: {
      icon: Info,
      title: 'Info',
      color: '#2464dbf3'
    },
  };

  const Icon = config[type].icon;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }],
        backgroundColor: config[type].color },
      ]}
    >
      <View style={styles.content}>
        <Icon size={22} color="#FFFFFF" />

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {config[type].title}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>
        </View>

        <Pressable onPress={hideAlert} hitSlop={10}>
          <X size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
    borderRadius: 12,
    // backgroundColor: '#db2424',
  },

  content: {
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  message: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});