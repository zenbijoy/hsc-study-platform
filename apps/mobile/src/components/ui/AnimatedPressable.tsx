import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { triggerHaptic, HapticFeedbackType } from '@/src/theme/haptics';
import { motion, useReducedMotionPreference } from '@/src/theme/motion';

export interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  haptic?: HapticFeedbackType | 'none';
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function AnimatedPressable({
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  haptic = 'light',
  scaleTo = motion.scale.press,
  style,
  className = '',
  ...rest
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotionPreference();

  const handlePressIn = (e: any) => {
    if (disabled) return;
    if (haptic !== 'none') {
      triggerHaptic(haptic);
    }
    if (!reducedMotion) {
      Animated.spring(scaleAnim, {
        toValue: scaleTo,
        useNativeDriver: true,
        damping: motion.spring.snappy.damping,
        stiffness: motion.spring.snappy.stiffness,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (disabled) return;
    if (!reducedMotion) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: motion.spring.gentle.damping,
        stiffness: motion.spring.gentle.stiffness,
      }).start();
    }
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className={className}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          !reducedMotion && { transform: [{ scale: scaleAnim }] },
          disabled && { opacity: 0.5 },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
