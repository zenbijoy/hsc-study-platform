import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme';
import { motion, useReducedMotionPreference } from '@/src/theme/motion';
import { AppText } from '../ui/Typography';

export function BootSplashScreen({
  statusMessage,
  onAnimationComplete,
}: {
  statusMessage?: string;
  onAnimationComplete?: () => void;
}) {
  const theme = useTheme();
  const reducedMotion = useReducedMotionPreference();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const dotOpacity = useRef(new Animated.Value(0.3)).current;
  const [delayedMessage, setDelayedMessage] = useState(false);

  useEffect(() => {
    // Show secondary status text only if boot takes > 700ms
    const timer = setTimeout(() => setDelayedMessage(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: motion.timing.normal,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: motion.spring.snappy.damping,
          stiffness: motion.spring.snappy.stiffness,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [reducedMotion]);

  return (
    <View
      style={{ backgroundColor: theme.colors.background }}
      className="flex-1 items-center justify-between py-16 px-6"
    >
      {/* Top Spacer */}
      <View />

      {/* Center Brand Identity */}
      <Animated.View
        style={[
          { opacity: opacityAnim },
          !reducedMotion && { transform: [{ scale: scaleAnim }] },
        ]}
        className="items-center"
      >
        {/* Brand Icon Box */}
        <View
          style={{
            backgroundColor: 'rgba(87, 224, 183, 0.12)',
            borderColor: 'rgba(87, 224, 183, 0.30)',
            borderWidth: 1,
            borderRadius: theme.radius['3xl'],
            width: 88,
            height: 88,
          }}
          className="items-center justify-center mb-5"
        >
          <Ionicons name="school" size={44} color={theme.colors.primary} />
        </View>

        {/* Title */}
        <AppText variant="headlineLarge" color="primary" align="center" style={{ fontWeight: '800' }}>
          HSC Study Platform
        </AppText>
        <AppText variant="bodyMedium" color="muted" align="center" className="mt-1.5">
          Learn smarter. Anywhere.
        </AppText>
      </Animated.View>

      {/* Bottom Loading Progress / Friendly Status */}
      <View className="items-center">
        <Animated.View style={{ opacity: dotOpacity }} className="flex-row items-center gap-1.5 mb-2">
          <View className="h-2 w-2 rounded-full bg-mint" />
          <View className="h-2 w-2 rounded-full bg-mint" />
          <View className="h-2 w-2 rounded-full bg-mint" />
        </Animated.View>

        <AppText variant="caption" color="muted" align="center">
          {delayedMessage && statusMessage
            ? statusMessage
            : 'Preparing your study environment…'}
        </AppText>
      </View>
    </View>
  );
}
